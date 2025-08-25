export interface ElementProperties {
    textContent: string
    color: string
    fontSize: string
    fontWeight: string
    backgroundColor: string
    padding: string
    margin: string
}

export const isLeafNode = (element: HTMLElement): boolean => {
  const hasChildElements = Array.from(element.children).some(child => child.nodeType === Node.ELEMENT_NODE)
  
  if (hasChildElements) return false
  
  const textContent = element.textContent?.trim() || ""
  
  const hasDynamicPattern = /:\s*\d+/.test(textContent) || 
                           /\d+\s*(item|count|total|number|value|score)/i.test(textContent)
  
  return !!textContent && textContent.length > 0 && !hasDynamicPattern
}

export const extractElementProperties = (element: HTMLElement): ElementProperties => {
    const computedStyle = window.getComputedStyle(element)
    const isLeaf = isLeafNode(element)

    return {
      textContent: isLeaf ? (element.textContent?.trim() || "") : "",
      color: computedStyle.color || "#000000",
      fontSize: computedStyle.fontSize || "16px",
      fontWeight: computedStyle.fontWeight || "normal",
      backgroundColor: computedStyle.backgroundColor || "transparent",
      padding: computedStyle.padding || "0px",
      margin: computedStyle.margin || "0px",
    }
}