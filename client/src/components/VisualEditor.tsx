import React, { useState, useRef } from 'react';
import type { ExecutionResult } from '../types';
import { PropertyEditor } from './PropertyEditor';

interface VisualEditorProps {
  code: string;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  onCodeUpdate: (code: string) => void;
}

interface SelectedElement {
  element: HTMLElement;
  path: string;
  rect: DOMRect;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  code, 
  executionResult,
  isExecuting,
  onCodeUpdate,
}) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    
    if (target.closest('.element-overlay') || target.closest('.edit-panel')) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const previewRect = previewRef.current?.getBoundingClientRect();
    
    if (previewRect) {
      const relativeRect = new DOMRect(
        rect.left - previewRect.left,
        rect.top - previewRect.top,
        rect.width,
        rect.height
      );

      setSelectedElement({
        element: target,
        path: getElementPath(target),
        rect: relativeRect,
      });
    }
  };

  const getElementPath = (element: HTMLElement): string => {
    const path: string[] = [];
    let current = element;
    
    while (current && current !== previewRef.current) {
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(current);
        const tagName = current.tagName.toLowerCase();
        path.unshift(`${tagName}:${index}`);
      }
      current = parent!;
    }
    
    return path.join(' > ');
  };

  const getEditableProps = (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    
    return {
      textContent: element.textContent || '',
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontSize: style.fontSize,
      padding: style.padding,
      margin: style.margin,
      borderRadius: style.borderRadius,
      border: style.border,
    };
  };

  const updateElementProperty = (property: string, value: string) => {
    if (!selectedElement) return;

    const { element } = selectedElement;
    
    if (property === 'textContent') {
      element.textContent = value;
    } else {
      (element.style as any)[property] = value;
    }

    updateCodeWithChanges(property, value);
  };

  const updateCodeWithChanges = (property: string, value: string) => {
    let updatedCode = code;
    
    if (property === 'textContent') {
      const textMatch = code.match(/>\s*([^<]+)\s*</);
      if (textMatch) {
        updatedCode = code.replace(textMatch[1], value);
      }
    } else if (property.startsWith('style.')) {
      const styleProp = property.replace('style.', '');
      const styleRegex = new RegExp(`${styleProp}:\\s*[^;,}]+`, 'g');
      updatedCode = code.replace(styleRegex, `${styleProp}: '${value}'`);
    }
    
    onCodeUpdate(updatedCode);
  };

  const handleOutsideClick = () => {
    setSelectedElement(null);
    setIsEditMode(false);
  };

  return (
    <div className="visual-editor">
      <div className="visual-editor-toolbar">
        <div className="toolbar-left">
          <span className="status">
            {isExecuting ? 'Loading...' : 'Ready'}
          </span>
        </div>
        <div className="toolbar-right">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`tool-btn ${isEditMode ? 'active' : ''}`}
          >
            Edit Mode
          </button>
        </div>
      </div>

      <div className="visual-editor-content">
        <div 
          ref={previewRef}
          className={`component-preview ${isEditMode ? 'edit-mode' : ''}`}
          onClick={isEditMode ? handleElementClick : handleOutsideClick}
        >
          {isExecuting ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading component...</p>
            </div>
          ) : executionResult?.error ? (
            <div className="error-display">
              <h3> Error</h3>
              <pre>{executionResult.error}</pre>
            </div>
          ) : executionResult?.component ? (
            <executionResult.component />
          ) : (
            <div className="empty-state">
              <p>Paste your React component code and it will appear here</p>
            </div>
          )}

          {selectedElement && isEditMode && (
            <div
              className="element-overlay"
              style={{
                position: 'absolute',
                left: selectedElement.rect.left,
                top: selectedElement.rect.top,
                width: selectedElement.rect.width,
                height: selectedElement.rect.height,
                border: '2px solid #3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <div className="element-label">
                {selectedElement.element.tagName.toLowerCase()}
              </div>
            </div>
          )}
        </div>

        {selectedElement && isEditMode && (
          <div className="edit-panel">
            <h3>Edit Element</h3>
            <div className="element-info">
              <strong>Element:</strong> {selectedElement.element.tagName.toLowerCase()}
              <br />
              <strong>Path:</strong> {selectedElement.path}
            </div>

            <div className="property-editors">
              <PropertyEditor
                label="Text Content"
                value={selectedElement.element.textContent || ''}
                onChange={(value) => updateElementProperty('textContent', value)}
              />
              
              <PropertyEditor
                label="Background Color"
                type="color"
                value={getEditableProps(selectedElement.element).backgroundColor}
                onChange={(value) => updateElementProperty('style.backgroundColor', value)}
              />
              
              <PropertyEditor
                label="Text Color"
                type="color"
                value={getEditableProps(selectedElement.element).color}
                onChange={(value) => updateElementProperty('style.color', value)}
              />
              
              <PropertyEditor
                label="Font Size"
                value={getEditableProps(selectedElement.element).fontSize}
                onChange={(value) => updateElementProperty('style.fontSize', value)}
              />
              
              <PropertyEditor
                label="Padding"
                value={getEditableProps(selectedElement.element).padding}
                onChange={(value) => updateElementProperty('style.padding', value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

