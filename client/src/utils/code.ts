export const sampleString = `import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (  
    <div>
      <h2>Hello, world!</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default MyComponent;`;