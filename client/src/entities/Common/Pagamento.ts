import { Empresa, EmpresaPagamento } from '.'
import { User } from "../Security";

type Pagamento = {
    id: number,
    nome: string,
    descricao: string,
    situacao: 'A' | 'I',

    user_id: number,
    empresa_id: number,

    user?: User,
    empresa?: Empresa,

    plano_id: number, 
    empresa_pagamento_id: number,
    empresa_pagamento?: EmpresaPagamento,
    pagamento_id: string,

    dt_pagamento: Date,
    dt_inicio_vigencia: Date,
    dt_fim_vigencia: Date,
    
    created_at: Date,
    updated_at?: Date,
    deleted_at?: Date,

    return_api?: string,
    status_api?: string,

    return_checkout?: string,
    status_checkout?: string

}

export default Pagamento