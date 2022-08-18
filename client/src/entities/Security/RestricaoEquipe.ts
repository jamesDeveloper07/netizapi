enum Situacao {
    'A', 'I'
}

enum Tipo {
    'permissao', 'restricao'
}

export default interface IRestricaoEquipe {
    id: number,
    user_id: number,
    empresa_id: number,
    equipe_id: number,
    equipe_nome: string,
    captadora: Situacao,
    tipo: Tipo
}