export const panelStyles = `
.property-panel {
  width: 320px;
  background: #f8f9fa;
  border-left: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.property-panel-header {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.property-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.element-info {
  padding: 16px;
  background: #e5f3ff;
  border-bottom: 1px solid #bfdbfe;
}

.element-tag {
  font-weight: 600;
  color: #1e40af;
  font-size: 14px;
  text-transform: uppercase;
}

.element-path {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  word-break: break-all;
}

.property-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e1e5e9;
}

.property-tabs .tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.property-tabs .tab:hover {
  background: #f9fafb;
  color: #374151;
}

.property-tabs .tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #f8faff;
}

.property-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.property-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.property-input,
.property-textarea,
.property-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  color: #1a1a1a;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-input:focus,
.property-textarea:focus,
.property-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.property-textarea {
  resize: vertical;
  min-height: 60px;
}

.color-input-group {
  display: flex;
  gap: 8px;
}

.color-picker {
  width: 40px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 2px;
}

.color-input-group .property-input {
  flex: 1;
}

.property-select {
  cursor: pointer;
}
`