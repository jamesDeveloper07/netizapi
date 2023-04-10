import { User } from "../Security";
import { Servico, AcaoServicoSolicitacao, LogEvento } from "../Common";



type LogIntegracao = {
    id: number,

    nome_cliente?: string,
    documento_cliente?: string,

    email_cliente: string,
    telefone_cliente: string,
    cliente_erp_id: string,

    servico_id?: number,
    servico_nome?: string,
    servico?: Servico,

    acao_servico_id?: number,
    acao_servico_nome?: string,
    acao_servico?: AcaoServicoSolicitacao,

    pacote_id?: string,
    assinante_id_integracao?: string,
    ticket?: string,

    protocolo_externo_id?: string,

    acao: string,


    status: 'pendente' | 'executada' | 'cancelada' | 'falha' | 'invalida',
    status_detalhe?: string,

    user_id: number,
    user?: User,

    logEvento?: LogEvento,

    created_at: Date,
    updated_at: Date,
    deleted_at?: Date

}

export default LogIntegracao