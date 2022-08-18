import {
    Canal,
    Orientacao,
    Funil
} from './index'
import { Cliente } from "../Common";
import { Campanha } from "../Marketing";

enum Situacao {
    'ativo',
    'inativo',
    'em_analise',
    'Não Aprovado'
}

export default interface IAnuncio {
    id: number,
    nome: string,
    dt_inicio: Date,
    dt_fim: Date,
    situcao: Situacao,
    canal_id: number,
    orientacao_id: number,
    valor: number,
    segmentacao: string,
    rede_social_id: string,
    canal?: Canal,
    orientacao?: Orientacao,
    clinte: Cliente,
    campanha?: Campanha,
    afiliado_id?: number,
    funil_padrao_id: number,
    funil?: Funil
}