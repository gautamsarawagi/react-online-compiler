import { useState, useRef, useCallback, type FC, Suspense, type ComponentType } from "react"
import { PropertyPanel } from "./PropertyPanel"
import "./Preview.css"
import { extractElementProperties, type ElementProperties } from "../utils/PreviewUtils"

interface PreviewProps {
  component: ComponentType | null
  error: string | null
  isLoading: boolean
  editMode: boolean
  code: string
  onCodeUpdate: (code: string) => void
}

interface SelectedElement {
  element: HTMLElement
  elementSelector: string
  properties: ElementProperties
}

export const Preview: FC<PreviewProps> = ({ component: Component, error, isLoading, editMode, code, onCodeUpdate }) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const getElementSelector = (element: HTMLElement): string => {
    if (!previewRef.current) return ""
    
    const tagName = element.tagName.toLowerCase()
    const textContent = element.textContent?.trim() || ""
    const parent = element.parentElement
    const siblings = parent ? Array.from(parent.children) : []
    const index = siblings.indexOf(element)
    
    return `${tagName}:nth-child(${index + 1}):contains("${textContent.substring(0, 20)}")`
  }

  const handleElementClick = useCallback(
    (e: React.MouseEvent) => {
      if (!editMode) return

      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement

      if (target.closest(".property-panel") || target.closest(".element-overlay")) {
        return
      }

      const elementSelector = getElementSelector(target)
      const properties = extractElementProperties(target)

      setSelectedElement({
        element: target,
        elementSelector,
        properties,
      })
    },
    [editMode],
  )

  const updateCodeWithProperty = useCallback((property: keyof ElementProperties, value: string, selectedEl: SelectedElement) => {
    
    let updatedCode = code

    if (property === "textContent") {
      updatedCode = updateTextContentInCode(code, selectedEl, value)
    } else {
      updatedCode = updateStyleInCode(code, selectedEl, property, value)
    }
    
    onCodeUpdate(updatedCode)
  }, [code, onCodeUpdate])

  const handlePropertyChange = useCallback(
    (property: keyof ElementProperties, value: string) => {
      if (!selectedElement) return

      const { element } = selectedElement

      if (property === "textContent") {
        element.textContent = value
      } else {
        (element.style as any)[property] = value
      }

      setSelectedElement((prev) =>
        prev
          ? {
              ...prev,
              properties: {
                ...prev.properties,
                [property]: value,
              },
            }
          : null,
      )

      updateCodeWithProperty(property, value, selectedElement)
    },
    [selectedElement, updateCodeWithProperty],
  )

  const updateTextContentInCode = (code: string, selectedEl: SelectedElement, newText: string): string => {    
    const lines = code.split('\n')
    const { element } = selectedEl
    const originalText = element.textContent?.trim() || ""
    const tagName = element.tagName.toLowerCase()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes(`>${originalText}<`)) {
        lines[i] = line.replace(`>${originalText}<`, `>${newText}<`)
        return lines.join('\n')
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      const tagRegex = new RegExp(`(<${tagName}[^>]*>)([^<]*)(</|<)`)
      const match = line.match(tagRegex)
      
      if (match) {
        const currentContent = match[2].trim()
        
        if (currentContent && !currentContent.includes('{')) {
          lines[i] = line.replace(tagRegex, `$1${newText}$3`)
          return lines.join('\n')
        }
      }
    }
    
    return lines.join('\n')
  }

  const updateStyleInCode = (code: string, selectedEl: SelectedElement, property: string, value: string): string => {
    
    const lines = code.split('\n')
    const { element } = selectedEl
    const tagName = element.tagName.toLowerCase()
    const textContent = element.textContent?.trim() || ""
    const styleProperty = property === 'backgroundColor' ? 'backgroundColor' : property
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.includes(`<${tagName}`) && line.includes(`>${textContent}<`)) {
      } else if (line.includes(`<${tagName}`)) {

        const tagRegex = new RegExp(`<${tagName}[^>]*>([^<]*)<`)
        const match = line.match(tagRegex)
        
        if (match) {
          const lineTextContent = match[1].trim()

          if (!lineTextContent.includes('{') || textContent === '') {
          } else {
            continue
          }
        } else {
          continue
        }
      } else {
        continue
      }
      
      {
        // Check if style attribute already exists
        const styleMatch = line.match(/style=\{\{([^}]*)\}\}/)
        
        if (styleMatch) {
          // Parse and update existing styles
          const existingStyles = styleMatch[1].trim()
          const styles: string[] = []
          
          // Keep existing styles except the one we're updating
          if (existingStyles) {
            const parts = existingStyles.split(',')
            for (const part of parts) {
              const trimmed = part.trim()
              if (trimmed && !trimmed.startsWith(styleProperty + ':')) {
                styles.push(trimmed)
              }
            }
          }
          
          // Add the new style
          styles.push(`${styleProperty}: '${value}'`)
          
          // Replace the style attribute
          const newStyleContent = styles.join(', ')
          lines[i] = line.replace(
            /style=\{\{[^}]*\}\}/,
            `style={{${newStyleContent}}}`
          )
        } else {
          // Add new style attribute
          const tagMatch = line.match(new RegExp(`<${tagName}([^>]*)`))
          if (tagMatch) {
            const newStyleAttr = ` style={{${styleProperty}: '${value}'}}`
            lines[i] = line.replace(
              new RegExp(`<${tagName}([^>]*)`),
              `<${tagName}$1${newStyleAttr}`
            )
          }
        }
        break
      }
    }
    
    return lines.join('\n')
  }

  if (isLoading) {
    return (
      <div className="preview-container">
        <div className="preview-loading">
          <div className="loading-spinner" />
          <p>Compiling...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="preview-container">
        <div className="preview-error">
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="preview-container">
        <div className="preview-empty">
          <p>Write some React code to see it rendered here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`preview-container ${editMode ? "edit-mode" : ""}`}>
      <div ref={previewRef} className="preview-area" onClick={editMode ? handleElementClick : undefined}>
        <Suspense fallback={<div className="loading-spinner" />}>
          <Component />
        </Suspense>

        {selectedElement && editMode && (
          <div
            className="element-overlay"
            style={{
              position: "absolute",
              left: selectedElement.element.offsetLeft,
              top: selectedElement.element.offsetTop,
              width: selectedElement.element.offsetWidth,
              height: selectedElement.element.offsetHeight,
              border: "2px solid #3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          />
        )}
      </div>

      {editMode && selectedElement && (
        <PropertyPanel
          selectedElement={selectedElement}
          onPropertyChange={handlePropertyChange}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  )
}