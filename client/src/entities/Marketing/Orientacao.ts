
enum Situacao {
    'A',
    'I',
}


export default interface IOrientacao {
    id: number,
    nome: string,
    situacao: Situacao
}