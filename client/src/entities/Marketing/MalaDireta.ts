import {
    Canal,
    Orientacao
} from './index'
import { Empresa } from "../Common";
import { User } from "../Security";
import { EstagioEsteira } from "../Marketing";

export default interface IMalaDireta {
    id: number,
    nome: string,
    data_agendamento: Date,
    descricao?: string,
    email_assunto?: string,
    email_remetente_id?: number,
    origem: 'oportunidades' | 'esteira',
    situacao: 'ativo' | 'inativo' | 'em-andamento' | 'concluido' | 'cancelado'
    email_conteudo?: string,
    user_id: number,
    sms_conteudo?: string,
    enviar_sms?: boolean,
    enviar_email?: boolean,
    empresa_id: number,
    situacao_email: 'em-andamento' | 'concluido' | 'cancelado',
    situacao_sms: 'em-andamento' | 'concluido' | 'cancelado',
    estagio_id?: number,
    created_at?: Date,
    updated_at?: Date,
    user?: User,
    empresa?: Empresa,
    estagio: EstagioEsteira,
}