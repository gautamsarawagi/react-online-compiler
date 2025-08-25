import { Route, Routes } from "react-router-dom"
import { Home } from "./components/Home"
import { Project } from "./components/Project"
import { Page404 } from "./components/Page404"
import './App.css'
    
  export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/project/:projectId" element={<Project />} />
      
      <Route path="*" element={<Page404  />} />
    </Routes>
  )
}