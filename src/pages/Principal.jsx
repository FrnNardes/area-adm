import { useState, useMemo, useEffect, useRef } from 'react';
import '../App.css';
import logoPowerShare from '../assets/logo.png';
import Card from '../components/Card';
import Modal from '../components/Modal';
import DropdownMenu from '../components/DropdownMenu';
import toast from 'react-hot-toast';
import { getPropostas, approveProducer, rejectProducer } from '../services/adminService';

const STATUS_PENDING = 'PENDING';
const STATUS_APPROVED = 'APPROVED';
const STATUS_REJECTED = 'REJECTED';

function Principal() {
    // State para controlar a aba de navegação ativa (Pendentes, Validados, Rejeitados).
    const [abaAtiva, setAbaAtiva] = useState(STATUS_PENDING);
    // State para controlar a visibilidade do modal de detalhes.
    const [modalAberto, setModalAberto] = useState(false);
    // State para armazenar os dados do card que foi clicado para abrir o modal.
    const [cardSelecionado, setCardSelecionado] = useState(null);
    // State para o valor do campo de busca.
    const [termoBusca, setTermoBusca] = useState('');
    // State que armazena a lista de propostas, vinda da API ou do mock no service.
    const [propostas, setPropostas] = useState([]);
    // State para indicar o estado de carregamento dos dados da API.
    const [isLoading, setIsLoading] = useState(false);
    // State para gerenciar o DropDownMenu
    const [menuHeaderAberto, setMenuHeaderAberto] = useState(false);
    const menuHeaderRef = useRef(null);

    /**
     * Efeito que busca as propostas na API sempre que a `abaAtiva` é alterada.
     * O adminService já trata o caso de falha, retornando um mock.
     */
    useEffect(() => {
        async function loadPropostas() {
            setIsLoading(true);
            const data = await getPropostas(abaAtiva);
            setPropostas(data);
            setIsLoading(false);
        }
        loadPropostas();
    }, [abaAtiva]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuHeaderRef.current && !menuHeaderRef.current.contains(event.target)) {
                setMenuHeaderAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuHeaderRef]);

    useEffect(() => {
        const token = localStorage.getItem('powershare_access_token'); 

        if (!token) {
            console.log("Guarita: Nenhum token de acesso encontrado. Redirecionando para o login.");
            window.location.href = '/'; 
        }
    }, []);

    /**
     * Função centralizadora para atualizar o status de uma proposta.
     */
    const handleAtualizarStatus = async (userId, novoStatus, reason = '') => {
        setIsLoading(true);
        try {
            if (novoStatus === STATUS_APPROVED) {
                await approveProducer(userId);
            } else if (novoStatus === STATUS_REJECTED) {
                await rejectProducer(userId, reason);
            } else if (novoStatus === STATUS_PENDING) {
                console.warn(`Ação de REABRIR (POST para ${userId}/reopen) simulada.`);
            }

            setPropostas(prev => prev.filter(p => p.userId !== userId));
            alert(`Proposta de ${userId} movida para ${novoStatus}.`);

        } catch (error) {
            console.error("Erro na atualização de status:", error);
            alert("Erro ao se comunicar com a API. Tente novamente.");
        } finally {
            setIsLoading(false);
            handleFecharModal();
        }
    };

    /**
     * Realiza o logout do usuário.
     */
    const handleLogout = () => {
        localStorage.removeItem('powershare_access_token');
        toast.success('Logout realizado com sucesso!');
        setTimeout(() => {
            window.location.href = '/'; 
        }, 1000); 
    };

    const handleTrocarAba = (nomeAba) => {
        setAbaAtiva(nomeAba);
    };

    const handleAbrirModal = (dadosDoCard) => {
        setCardSelecionado(dadosDoCard);
        setModalAberto(true);
    };

    const handleFecharModal = () => {
        setModalAberto(false);
        setCardSelecionado(null);
    };

    const onAprovar = (userId) => handleAtualizarStatus(userId, STATUS_APPROVED);
    const onRejeitar = (userId, reason) => handleAtualizarStatus(userId, STATUS_REJECTED, reason);
    const onReabrir = (userId) => handleAtualizarStatus(userId, STATUS_PENDING);

    /**
     * Otimiza a filtragem e ordenação da lista de propostas.
     */
    const dadosProcessados = useMemo(() => {
        const parseDate = (str) => {
            if (!str || !str.includes('/')) return new Date(0);
            const [dia, mes, ano] = str.split('/');
            return new Date(ano, mes - 1, dia);
        };

        let dadosFiltrados = propostas
            .filter(card => {
                const termo = termoBusca.toLowerCase();
                if (!termo) return true;
                return (
                    (card.nome && card.nome.toLowerCase().includes(termo)) ||
                    (card.email && card.email.toLowerCase().includes(termo))
                );
            });

        dadosFiltrados.sort((a, b) => parseDate(b.enviadoEm) - parseDate(a.enviadoEm));

        return dadosFiltrados;
    }, [termoBusca, propostas]);


    return (
        <div className="principal-page">
            <header className="main-header">
                <div className="header-left">
                    <img src={logoPowerShare} alt="Logo PowerShare" className="header-logo" />
                    <div className="search-bar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#8EA5C5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 21L16.65 16.65" stroke="#8EA5C5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                        />
                    </div>
                </div>
                <div className="header-right">
                    <nav className="main-nav">
                        <ul>
                            <li><a href="#" className={abaAtiva === STATUS_PENDING ? 'active' : ''} onClick={() => handleTrocarAba(STATUS_PENDING)}>Pendentes</a></li>
                            <li><a href="#" className={abaAtiva === STATUS_APPROVED ? 'active' : ''} onClick={() => handleTrocarAba(STATUS_APPROVED)}>Validados</a></li>
                            <li><a href="#" className={abaAtiva === STATUS_REJECTED ? 'active' : ''} onClick={() => handleTrocarAba(STATUS_REJECTED)}>Rejeitados</a></li>
                        </ul>
                    </nav>
                    <div className="kebab-menu-container" ref={menuHeaderRef}>
                        <button className="kebab-menu-button" onClick={() => setMenuHeaderAberto(!menuHeaderAberto)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w.org/2000/svg"><circle cx="12" cy="5" r="2" fill="#FFFFFF"/><circle cx="12" cy="12" r="2" fill="#FFFFFF"/><circle cx="12" cy="19" r="2" fill="#FFFFFF"/></svg>
                        </button>
                        {menuHeaderAberto && (
                            <DropdownMenu onSair={handleLogout} />
                        )}
                    </div>
                </div>
            </header>

            <main className="content-area">
                {isLoading ? (
                    <div className="loading-message">Carregando propostas...</div>
                ) : (
                    <div className="cards-container">
                        {dadosProcessados.map(item => (
                            <Card
                                key={item.userId}
                                dados={item}
                                onVisualizarClick={handleAbrirModal}
                                onAprovar={onAprovar}
                                onRejeitar={onRejeitar}
                            />
                        ))}
                        {dadosProcessados.length === 0 && !isLoading && (
                            <div className="empty-state">
                                Não há propostas nesta categoria.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {modalAberto && (
                <Modal
                    isOpen={modalAberto}
                    onClose={handleFecharModal}
                    data={cardSelecionado}
                    onAprovar={onAprovar}
                    onRejeitar={onRejeitar}
                    onReabrir={onReabrir}
                />
            )}
        </div>
    );
}

export default Principal;

