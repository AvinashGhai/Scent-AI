import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Discover from "./pages/Discover"
import PerfumePage from "./pages/PerfumePage"
import ScentMixer from "./components/ai/ScentMixer"
import { AIAssistantPage } from "./components/ai/AIAssistant"
import { AIAssistantWidget } from "../src/components/ai/AIAssistant"

export default function App() {
  return (
    <BrowserRouter>
      <AIAssistantWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/perfume/:id" element={<PerfumePage />} />
        <Route path="/mix" element={<ScentMixer />} />
        <Route path="/assistant" element={<AIAssistantPage />} />
      </Routes>
    </BrowserRouter>
  )
}