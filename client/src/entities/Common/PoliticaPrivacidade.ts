import { Empresa, } from '../Common'
import { User } from "../Security";

type PoliticaPrivacidade = {
    id: number,
    nome: string,
    descricao: string,
    versao: string,
    link_url: string,
    data_inicio_vigencia: Date,
    data_fim_vigencia: Date,
    empresa_id: number,
    empresa?: Empresa,
    user_id: number,
    user?: User,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
}

export default PoliticaPrivacidade