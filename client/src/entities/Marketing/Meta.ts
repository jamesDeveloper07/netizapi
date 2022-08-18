import { Empresa, } from '../Common'
import { TipoProduto } from '../Marketing'
import { User } from "../Security";

enum Unidade {
    'M', 'Q'
}

type Meta = {
    id: number,
    mes: number,
    ano: number,
    valor: number,
    unidade: Unidade,
    empresa_id: number,
    empresa?: Empresa,
    tipo_produto_id: number,
    tipo_produto?: TipoProduto,
    criador_id: number,
    criador?: User,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date,
    produtos?:any,
    colaboradores?:any,
}

export default Meta