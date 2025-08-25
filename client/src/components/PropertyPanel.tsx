import { useState, type FC } from "react"
import './PropertyPanel.css'

interface ElementProperties {
  textContent: string
  color: string
  fontSize: string
  fontWeight: string
  backgroundColor: string
  padding: string
  margin: string
}

interface SelectedElement {
  element: HTMLElement
  elementSelector: string
  properties: ElementProperties
}

interface PropertyPanelProps {
  selectedElement: SelectedElement
  onPropertyChange: (property: keyof ElementProperties, value: string) => void
  onClose: () => void
}

export const PropertyPanel: FC<PropertyPanelProps> = ({ selectedElement, onPropertyChange, onClose }) => {
  const [activeTab, setActiveTab] = useState<"content" | "style">("style")

  const renderInput = (key: keyof ElementProperties, label: string, type: "text" | "color" = "text") => {
    const value = selectedElement.properties[key]

    if (type === "color") {
      return (
        <div className="property-group">
          <label>{label}</label>
          <div className="color-input">
            <input type="color" value={normalizeColor(value)} onChange={(e) => onPropertyChange(key, e.target.value)} />
            <input
              type="text"
              value={value}
              onChange={(e) => onPropertyChange(key, e.target.value)}
              placeholder="#000000"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="property-group">
        <label>{label}</label>
        {key === "textContent" ? (
          <textarea value={value} onChange={(e) => onPropertyChange(key, e.target.value)} rows={3} />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onPropertyChange(key, e.target.value)}
            placeholder={getPlaceholder(key)}
          />
        )}
      </div>
    )
  }

  const normalizeColor = (color: string): string => {
    if (color.startsWith("#")) return color
    if (color === "transparent") return "#ffffff"
    return "#000000"
  }

  const getPlaceholder = (key: keyof ElementProperties): string => {
    const placeholders = {
      fontSize: "16px",
      fontWeight: "normal",
      padding: "10px",
      margin: "0px",
      textContent: "",
      color: "",
      backgroundColor: "",
    }
    return placeholders[key] || ""
  }

  return (
    <div className="property-panel">
      <div className="panel-header">
        <h3>Edit {selectedElement.element.tagName.toLowerCase()}</h3>
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <div className="panel-tabs">
        {selectedElement.properties.textContent !== "" && (
          <button className={activeTab === "content" ? "active" : ""} onClick={() => setActiveTab("content")}>
            Content
          </button>
        )}
        <button className={activeTab === "style" ? "active" : ""} onClick={() => setActiveTab("style")}>
          Style
        </button>
      </div>

      <div className="panel-content">
        {activeTab === "content" && (
          <div className="property-section">{renderInput("textContent", "Text Content")}</div>
        )}

        {activeTab === "style" && (
          <div className="property-section">
            {renderInput("color", "Text Color", "color")}
            {renderInput("backgroundColor", "Background", "color")}
            {renderInput("fontSize", "Font Size")}
            {renderInput("fontWeight", "Font Weight")}
            {renderInput("padding", "Padding")}
            {renderInput("margin", "Margin")}
          </div>
        )}
      </div>
    </div>
  )
}