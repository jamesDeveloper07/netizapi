import { Nota } from ".";
import { User } from "../Security";

type ParticipanteNota = {
    id: number | null,
    user_id?: number,
    nome?: string | null,
    nota_id: number | null,
    user?: User,
    nota?: Nota
}

export default ParticipanteNota