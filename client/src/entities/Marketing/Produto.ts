import { Empresa } from "../Common";
import { TipoProduto } from "./index";

enum Situacao {
    'A', 'I'
}

export default interface IProduto {
    id: number,
    created_at: Date,
    nome: string,
    tipo_produto_id: number,
    situacao: Situacao,
    preco: number,
    empresa_id: number,
    empresa?: Empresa,
    tipoProduto?: TipoProduto
}