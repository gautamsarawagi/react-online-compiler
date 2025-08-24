import { useState, useCallback } from 'react'
import { CodeEditor } from './components/CodeEditor'
import { Preview } from './components/Preview'
import { useCodeExecution } from './hooks/useCodeExecution'
import './App.css'

const DEFAULT_CODE = `import React, { useState } from 'react'

function MyComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Hello, world!</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}

export default MyComponent`

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview')
  
  const { component, error, isLoading } = useCodeExecution(code)
  
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>React Code Editor</h1>
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button 
            className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Code
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'editor' ? (
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
          />
        ) : (
          <Preview
            component={component}
            error={error}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  )
}

export default App
