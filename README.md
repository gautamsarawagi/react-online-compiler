# React Online Compiler

A React application that allows users to preview, edit, and visually modify React components in real-time. Users can copy-paste React component code, preview it live, and make visual edits by selecting elements and modifying their properties.

## Assignment Overview

This project implements the core requirements from the Frontend Engineer Task:
- **Component Preview**: Paste React component code and see it rendered live
- **Visual Editing**: Select elements and modify properties (text, colors, sizing, boldness)
- **Real-time Updates**: Changes are reflected immediately in the preview
- **Backend Integration**: Automatic saving of component changes to database
- **Unique Component IDs**: Each component gets a unique identifier for sharing/retrieval

## Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **React Router** for navigation and component sharing via URLs
- **React Query** for server state management
- **Monaco Editor** for code editing experience
- **Custom AST-based manipulation** for precise code modifications

### Backend (Node.js + Express)
- **Express.js** REST API server
- **PostgreSQL** database for component storage
- **Component CRUD operations** with unique ID generation

## Core Technologies & Why I Chose Them

### Babel vs Acorn: The Dual Parser Approach

I used **both** Babel and Acorn for different purposes, each optimized for their specific use case:

#### Babel (@babel/standalone)
- **Purpose**: Code transformation and execution
- **Why**: Babel handles JSX compilation, ES6+ features, and provides a complete transformation pipeline
- **Usage**: In `useCodeExecution.ts` to transform user code into executable JavaScript

```typescript
// Transform JSX code to executable JavaScript
const result = transform(sourceCode, {
  presets: ["react", "env"],
  plugins: ["proposal-class-properties"],
})
```

#### Acorn + acorn-jsx
- **Purpose**: AST parsing and manipulation
- **Why**: Acorn is lightweight and provides precise AST nodes with location information
- **Usage**: In `JSXTreeUtils.ts` for parsing JSX into an Abstract Syntax Tree

```typescript
// Parse JSX into AST for precise manipulation
const JSXParser = Parser.extend(jsx())
this.ast = JSXParser.parseExpressionAt(jsxCode, 0, {
  ecmaVersion: 2020,
  sourceType: 'module',
  locations: true
})
```

#### Why Not Just Babel?
Using only Babel for AST manipulation would be **overhead** because:
- Babel's AST is more complex and includes transformation metadata
- Acorn provides cleaner, more focused AST nodes (ref: [link](https://ngarbezza.hashnode.dev/using-acorn-to-implement-a-refactoring-in-javascript-part-1-hacking-it))
- We only need parsing, not transformation, for visual editing

## How JSXTreeUtils Works

1. **Parse the code:** It takes the React component code and breaks it down into a tree structure (like a family tree) that the computer can understand.
2. **Find elements:** When we click on something in the preview, it figures out exactly where that element is in the code tree by counting how many similar elements come before it.
3. **Make changes:** It updates the specific part of the code tree (like changing a color or text) while keeping everything else exactly the same.
4. **Convert back to code:** It takes the updated tree and turns it back into readable code, making sure to put the new text or styles in exactly the right spot.
5. **Update everything:** The new code gets sent back to your app, and we see the changes immediately in both the preview and the code editor.

## Key Features

### Visual Element Selection
- Click any element in the preview to select it
- Visual highlighting shows selected element
- Property panel displays editable attributes

### Real-time Code Updates
- Changes in property panel update code immediately
- Code changes reflect in preview instantly
- Bidirectional sync between visual edits and code

### Component Sharing
- Each component gets a unique ID (e.g., `qsxklbnedc`)
- Shareable URLs: `/project/{id}`
- Persistent storage with automatic saving

## API Endpoints

### POST `/api/component`
- Creates new component in database
- Generates unique ID
- Returns component data

### GET `/api/preview/:id`
- Retrieves component by ID
- Used for sharing and loading saved components

### PUT `/api/component/:id`
- Updates existing component
- Called automatically on visual edits
- Syncs changes back to database

## Data Flow

1. **User pastes code** → Babel transforms JSX → Component renders
2. **User selects element** → DOM traversal → AST path resolution
3. **User modifies property** → AST manipulation → Code update → Preview refresh
4. **Auto-save** → Backend API call → Database update

## Development Setup

```bash
# Frontend
cd client
yarn
yarn run dev

# Backend
cd server
npm install
npm run dev
```

