import { User } from "../Security";
import { Nota } from '.'

enum Situacao {
    'A', 'I'
}

type AnotacaoNota = {
    id: number,
    descricao: string,
    situacao: Situacao,
    nota_id: number,
    nota?: Nota,
    user_id: number,
    user?: User,
    created_at: Date,
    updated_at?: Date,
    deleted_at?: Date
}

export default AnotacaoNota;