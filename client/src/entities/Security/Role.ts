import Permission from "./Permission";

export default interface Role {
    id: number,
    name: string,
    slug: string
    permissions?: Array<Permission>
}