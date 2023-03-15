
enum Situacao {
    'ativo', 'inativo'
}

export default interface IServico {
    id: number,
    nome: string,    
    descricao?: string,
    status: Situacao,
    integracao_by_api: boolean,
    integracao_id?: string,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
}