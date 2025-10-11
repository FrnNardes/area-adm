// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Principal from './pages/Principal'; // <-- 1. IMPORTE A NOVA PÁGINA
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/principal" element={<Principal />} /> {/* <-- 2. ADICIONE A NOVA ROTA */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;