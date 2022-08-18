import { User } from '../Security'
import { Empresa, MotivoEncerramento, PoliticaPrivacidade } from '../Common'
import {
    Campanha,
    Anuncio,
    Estagio,
    Expectativa,
    Produto,
    ComentarioOportunidade
} from '../Marketing'

export default interface IOportunidade {
    id: number,
    created_at: Date,
    updated_at: Date,
    dt_ultimo_estagio: Date,
    empresa_id: number,
    estagio_id: number,
    expectativa_id: number,
    cliente_id: number,
    campanha_id: number,
    anuncio_id: number,
    data_agendamento: Date,
    data_origem?: Date,
    descricao?: string,
    referencia_externa_id?: string,
    motivo_encerramento_id?: number,
    data_encerramento?: Date,
    deleted_at?: Date,
    criador_id?: number,
    user_id?: number,
    user?: User,
    empresa?: Empresa,
    campanha?: Campanha,
    anuncio?: Anuncio,
    motivoEncerramento?: MotivoEncerramento,
    estagio: Estagio,
    expectativa?: Expectativa,
    produtos?: Array<Produto>,
    comentarios?: Array<ComentarioOportunidade>
    politica_privacidade_id?: number,
    politicaPrivacidade?: PoliticaPrivacidade,
    data_assinatura_politica?: Date,
    tipo_assinatura_politica?: string
}