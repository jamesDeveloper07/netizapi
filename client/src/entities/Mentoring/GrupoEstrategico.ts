import { Estrategia } from ".";

type GrupoEstrategico = {
    id: number,
    nome: string,
    descricao: string,
    estrategias?: Array<Estrategia>
}

export default GrupoEstrategico