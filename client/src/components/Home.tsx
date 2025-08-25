import { useState } from "react"
import { DEFAULT_CODE } from "../utils/default-code"
import './Home.css'
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

export const Home = () => {
  const [code, setCode] = useState("")
  const navigate = useNavigate()

  const createComponentMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/component', {
        method: 'POST',
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
    onSuccess: (data) => {
      navigate(`/project/${data.data.id}`)
    }
  })

  const handleCreate = () => {
    if (code.trim()) {
      createComponentMutation.mutate(code.trim())
      setCode("")
    }
  }

  const handleLoadDefaultCode = () => {
    setCode(DEFAULT_CODE)       
  }

  return (
    <div className="home">
      <div className="controls">
        <button className="default-btn" onClick={handleLoadDefaultCode}>
          Load Default Code
        </button>
        <button 
          className="create-btn" 
          onClick={handleCreate} 
          disabled={!code.trim() || createComponentMutation.isPending}
        >
          {createComponentMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </div>
      
      {createComponentMutation.isError && (
        <div className="error-message">
         {createComponentMutation.error.message}
        </div>
      )}
      
      <textarea 
        placeholder="Paste your React component code here..."
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
        className="code-editor"
        spellCheck={false}
      />
    </div>
  )
}