import { GrupoEstrategico } from '.'
import { Objetivo } from ".";
import { User } from '../Security';

type Estrategia = {
    id: number | null,
    nome: string,
    descricao: string,
    grupo_estrategico_id: number,
    grupoEstrategico?: GrupoEstrategico,
    objetivos?: Array<Objetivo>,
    quem?: Array<User>
}

export default Estrategia