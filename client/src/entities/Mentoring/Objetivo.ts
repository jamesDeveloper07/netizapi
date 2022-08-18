import { Estrategia } from ".";
import { QuestaoAlvo } from '.'
import { Empresa } from "../Common";
import { User } from "../Security";
import Acao from "./Acao";

type Objetivo = {
    id: number,
    estrategia_id: number,
    empresa_id: number,
    data_inicio: Date,
    responsavel_id: number,
    descricao: string,
    data_conclusao: Date,
    analise: string,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
    estrategia?: Estrategia,
    empresa?: Empresa,
    acoes?: Array<Acao>,
    quem?: Array<User>
    questao_alvo_id?: number,
    questaoAlvo?: QuestaoAlvo,
}

export default Objetivo