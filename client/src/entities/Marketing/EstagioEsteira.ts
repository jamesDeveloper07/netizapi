import { Esteira, MalaDireta } from "./";


export default interface IEstagioEsteira {
    id: number,
    esteira_id: number,
    nome: string,
    ordem: number,
    executar_em_estagios_anteriores: boolean,
    avanco_automatico: boolean,
    fluxo: 'periodo' | 'data',
    data_execucao?: Date,
    periodo_execucao?: number,
    situacao: 'A' | 'I',
    created_at?: Date,
    updated_at?: Date,
    deleted_at?: Date
    esteira?: Esteira
    malaDireta?: MalaDireta,
    mala_direta?: MalaDireta
}