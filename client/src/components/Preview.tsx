import { Suspense, type ComponentType, type FC } from "react";

interface PreviewProps {
  component: ComponentType | null;
  error: string | null;
  isLoading: boolean;
}

export const Preview: FC<PreviewProps> = ({
  component: Component,
  error,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="preview loading">
        <div className="loading-spinner" />
        <p>Compiling...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview error">
        <h3>Error</h3>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="preview empty">
        <p>Write some React code to see it rendered here</p>
      </div>
    );
  }

  return (
    <div className="preview">
      <div className="preview-content">
        <Suspense fallback={<div className="loading-spinner" />}>
          <Component />
        </Suspense>
      </div>
    </div>
  );
};

// Add CSS for the preview component
const style = document.createElement("style");
style.textContent = `
.preview {
  height: 100%;
  background: white;
  padding: 24px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.preview.loading {
  gap: 16px;
  color: #6b7280;
}

.preview.error {
  align-items: flex-start;
  justify-content: flex-start;
}

.preview.error h3 {
  color: #dc2626;
  margin: 0 0 16px 0;
}

.preview.error pre {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 16px;
  color: #dc2626;
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  max-width: 100%;
  overflow-x: auto;
}

.preview.empty {
  color: #6b7280;
  font-style: italic;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
`;
document.head.appendChild(style);
