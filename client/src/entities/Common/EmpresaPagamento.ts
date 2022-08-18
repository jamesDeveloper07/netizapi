import { string } from "prop-types"

export default interface EmpresaPagamento {
    id: number,
    nome: string,
    descricao: string,
    situacao: 'A' | 'I',
    
    token?: string,
    url_api?: string,
    url_logo?: string,

    created_at: Date,
    updated_at: Date    
}