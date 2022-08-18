enum Situacao {
    'celular',
    'residencial',
    'comercial',
}


export default interface ITelefone {
    id: number,
    ddd: number,
    numero: number,
    tipo: Situacao
}