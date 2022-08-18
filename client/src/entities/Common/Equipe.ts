import { User } from "../Security";


enum Situacao {
    'A', 'I'
}

export default interface Empresa {
    id: number,
    empresa_id: number,
    captadora: Situacao,
    nome: string,
    membros?: Array<User>,
    __meta__?: {
        membros_count: string
    }
}