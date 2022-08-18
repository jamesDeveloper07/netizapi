type Plano = {
    id: number,
    nome: string,
    descricao: string,
    preco: number,
    paypal_id?: string,
    situacao: 'A' | 'I',
    created_at: Date,
    updated_at?: Date,
}

export default Plano