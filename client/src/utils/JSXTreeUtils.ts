import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import type { Node } from 'acorn'

// Extend acorn with JSX support for parsing JSX syntax
const JSXParser = Parser.extend(jsx())

interface JSXElement extends Node {
  type: 'JSXElement'
  openingElement: JSXOpeningElement
  children: Node[]
}

interface JSXOpeningElement extends Node {
  type: 'JSXOpeningElement'
  name: JSXIdentifier
  attributes: JSXAttribute[]
}

interface JSXIdentifier extends Node {
  type: 'JSXIdentifier'
  name: string
}

interface JSXAttribute extends Node {
  type: 'JSXAttribute'
  name: JSXIdentifier
  value?: JSXExpressionContainer | JSXLiteral | null
}

interface JSXExpressionContainer extends Node {
  type: 'JSXExpressionContainer'
  expression: Node
}

interface JSXLiteral extends Node {
  type: 'Literal'
  value: string
}

interface ElementPath {
  tagName: string
  index: number
}

/**
 * JSXTreeManipulator provides AST-based manipulation of JSX code.
 * It parses JSX into an Abstract Syntax Tree and allows precise 
 * modifications without fragile string manipulation.
 */
export class JSXTreeManipulator {
  private ast: Node
  private sourceCode: string
  private jsxOffset: number

  constructor(code: string) {
    this.sourceCode = code
    
    // Extract the JSX part (return statement content)
    const jsxMatch = code.match(/return\s*\(([\s\S]*)\)/)
    if (!jsxMatch) {
      throw new Error('No return statement with JSX found')
    }
    
    const jsxCode = jsxMatch[1].trim()
    this.jsxOffset = code.indexOf(jsxCode)
    
    try {
      // Parse just the JSX expression into an AST
      this.ast = JSXParser.parseExpressionAt(jsxCode, 0, {
        ecmaVersion: 2020,
        sourceType: 'module',
        locations: true
      })
    } catch (error) {
      throw error
    }
  }

  findElementByPath(path: ElementPath[]): JSXElement | null {
    if (path.length === 0) {
      return this.ast.type === 'JSXElement' ? (this.ast as JSXElement) : null
    }
    
    let current: Node = this.ast
    
    if (current.type === 'JSXElement') {
      const rootElement = current as JSXElement
      const firstPath = path[0]
      
      if (path.length === 1) {
        if (rootElement.openingElement.name.name.toLowerCase() === firstPath.tagName.toLowerCase()) {
          return rootElement
        }
        return null
      }
      
      if (rootElement.openingElement.name.name.toLowerCase() === firstPath.tagName.toLowerCase()) {
        current = rootElement
        
        for (let i = 1; i < path.length; i++) {
          const { tagName, index } = path[i]
          
          if (current.type !== 'JSXElement') return null
          
          const element = current as JSXElement
          const children = element.children.filter(child => child.type === 'JSXElement')
          
          let childIndex = 0
          let found = false
          
          for (const child of children) {
            const childElement = child as JSXElement
            if (childElement.openingElement.name.name.toLowerCase() === tagName.toLowerCase()) {
              if (childIndex === index) {
                current = child
                found = true
                break
              }
              childIndex++
            }
          }
          
          if (!found) return null
        }
        
        return current as JSXElement
      }
    }
    
    return null
  }

  updateElementStyle(path: ElementPath[], property: string, value: string): string {
    const element = this.findElementByPath(path)
    if (!element) return this.sourceCode
    
    let styleAttr = element.openingElement.attributes.find(
      attr => attr.type === 'JSXAttribute' && attr.name.name === 'style'
    )
    
    const newStyleValue = this.buildStyleValue(styleAttr, property, value)
    
    return this.replaceElementAttribute(element, 'style', newStyleValue)
  }

  updateElementText(path: ElementPath[], newText: string): string {
    const element = this.findElementByPath(path)
    if (!element) return this.sourceCode
    
    const textChild = element.children.find(child => child.type === 'JSXText')
    
    if (textChild) {
      return this.replaceNodeContent(textChild, newText)
    }
    
    return this.sourceCode
  }

  private buildStyleValue(existingStyleAttr: any, property: string, value: string): string {
    let styleProps: Record<string, string> = {}
    
    // Parse existing styles if they exist
    if (existingStyleAttr && existingStyleAttr.value) {
      // Handle JSX expression {{}}, literal string, etc.
      if (existingStyleAttr.value.type === 'JSXExpressionContainer') {
        const expr = existingStyleAttr.value.expression
        if (expr.type === 'ObjectExpression') {
          // Parse object properties
          for (const prop of expr.properties) {
            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              const key = prop.key.name
              let val = ''
              
              if (prop.value.type === 'Literal') {
                val = prop.value.value
              } else if (prop.value.type === 'TemplateLiteral') {
                val = prop.value.quasis[0]?.value?.raw || ''
              }
              
              styleProps[key] = val
            }
          }
        }
      }
    }
    
    // Update the property
    styleProps[property] = value
    
    // Build new style object
    const styleEntries = Object.entries(styleProps)
      .map(([key, val]) => `${key}: '${val}'`)
      .join(', ')
    
    return `{{${styleEntries}}}`
  }

  private replaceElementAttribute(element: JSXElement, attrName: string, attrValue: string): string {
    const start = element.openingElement.start
    const end = element.openingElement.end
    
    if (start === undefined || end === undefined) {
      return this.sourceCode
    }
    
    const absoluteStart = this.jsxOffset + start
    const absoluteEnd = this.jsxOffset + end
    
    const beforeElement = this.sourceCode.substring(0, absoluteStart)
    const afterElement = this.sourceCode.substring(absoluteEnd)
    
    const tagName = element.openingElement.name.name
    const existingAttrs = element.openingElement.attributes
      .filter(attr => attr.type === 'JSXAttribute' && attr.name.name !== attrName)
      .map(attr => {
        const name = attr.name.name
        if (attr.value) {
          if (attr.value.type === 'Literal') {
            return `${name}="${(attr.value as JSXLiteral).value}"`
          } else if (attr.value.type === 'JSXExpressionContainer') {
            const valueStart = attr.value.start
            const valueEnd = attr.value.end
            if (valueStart !== undefined && valueEnd !== undefined) {
              return `${name}={${this.sourceCode.substring(this.jsxOffset + valueStart, this.jsxOffset + valueEnd)}}`
            }
          }
        }
        return name
      })
    
    const newAttr = `${attrName}=${attrValue}`
    const allAttrs = [...existingAttrs, newAttr]
    
    const newTag = allAttrs.length > 0 
      ? `<${tagName} ${allAttrs.join(' ')}>`
      : `<${tagName}>`
    
    return beforeElement + newTag + afterElement
  }

  private replaceNodeContent(node: Node, newContent: string): string {
    const start = node.start
    const end = node.end
    
    if (start === undefined || end === undefined) {
      return this.sourceCode
    }
    
    const absoluteStart = this.jsxOffset + start
    const absoluteEnd = this.jsxOffset + end
    
    const before = this.sourceCode.substring(0, absoluteStart)
    const after = this.sourceCode.substring(absoluteEnd)
    
    return before + newContent + after
  }

  static getElementPath(element: HTMLElement, containerRef: HTMLElement | null): ElementPath[] {
    if (!containerRef) return []
    
    const path: ElementPath[] = []
    let current = element
    
    // Traverse up to the container, including the element itself and stopping at container's first child
    while (current && current !== containerRef) {
      const parent: HTMLElement | null = current.parentElement
      if (parent && parent !== containerRef) {
        const siblings = Array.from(parent.children)
        const sameTagSiblings = siblings.filter((sibling: Element) => 
          sibling.tagName.toLowerCase() === current.tagName.toLowerCase()
        )
        const index = sameTagSiblings.indexOf(current)
        
        path.unshift({
          tagName: current.tagName.toLowerCase(),
          index: index
        })
      } else if (parent === containerRef) {
        // This is a direct child of the container (the root JSX element)
        const siblings = Array.from(parent.children)
        const sameTagSiblings = siblings.filter((sibling: Element) => 
          sibling.tagName.toLowerCase() === current.tagName.toLowerCase()
        )
        const index = sameTagSiblings.indexOf(current)
        
        path.unshift({
          tagName: current.tagName.toLowerCase(),
          index: index
        })
        break
      }
      current = parent!
    }
    
    return path
  }
} 