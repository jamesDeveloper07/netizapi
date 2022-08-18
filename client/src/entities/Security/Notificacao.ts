//import { User } from "../Security/User";

enum Situacao {
    'A', 'I'
}

/*
export default interface INotificacao {
    id: number,
    descricao: string,
    tipo_notificacao:string,
    path:string,
    icon:string,
    user_id: number,
    user?: User,
    situacao: Situacao, 
}
*/


export default interface INotificacao {
    id: number,
    user_id: number,
    user_name: string,

    titulo: string,
    mensagem: string,
    acao_clique_url?: string,

    icone_url?: string,
    icon_font?: string,
    origem_id?: number,

    modulo_id: number,
    modulo_nome: string,
    submodulo_id: number,
    submodulo_nome: string,
    
    created_at: Date,
    scheduled_to: Date,
    sended_at?: Date,
    readed_at?: Date,
    updated_at?: Date
    
    //user?: User,

    situacao: Situacao
}

    