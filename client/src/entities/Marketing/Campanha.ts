enum Situacao {
    'ativo',
    'inativo',
    'em_analise',
    'Não Aprovado'
}

export default interface ICampanha {
    id: number,
    nome: string,
    created_at: Date,
    updated_at: Date,
    dt_inicio: Date,
    dt_fim: Date,
    situacao: Situacao,
    descricao?: string,
    afiliacao?: boolean
}