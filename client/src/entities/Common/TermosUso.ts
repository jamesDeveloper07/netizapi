import { User } from "../Security";

type TermosUso = {
    id: number,
    nome: string,
    descricao: string,
    versao: string,
    link_url: string,
    data_inicio_vigencia: Date,
    data_fim_vigencia: Date,
    user_id: number,
    user?: User,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
}

export default TermosUso