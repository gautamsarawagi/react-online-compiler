import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CodeEditor } from './CodeEditor'
import { Preview } from './Preview'
import { useCodeExecution } from '../hooks/useCodeExecution'
import { DEFAULT_CODE } from '../utils/default-code'
import './Project.css'

export const Project = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState(DEFAULT_CODE)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview')
  const [editMode, setEditMode] = useState(false)
  
  const { component, error: executionError, isLoading: executionLoading } = useCodeExecution(code)

  const { data: componentData, isLoading: fetchLoading, error: fetchError } = useQuery({
    queryKey: ['component', projectId],
    queryFn: async () => {
      if (!projectId) return null
      const response = await fetch(`/api/preview/${projectId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message)
      }
      return response.json()
    },
    enabled: !!projectId
  })

  const updateComponentMutation = useMutation({
    mutationFn: async ({ id, code }: { id: string, code: string }) => {
      const response = await fetch(`/api/component/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message)
      }
      
      return response.json()
    },
    onSuccess: () => {
      alert('Component updated successfully')
    }
  })

  // Set code when component data is fetched
  useEffect(() => {
    if (componentData?.data?.code) {
      setCode(componentData.data.code)
    }
  }, [componentData])

  const handleSave = useCallback(() => {
    if (projectId && code) {
      updateComponentMutation.mutate({ id: projectId, code })
    }
  }, [projectId, code, updateComponentMutation])
  
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode)
  }, [])

  const handleCodeUpdate = useCallback((updatedCode: string) => {
    setCode(updatedCode)
  }, [])

  const handleBackToHome = () => {
    navigate('/')
  }

  if (fetchLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading component...</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="app">
        <div className="error-container">
          <h3>Error Loading Component</h3>
          <p>{fetchError.message}</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 onClick={handleBackToHome} style={{cursor: 'pointer'}}>React Code Editor</h1>
        </div>
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
          {activeTab === 'preview' && (
            <button 
              className={`tab edit-mode-btn ${editMode ? 'active' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Exit Edit' : 'Edit Mode'}
            </button>
          )}
          <button 
            className={`tab save-btn ${updateComponentMutation.isPending ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={updateComponentMutation.isPending}
          >
            {updateComponentMutation.isPending ? 'Saving...' : 'Save'}
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
            error={executionError}
            isLoading={executionLoading}
            editMode={editMode}
            code={code}
            onCodeUpdate={handleCodeUpdate}
          />
        )}
      </main>
    </div>
  )
}