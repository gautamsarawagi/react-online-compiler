import { useState, useRef, useCallback, type FC, Suspense, type ComponentType } from "react"
import { PropertyPanel } from "./PropertyPanel"
import "./Preview.css"
import { extractElementProperties, type ElementProperties } from "../utils/PreviewUtils"
import { JSXTreeManipulator } from "../utils/JSXTreeUtils"

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
  elementPath: Array<{tagName: string, index: number}>
  properties: ElementProperties
}

export const Preview: FC<PreviewProps> = ({ component: Component, error, isLoading, editMode, code, onCodeUpdate }) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)  

  const getElementSelector = (element: HTMLElement): string => {
    const path = JSXTreeManipulator.getElementPath(element, previewRef.current)
    return path.map(p => `${p.tagName}:nth-child(${p.index + 1})`).join(' > ')
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
      const elementPath = JSXTreeManipulator.getElementPath(target, previewRef.current)
      const properties = extractElementProperties(target)

      setSelectedElement({
        element: target,
        elementSelector,
        elementPath,
        properties,
      })
    },
    [editMode],
  )

  const updateCodeWithProperty = useCallback((property: keyof ElementProperties, value: string, selectedEl: SelectedElement) => {
    try {
      const manipulator = new JSXTreeManipulator(code)
      const elementPath = selectedEl.elementPath
      
      let updatedCode: string
      
      if (property === "textContent") {
        updatedCode = manipulator.updateElementText(elementPath, value)
      } else {
        updatedCode = manipulator.updateElementStyle(elementPath, property, value)
      }
      
      onCodeUpdate(updatedCode)
    } catch (error) {
      console.error('Failed to update code:', error)
      onCodeUpdate(code)
    }
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