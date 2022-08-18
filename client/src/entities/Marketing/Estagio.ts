enum Situacao {
    'A', 'I'
}

export default interface IEstagio {
    id: number,
    estagio_id: number,
    nome: string,
    situacao: Situacao,
    motivo_encerramento_id?: number,
    ordem: number,
    padrao: string,
    cor?: string
}