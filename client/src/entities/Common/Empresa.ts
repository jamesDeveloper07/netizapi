import { string } from "prop-types"

export default interface Empresa {
    id: number,
    nome: string,
    cnpj?: string,
    logo?: string,
    logo_url?: string,
    site?: string,
    dias_cadastro?: number,
    assinatura_id?: string,
    assinatura_status?: string,
    termos_uso_id?: number,
    periodo_cortesia?: number
}