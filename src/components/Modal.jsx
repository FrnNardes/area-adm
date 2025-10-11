import { useState, useEffect } from 'react';
import { getProducerDetails } from '../services/adminService';
import '../App.css';

/**
 * Exibe uma janela modal para visualizar os detalhes de uma proposta,
 * buscando e exibindo informações e documentos do produtor de forma assíncrona.
 */
function Modal({ isOpen, onClose, data, onAprovar, onRejeitar, onReabrir }) {
    const [abaAtiva, setAbaAtiva] = useState('documentos');
    const [observacao, setObservacao] = useState('');
    const [erroRejeicao, setErroRejeicao] = useState(null);

    // Estados para controlar o carregamento dos detalhes da API
    const [details, setDetails] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState('');

    /**
     * Efeito que busca os detalhes completos do produtor
     * sempre que o modal for aberto com novos dados.
     */
    useEffect(() => {
        const fetchDetails = async () => {
            if (!data?.userId) return;

            setIsLoadingDetails(true);
            setErrorDetails('');
            setDetails(null);

            try {
                const producerDetails = await getProducerDetails(data.userId);
                setDetails(producerDetails);

            } catch (err) {
                console.error("Erro ao buscar detalhes da proposta:", err);
                setErrorDetails("Não foi possível carregar os detalhes. Tente novamente.");
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (isOpen) {
            fetchDetails();
        }
    }, [isOpen, data]);

    if (!isOpen) return null;

    // Função para formatar um CPF (xxx.xxx.xxx-xx)
    const formatCPF = (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    // Função para formatar um CNPJ (xx.xxx.xxx/xxxx-xx)
    const formatCNPJ = (cnpj) => {
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    // CPF x CNPJ
    const renderDocumento = () => {
        const doc = details?.cpf || details?.documentNumber || '';

        const onlyNumbers = doc.replace(/\D/g, '');

        if (onlyNumbers.length === 11) {
            return (
                <p><strong>CPF:</strong> <span>{formatCPF(onlyNumbers)}</span></p>
            );
        }

        if (onlyNumbers.length === 14) {
            return (
                <p><strong>CNPJ:</strong> <span>{formatCNPJ(onlyNumbers)}</span></p>
            );
        }

        // Se não for nem CPF nem CNPJ, apenas mostra o número original
        return (
            <p><strong>Documento:</strong> <span>{doc || 'Não informado'}</span></p>
        );
    };

    const handleRejeitar = () => {
        const motivo = observacao.trim();
        if (motivo.length < 5) {
            setErroRejeicao("O motivo da rejeição é obrigatório.");
            return;
        }
        onRejeitar(data.userId, motivo);
    };

    const handleDownload = async (url, filename) => {
        try {
            // Pega o token do localStorage para enviar na requisição
            const token = localStorage.getItem('powershare_access_token');
            
            // O "concierge" (fetch) vai buscar o arquivo, mostrando o crachá (token)
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha na autenticação para baixar o arquivo.');
            }

            // Pega o conteúdo do arquivo como um "blob" (dados binários)
            const blob = await response.blob();
            
            // Cria um link temporário na memória do navegador
            const downloadUrl = window.URL.createObjectURL(blob);
            
            // Cria um elemento <a> invisível
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename); // Define o nome do arquivo para o download
            
            // Adiciona o link ao corpo do documento, clica nele, e o remove
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpa o link temporário da memória
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Erro ao baixar o arquivo:', error);
            alert('Não foi possível baixar o arquivo. Verifique o console para mais detalhes.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Análise de {data.nome}</h2>
                        <p>Enviado em {data.enviadoEm}</p>
                    </div>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>

                <nav className="modal-tabs">
                    <a href="#" className={abaAtiva === 'documentos' ? 'active' : ''} onClick={() => setAbaAtiva('documentos')}>Documentos</a>
                    <a href="#" className={abaAtiva === 'informacoes' ? 'active' : ''} onClick={() => setAbaAtiva('informacoes')}>Informações</a>
                </nav>

                <div className="modal-body">
                    {isLoadingDetails ? (
                        <div className="loading-message">Carregando detalhes...</div>
                    ) : errorDetails ? (
                        <div className="error-message">{errorDetails}</div>
                    ) : (
                        <>
                            {abaAtiva === 'documentos' && (
                                <div className="documentos-content">
                                    <h4>Documentos da Usina</h4>
                                    {details && details.documents && details.documents.length > 0 ? (
                                        <ul className="document-list">
                                        {details.documents.map((doc, index) => (
                                            <li key={index}>
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault(); // Impede o link de navegar para '#'
                                                    handleDownload(doc.downloadUrl, doc.documentType);
                                                }}>
                                                    {doc.documentType}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                    ) : (
                                        <p>Nenhum documento encontrado para esta proposta.</p>
                                    )}

                                    {data.status === 'PENDING' && (
                                        <div className="observacao-e-footer">
                                             <label htmlFor="observacao" className="observacao-label">Observação (obrigatória em caso de Rejeição):</label>
                                             <textarea
                                                 id="observacao"
                                                 placeholder="Adicione o motivo da rejeição..."
                                                 value={observacao}
                                                 onChange={(e) => setObservacao(e.target.value)}
                                             ></textarea>
                                             {erroRejeicao && <div className="modal-error-message">{erroRejeicao}</div>}
                                             <div className="modal-footer">
                                                 <button onClick={handleRejeitar} className="btn-rejeitar">Rejeitar</button>
                                                 <button onClick={() => onAprovar(data.userId)} className="btn-aprovar">Aprovar</button>
                                             </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {abaAtiva === 'informacoes' && (
                                <div className="informacoes-content">
                                    <h4>Dados do Produtor</h4>
                                    <p><strong>Nome completo:</strong> <span>{details?.name || data.nome}</span></p>
                                    {details && renderDocumento()}
                                    <p><strong>Celular:</strong> <span>{details?.phone || 'Não informado'}</span></p>
                                    <p><strong>E-mail:</strong> <span>{details?.email || data.email}</span></p>
                                    
                                    <h4 style={{marginTop: '30px'}}>Dados da Usina</h4>
                                    <p><strong>Nome da Usina:</strong> <span>{details?.powerPlantName || 'Não informado'}</span></p>
                                    <p><strong>Código da Usina:</strong> <span>{details?.powerPlantCode || 'Não informado'}</span></p>
                                    <p><strong>Início da Operação:</strong> <span>{details?.operationStart || 'Não informado'}</span></p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Modal;

