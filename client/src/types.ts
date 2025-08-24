export interface ExecutionResult {
  component?: React.ComponentType;
  error?: string;
  executionTime?: number;
  compiledCode?: string;
}

export interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  category: 'basic' | 'hooks' | 'advanced' | 'interactive';
}

export interface ComponentData {
  id: string;
  code: string;
  ast?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  theme: 'light' | 'dark';
  wordWrap: boolean;
  minimap: boolean;
} 