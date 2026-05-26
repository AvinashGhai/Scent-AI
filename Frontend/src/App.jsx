import { BrowserRouter, Routes, Route } from "react-router-dom"
import Discover from "./pages/Discover"
import PerfumePage from "./pages/PerfumePage"



import Home from "./pages/Home"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/perfume/:id" element={<PerfumePage />} />
      </Routes>
    </BrowserRouter>
  )
}