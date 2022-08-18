import { Cliente } from "../Common";
import { Empresa } from '../Common'
import { User } from '../Security'

export default interface IMensagem {
    id: number,
    cliente_id: number,
    empresa_id: number,
    origem: 'in' | 'out',
    canal: 'sms' | 'whatsapp' | 'email',
    colaborador_id?: number,
    referencia_externa_id?: string,
    destinatario: string,
    remetente: string,
    texto?: string,
    file_url?: string,
    file_mime_type?: string,
    file_caption?: string,
    latitude?: number,
    longitude?: number,
    tipo: 'text' | 'file' | 'location' | 'template',
    created_at: Date,
    updated_at: Date,
    data_confirmacao_envio?: Date,
    data_recebimento?: Date,
    data_leitura?: Date,
    data_falha?: Date,
    descricao_falha?: string,
    cliente?: Cliente,
    empresa?: Empresa,
    colaborador: User

}