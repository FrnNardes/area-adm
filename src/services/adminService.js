const ADMIN_API_BASE_URL = 'http://localhost:8086/admin/producers';
const LOGIN_API_BASE_URL = 'http://localhost:8081/auth';
const USER_API_BASE_URL = 'http://localhost:8081/users';

/**
 * Wrapper de fetch que gerencia a autenticação e a renovação automática de token.
 * Todas as chamadas de API autenticadas devem usar esta função.
 * @internal - Não precisa ser exportada, é usada pelas outras funções do serviço.
 * @param {string} url A URL do endpoint a ser chamado.
 * @param {object} options Opções de fetch (method, body, etc.).
 * @returns {Promise<Response>} A resposta da chamada fetch.
 */
async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem('powershare_access_token');
    
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
    };

    if (!headers['Content-Type'] && options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const finalOptions = { ...options, headers };
    let response = await fetch(url, finalOptions);

    if (response.status === 401) {
        try {
            const refreshToken = localStorage.getItem('powershare_refresh_token');
            if (!refreshToken) throw new Error("Sessão inválida. Refresh token não encontrado.");

            const refreshResponse = await fetch(`${LOGIN_API_BASE_URL}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) throw new Error("Não foi possível renovar a sessão.");

            const newTokens = await refreshResponse.json();
            localStorage.setItem('powershare_access_token', newTokens.accessToken);
            localStorage.setItem('powershare_refresh_token', newTokens.refreshToken);

            finalOptions.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
            response = await fetch(url, finalOptions);

        } catch (error) {
            console.error("Erro crítico na autenticação. Redirecionando para o login.", error);
            localStorage.removeItem('powershare_access_token');
            localStorage.removeItem('powershare_refresh_token');
            window.location.href = '/';
            return Promise.reject(error);
        }
    }

    return response;
}

/**
 * Busca a lista de propostas de produtores filtrada por status.
 * @param {string} status O status para filtrar as propostas ('PENDING', 'APPROVED', 'REJECTED').
 * @returns {Promise<Array<object>>} Uma lista de propostas formatadas para o frontend.
 */
export async function getPropostas(status) {
    const response = await fetchWithAuth(`${ADMIN_API_BASE_URL}?status=${status}`);
    if (!response.ok) throw new Error('Falha ao buscar propostas');
    
    const data = await response.json();
    
    return data.map(item => ({
        userId: item.userId || `id-${Math.random()}`,
        nome: item.userName || 'Nome não informado',
        email: item.email || 'E-mail não informado',
        enviadoEm: item.sentAt || 'Data não informada',
        tipo: 'novo_produtor',
        status: status,
    }));
}

/**
 * Aprova uma proposta de produtor.
 * @param {string} userId O ID do usuário associado à proposta.
 */
export async function approveProducer(userId) {
    const response = await fetchWithAuth(`${ADMIN_API_BASE_URL}/${userId}/approve`, { method: 'POST' });
    if (response.status !== 204) throw new Error('Falha ao aprovar proposta.');
}

/**
 * Rejeita uma proposta de produtor com um motivo.
 * @param {string} userId O ID do usuário associado à proposta.
 * @param {string} reason O motivo da rejeição.
 */
export async function rejectProducer(userId, reason) {
   const response = await fetchWithAuth(`${ADMIN_API_BASE_URL}/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: reason,
    });
    if (response.status !== 204) throw new Error('Falha ao rejeitar proposta.');
}

/**
 * Busca os detalhes completos de um produtor (incluindo documentos).
 * @param {string} userId O ID do usuário para buscar os detalhes.
 * @returns {Promise<object>} Os dados detalhados do produtor.
 */
export async function getProducerDetails(userId) {
    const response = await fetchWithAuth(`${ADMIN_API_BASE_URL}/${userId}`);
    if (!response.ok) throw new Error('Falha ao buscar detalhes do produtor.');
    return await response.json();
}

/**
 * Busca os detalhes de um usuário (CPF, telefone, etc.).
 * @param {string} userId O ID do usuário a ser buscado.
 * @returns {Promise<object>} Os dados detalhados do usuário.
 */
export async function getUserDetails(userId) {
    const response = await fetchWithAuth(`${USER_API_BASE_URL}/${userId}`);
    if (!response.ok) throw new Error('Falha ao buscar detalhes do usuário.');
    return await response.json();
}

/**
 * Autentica um usuário e retorna os tokens de acesso e renovação.
 * @param {string} email O email do usuário.
 * @param {string} senha A senha do usuário.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Um objeto contendo os tokens.
 */
export async function login(email, senha) {
    const response = await fetch(`${LOGIN_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
    });
    if (!response.ok) throw new Error('Credenciais inválidas.');
    return await response.json();
}

