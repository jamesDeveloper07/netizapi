import { Nota } from ".";

type TipoNota = {
    id: number,
    nome: string,
    descricao: string,
    icone: string,
    situacao: 'A' | 'I',
    created_at: Date,
    updated_at: Date,
    deleted_at?: Date
    notas?: Array<Nota>
}

export default TipoNota