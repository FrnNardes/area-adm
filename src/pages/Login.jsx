import '../App.css'; 
import logoPowerShare from '../assets/logo.png';
import React, { useState } from 'react';
import { login } from '../services/adminService';
import { useNavigate } from 'react-router-dom'; 

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(''); 

 const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
        const tokens = await login(email, senha);

        if (!tokens || !tokens.accessToken) {
            throw new Error("Resposta da API de login inválida.");
        }

        localStorage.setItem('powershare_access_token', tokens.accessToken);
        localStorage.setItem('powershare_refresh_token', tokens.refreshToken);
        
        console.log('Tokens salvos. Pausando antes de redirecionar...');

        window.location.href = '/principal';

    } catch (err) {
        console.error('Falha no processo de login:', err);
        setError('E-mail ou senha inválidos. Tente novamente.');
    }
};
  
  return (
    <form onSubmit={handleLogin}>
      <div className="login-page">
        <div className="login-container">
          <h1>PowerShare</h1>

          <img 
            src={logoPowerShare} 
            alt="Logo PowerShare" 
            className="logo" 
          />

          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">Entrar</button>
        </div>
      </div>
    </form>
  );
}

export default Login;