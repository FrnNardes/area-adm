import React from 'react';
import '../App.css';

/**
 * Renderiza um menu suspenso para a ação de logout.
 * @param {object} props As propriedades do componente.
 * @param {function} props.onSair Callback para a ação de sair do sistema.
 */
function DropdownMenu({ onSair }) { // A MÁGICA ESTÁ AQUI: {onSair}
    
    // Se a função onSair não for passada, o menu nem aparece.
    // Isso deixa o componente mais estável e reutilizável.
    if (!onSair) {
        return null;
    }

    return (
        <div className="dropdown-menu">
            {/* Agora o 'onSair' é a função de verdade, não o objeto de props */}
            <button onClick={onSair} className="dropdown-item item-sair">Sair do Sistema</button>
        </div>
    );
}

export default DropdownMenu;