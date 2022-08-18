
export default interface Persona {
    id: number,
    nome: string,
    comportamento: string,
    caracteristicas: string,
    deleted_at?: Date,
    avatar?: string,
    avatar_url?: string,
}