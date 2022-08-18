
enum Situacao {
    'A', 'I'
}

export default interface IMotivoEncerramento {
    id: number,
    nome: string,
    aplicacao?: String
    descricao?: string,
    situacao: Situacao,
    padrao: Situacao,
}