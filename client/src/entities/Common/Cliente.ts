import { Telefone, Empresa } from './index'

enum Sexo {
    'M',
    'F',
    'O'
}

enum TipoPessoa {
    'F',
    'J'
}

export default interface ICliente {
    id: number,
    created_at: Date,
    updated_ate: Date,
    nome: string,
    cpf_cnpj: string,
    tipo_pessoa: TipoPessoa,
    data_nascimento?: Date,
    sexo: Sexo,
    empresa_id: number,
    email?: string,
    tags?: string,
    pessoa_contato?: string,
    telefones?: Array<Telefone>,
    empresa?: Empresa
}