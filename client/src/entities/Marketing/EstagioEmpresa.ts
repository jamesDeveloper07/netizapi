import { Estagio, } from './'
import { Empresa, } from '../Common'

export default interface IEstagioEmpresa {
    id: number,
    estagio_id: number,
    empresa_id: number,
    ordem: number,
    estagio?: Estagio,
    empresa?: Empresa
}