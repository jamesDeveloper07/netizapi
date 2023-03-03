import { User } from "../Security";

type ClienteSolicitacao = {
    id: number,
    nome?: string,
    documento?: string,
    email?: string,
    telefone?: string,    
    status: 'ativo' | 'inativo',
    origem: string,
    externo_id: number,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
}

export default ClienteSolicitacao