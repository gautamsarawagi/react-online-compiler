"use client"

import { useState, useEffect, useCallback } from "react"
import * as React from "react"
import { transform } from "@babel/standalone"

interface UseCodeExecutionResult {
  component: React.ComponentType | null
  error: string | null
  isLoading: boolean
}

function getReactModules() {
  const modules: Record<string, any> = { React }

  const reactKeys = Object.keys(React).filter(
    (key) =>
      typeof (React as any)[key] === "function" &&
      (key.startsWith("use") || ["memo", "forwardRef", "lazy", "createContext", "Fragment", "Suspense"].includes(key)),
  )

  reactKeys.forEach((key) => {
    modules[key] = (React as any)[key]
  })

  return modules
}

function detectComponent(moduleScope: any, executedResult: any): React.ComponentType {
  if (typeof executedResult === "function") {
    return executedResult
  }

  if (moduleScope.module?.exports?.default && typeof moduleScope.module.exports.default === "function") {
    return moduleScope.module.exports.default
  }

  if (moduleScope.exports?.default && typeof moduleScope.exports.default === "function") {
    return moduleScope.exports.default
  }

  const scopeKeys = Object.keys(moduleScope)
  for (const key of scopeKeys) {
    const value = moduleScope[key]
    if (
      typeof value === "function" &&
      key[0] === key[0].toUpperCase() &&
      key !== "React" &&
      key !== "Fragment" &&
      !key.startsWith("use") 
    ) {
      return value
    }
  }

  throw new Error("No valid React component found. Make sure to export your component as default.")
}

export function useCodeExecution(code: string): UseCodeExecutionResult {
  const [component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeCode = useCallback(async (sourceCode: string) => {
    if (!sourceCode.trim()) {
      setComponent(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = transform(sourceCode, {
        presets: ["react", "env"],
        plugins: ["proposal-class-properties"],
      })

      if (!result.code) {
        throw new Error("Failed to transform code")
      }

      const reactModules = getReactModules()
      const moduleExports = {}
      const moduleScope = {
        ...reactModules,
        exports: moduleExports,
        module: { exports: moduleExports },
        require: (name: string) => {
          if (name === "react") return React
          throw new Error(`Module "${name}" not found`)
        },
      }

      const func = new Function(...Object.keys(moduleScope), result.code)

      const executedResult = func.apply(moduleScope, Object.values(moduleScope))

      const Component = detectComponent(moduleScope, executedResult)

      setComponent(() => Component)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)
      setComponent(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeCode(code)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [code, executeCode])

  return { component, error, isLoading }
}
