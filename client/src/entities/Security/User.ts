import Role from './Role'

export default interface User {
    id: number | null,
    email: string,
    name: string,
    linceciado_id?: number,
    status?: boolean
    avatar?: string,
    avatar_url?: string,
    roles: Array<Role>
}