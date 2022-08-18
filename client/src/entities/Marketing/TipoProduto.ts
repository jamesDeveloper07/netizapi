import { Empresa } from "../Common";

enum Situacao {
    'A', 'I'
}

export default interface ITipoProduto {
    id: number,
    nome: string,
    situacao: Situacao,
    empresa_id: number
    empresa?: Empresa
}