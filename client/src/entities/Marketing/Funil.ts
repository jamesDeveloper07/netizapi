import { Empresa } from "../Common";

enum Situacao {
    'A',
    'I',
}

export default interface IFunil {
    id: number,
    nome: string,
    descricao?: string,
    empresa_id: number,
    situacao: Situacao,
    created_at?: Date,
    updated_at?: Date,
    empresa?: Empresa
}