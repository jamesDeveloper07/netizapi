import { Empresa } from '.'

type SiteEmpresa = {
    id: number,
    empresa_id: number,
    nome: string,
    path: string,
    situacao: 'A' | 'I',
    empresa?: Empresa

}

export default SiteEmpresa