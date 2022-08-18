import { User } from "../Security";
import { Oportunidade } from '.'

enum Situacao {
    'A', 'I'
}

export default interface IComentarioOportunidade {
    id: number,
    created_at: Date,
    updated_at?: Date,
    descricao: string,
    situacao: Situacao,
    oportunidade_id: number,
    user_id: number,
    user?: User,
    oportunidade?: Oportunidade
}