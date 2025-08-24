import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div className="code-editor">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  )
}
