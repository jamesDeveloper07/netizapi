import { User } from "../Security";

import { ClienteSolicitacao } from "../Common";
import { AcaoServicoSolicitacao } from "../Common";

type Solicitacao = {
    id: number,
    
    cliente_id: number,
    cliente?: ClienteSolicitacao,
    
    acao_servico_id: number,
    acao_servico?: AcaoServicoSolicitacao,

    servico_id: number,
    servico_nome: string,

    acao_id: number,
    acao_nome: string,

    protocolo_externo_id?: string,
    
    status: 'pendente' | 'finalizada' | 'cancelada' | 'falha',
    status_detalhe?: string,
  
    created_at: Date,
    finished_at?: Date,
    updated_at: Date,
    deleted_at?: Date
}

export default Solicitacao