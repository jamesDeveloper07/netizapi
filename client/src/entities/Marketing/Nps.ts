import { Empresa, Cliente } from "../Common";
import { MalaDireta } from "../Marketing";

export default interface INps {
    id: number,
    cliente_id: number,
    cliente?: Cliente,
    empresa_id: number,
    empresa?: Empresa,
    mala_direta_id: number,
    mala_direta?: MalaDireta,
    nota: number,
    comentario: string,    
    created_at: Date
}