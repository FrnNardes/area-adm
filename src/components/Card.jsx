import { useState, useRef, useEffect } from 'react';
import '../App.css';
import DropdownMenu from './DropdownMenu';

/**
 * Exibe um card com as informações resumidas de uma proposta de produtor.
 * Inclui ações como visualizar detalhes e um menu para aprovar, rejeitar ou reabrir.
 * @param {object} props As propriedades do componente.
 * @param {object} props.dados O objeto contendo as informações da proposta (nome, email, status, etc.).
 * @param {function} props.onVisualizarClick Callback acionado ao clicar em "Visualizar Documentos".
 * @param {function} props.onAprovar Callback para a ação de aprovar a proposta.
 * @param {function} props.onRejeitar Callback para a ação de rejeitar a proposta.
 * @param {function} props.onReabrir Callback para a ação de reabrir a proposta.
 * @param {function} props.onSair Callback para a ação de logout do sistema.
 */
function Card({ dados, onVisualizarClick, onAprovar, onRejeitar, onReabrir, onSair }) {
    const { nome, email, enviadoEm, status, tipo, unidades } = dados;

    // Lógica para exibir a unidade relevante no card:
    // Prioriza uma unidade com status 'PENDING', senão usa a primeira da lista.
    // Garante que o código não quebre se 'unidades' for nulo ou vazio.
    const unidadeEmAnalise =
        Array.isArray(unidades) && unidades.length > 0
            ? unidades.find(u => u.status === 'PENDING') || unidades[0]
            : null;

    // State para controlar a visibilidade do menu de ações (dropdown).
    const [menuAberto, setMenuAberto] = useState(false);
    // Ref para obter a referência do elemento do menu no DOM.
    const menuRef = useRef(null);

    /**
     * Efeito para fechar o menu de ações quando o usuário clica fora dele.
     * Adiciona um event listener no documento e o remove quando o componente é desmontado.
     */
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    /**
     * Manipula o clique no link "Visualizar Documentos", prevenindo a ação padrão
     * do link e chamando a função recebida via props.
     */
    const handleVisualizarClick = (e) => {
        e.preventDefault();
        onVisualizarClick(dados);
    };

    return (
        <div className={`card card-${status.toLowerCase()}`}>
            <div className="card-header">
                <span>{nome}</span>
                <span className="card-tipo">
                    {tipo === 'nova_unidade' ? 'Nova Unidade' : 'Novo Produtor'}
                </span>
            </div>
            <div className="card-body">
                <p><strong>E-mail:</strong> {email}</p>
                <p><strong>Enviado em:</strong> {enviadoEm}</p>
                <p><strong>Unidade Produtora:</strong> {unidadeEmAnalise ? unidadeEmAnalise.nome : 'N/D'}</p>
            </div>
            <div className="card-footer">
                <a href="#" onClick={handleVisualizarClick}>
                    Visualizar Documentos
                </a>

                <div className="card-menu-container" ref={menuRef}>
                    {menuAberto &&
                        <DropdownMenu
                            status={status}
                            onAprovar={() => onAprovar(dados.userId)}
                            onRejeitar={(reason) => onRejeitar(dados.userId, reason)}
                            onReabrir={() => onReabrir(dados.userId)}
                            onSair={onSair}
                        />
                    }
                </div>
            </div>
        </div>
    );
}

export default Card;