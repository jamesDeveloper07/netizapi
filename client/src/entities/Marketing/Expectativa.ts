enum Situacao {
    'A', 'I'
}

export default interface IExpectativa {
    id: number,
    nome: string,
    situacao: Situacao
}