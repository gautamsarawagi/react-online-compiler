import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { esbuildService } from '../utils/esbuildService';
import type { ExecutionResult } from '../types';

interface CodeExecutorProps {
  onResult: (result: ExecutionResult) => void;
}

export interface CodeExecutorRef {
  executeCode: (code: string) => Promise<void>;
}

export const CodeExecutor = forwardRef<CodeExecutorRef, CodeExecutorProps>(
  ({ onResult }, ref) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      
      const initializeEsbuild = async () => {
        try {
          await esbuildService.initialize();

          if (mounted) {
            setIsInitialized(true);
            setInitError(null);
          }
        } catch (error) {
          if (mounted) {
            setInitError(error instanceof Error ? error.message : 'Failed to initialize esbuild');
            onResult({ error: 'Failed to initialize code executor' });
          }
        }
      };

      initializeEsbuild();

      return () => {
        mounted = false;
      };
    }, [onResult]);

    const transformCode = async (code: string): Promise<string> => {
      if (!esbuildService.isInitialized()) {
        throw new Error('Code executor not initialized');
      }

      try {
        let cleanCode = code.trim();
        
        cleanCode = cleanCode.replace(
          /import\s+[^;]+;?\s*/g,
          ''
        );
        
        const result = await esbuildService.transform(cleanCode, {
          loader: 'tsx',
          jsx: 'transform',
          jsxFactory: 'React.createElement',
          jsxFragment: 'React.Fragment',
          target: 'es2020',
        });

        let transformedCode = result.code.trim();
        
        transformedCode = transformedCode.replace(
          /import\s+[^;]+;?\s*/g,
          ''
        );
        
        if (transformedCode.includes('export default')) {
          transformedCode = transformedCode.replace(
            /export\s+default\s+(\w+);?\s*/,
            'return $1;'
          );
        } else if (transformedCode.includes('export')) {
          transformedCode = transformedCode.replace(
            /export\s+(const|let|var|function|class)\s+/g,
            '$1 '
          );
          
          transformedCode = transformedCode.replace(
            /export\s*\{[^}]*\}\s*;?/g,
            ''
          );
        }

        if (!transformedCode.includes('return ')) {
          const componentMatches = [
            ...transformedCode.matchAll(/function\s+([A-Z]\w*)/g),
            ...transformedCode.matchAll(/(?:const|let|var)\s+([A-Z]\w*)\s*=/g)
          ];
          
          if (componentMatches.length > 0) {
            const lastMatch = componentMatches[componentMatches.length - 1];
            const componentName = lastMatch[1];
            transformedCode += `\nreturn ${componentName};`;
          } else {
            const funcMatch = transformedCode.match(/function\s+(\w+)/);
            if (funcMatch) {
              transformedCode += `\nreturn ${funcMatch[1]};`;
            }
          }
        }

        return transformedCode;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Code transformation failed: ${errorMessage}`);
      }
    };

    const executeCode = async (code: string): Promise<void> => {
      const startTime = performance.now();
      
      try {
        if (!esbuildService.isInitialized()) {
          await esbuildService.initialize();
        }

        if (!code.trim()) {
          onResult({ error: 'No code provided' });
          return;
        }

        const transformedCode = await transformCode(code);
        
        
        const executableCode = `
          "use strict";
          const { 
            useState, useEffect, useCallback, useMemo, useRef, useContext,
            createContext, Fragment, StrictMode, Component, PureComponent,
            forwardRef, memo, lazy, Suspense
          } = React;
          
          try {
            ${transformedCode}
          } catch (e) {
            throw new Error('Component execution failed: ' + e.message);
          }
        `;

        // Execute the code safely
        const componentFunction = new Function('React', executableCode);
        const Component = componentFunction(React);

        if (typeof Component !== 'function') {
          throw new Error('Code must export a React component as default export. Got: ' + typeof Component);
        }

        const executionTime = performance.now() - startTime;

        onResult({
          component: Component,
          executionTime,
          compiledCode: transformedCode,
        });
      } catch (error) {
        const executionTime = performance.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
                
        onResult({
          error: errorMessage,
          executionTime,
        });
      }
    };

    useImperativeHandle(ref, () => ({
      executeCode,
    }));

    if (initError) {
      return (
        <div className="code-executor-error">
          <h3>Initialization Error</h3>
          <p>{initError}</p>
        </div>
      );
    }

    if (!isInitialized) {
      return (
        <div className="code-executor-loading">
          <p>Initializing code executor...</p>
        </div>
      );
    }

    return null;
  }
); 