export interface ElementProperties {
    textContent: string
    color: string
    fontSize: string
    fontWeight: string
    backgroundColor: string
    padding: string
    margin: string
}

export const extractElementProperties = (element: HTMLElement): ElementProperties => {
    const computedStyle = window.getComputedStyle(element)

    return {
      textContent: element.textContent?.trim() || "",
      color: computedStyle.color || "#000000",
      fontSize: computedStyle.fontSize || "16px",
      fontWeight: computedStyle.fontWeight || "normal",
      backgroundColor: computedStyle.backgroundColor || "transparent",
      padding: computedStyle.padding || "0px",
      margin: computedStyle.margin || "0px",
    }
}