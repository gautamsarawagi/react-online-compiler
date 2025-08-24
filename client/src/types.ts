export interface ExecutionResult {
  component?: React.ComponentType
  error?: string
}

export interface EditorSettings {
  fontSize: number
  tabSize: number
  theme: 'light' | 'dark'
  wordWrap: boolean
} 