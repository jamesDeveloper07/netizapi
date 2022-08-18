import { Empresa, } from '../Common'
import { User } from "../Security";
import { QuestaoAlvo } from '.'

type PlanoEstrategico = {
    id: number,
    nome: string,
    descricao: string,
    data_inicio: Date,
    data_conclusao: Date,
    
    empresa_id: number,
    empresa?: Empresa,
    user_id: number,
    user?: User,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date,
    questoesAlvo?: Array<QuestaoAlvo>
}

export default PlanoEstrategico