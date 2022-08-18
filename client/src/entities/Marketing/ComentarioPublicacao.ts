import { User } from '../Security'
export default interface ComentarioPublicacao {
    id?: number,
    user_id: number,
    user?: User,
    texto: string,
    tipo: string,
    publicacao_id: number,
    created_at: Date,
    updated_at: Date,
}