import { User } from "../Security";

type AcaoServicoSolicitacao = {
    id: number,
    servico_id: number,
    servico_nome: string,
    acao_id: number,
    acao_nome: string,
    status: 'ativo' | 'inativo',
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
}

export default AcaoServicoSolicitacao