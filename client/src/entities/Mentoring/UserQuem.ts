import { Acao } from ".";
import { User } from "../Security";

type UserQuem = {
    id: number,
    user_id: number,
    acao_id: number,
    user?: User,
    acao?: Acao
}

export default UserQuem