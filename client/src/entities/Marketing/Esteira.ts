import { Empresa } from "../Common";


export default interface IEsteira {
    id: number,
    nome: string,
    empresa_id: number,
    situacao: 'A' | 'I',
    created_at?: Date,
    updated_at?: Date,
    deleted_at?: Date
    empresa?: Empresa
}