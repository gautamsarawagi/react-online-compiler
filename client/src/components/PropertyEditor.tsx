import { useEffect, useState } from "react";

interface PropertyEditorProps {
    label: string;
    value: string;
    type?: string;
    onChange: (value: string) => void;
  }
  
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
    label,
    value,
    type = 'text',
    onChange,
  }) => {   
    const [localValue, setLocalValue] = useState(value);
  
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };
  
    return (
      <div className="property-editor">
        <label className="property-label">{label}</label>
        <input
          type={type}
          value={localValue}
          onChange={handleChange}
          className="property-input"
        />
      </div>
    );
  };        