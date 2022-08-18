import { PlanoEstrategico } from '.'
import { Objetivo } from ".";

enum Status {
    'A', 'N'
}

type Estrategia = {
    id: number | null,
    
    nome: string,
    descricao: string,
    objetivo_inicial: string,
    objetivo_final: string,
    situacao_atual: string,
    status: Status,

    plano_estrategico_id: number,
    planoEstrategico?: PlanoEstrategico,

    objetivos?: Array<Objetivo>    
}

export default Estrategia