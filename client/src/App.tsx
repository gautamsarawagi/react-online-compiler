import { useState, useRef, useEffect } from "react";
import { CodeExecutor } from "./components/CodeExecutor";
import { CodeEditor } from "./components/CodeEditor";
import { VisualEditor } from "./components/VisualEditor";
import { sampleString } from "./utils/code";
import type { ExecutionResult } from "./types";
import "./App.css";

function App() {
  const [code, setCode] = useState(sampleString.trim());
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'visual'>('visual');
  
  const codeExecutorRef = useRef<{ executeCode: (code: string) => Promise<void> }>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    executeCode(newCode);
  };

  const executeCode = async (codeToExecute?: string) => {
    if (!codeExecutorRef.current) return;
    
    setIsExecuting(true);
    try {
      await codeExecutorRef.current.executeCode(codeToExecute || code);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleElementUpdate = (updatedCode: string) => {
    setCode(updatedCode);
    executeCode(updatedCode);
  };

  useEffect(() => {
    if (code && executionResult !== null) {
      executeCode();
    }
  }, [code]);

  useEffect(() => {
    if (executionResult === null && codeExecutorRef.current) {
     const timer = setTimeout(() => {
        executeCode();
      }, 100);  
      
      return () => clearTimeout(timer);
    }
  }, [executionResult]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>React Visual Editor</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            Visual Editor
          </button>
          <button 
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Code Editor
          </button>
        </div>
      </div>
      
      <div className="app-body">
        <CodeExecutor
          ref={codeExecutorRef}
          onResult={setExecutionResult}
        />
        
        {activeTab === 'code' ? (
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            isExecuting={isExecuting}
          />
        ) : (
          <VisualEditor
            code={code}
            executionResult={executionResult}
            isExecuting={isExecuting}
            onCodeUpdate={handleElementUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default App;