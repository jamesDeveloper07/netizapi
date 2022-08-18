import { TipoNota } from '.'
import { User } from '../Security';
import { Empresa } from "../Common";
import { AnotacaoNota } from ".";
import { Acao } from ".";
import { ParticipanteNota } from ".";

type Nota = {
    id: number | null,
    tema: string,
    descricao: string,
    tipo_nota_id: number,
    tipoNota?: TipoNota,
    user_id: number,
    user?: User,
    empresa_id: number,
    empresa?: Empresa,
    data_anotacao: Date,
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date,
    anotacoes?: Array<AnotacaoNota>,
    acoes?: Array<Acao>,
    participantes?: Array<ParticipanteNota>
}

export default Nota