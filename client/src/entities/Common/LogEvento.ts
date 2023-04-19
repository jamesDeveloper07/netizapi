import { User } from "../Security";

type LogEvento = {
    id: number,
    contract_id: number,
    client_id: number,
    name: string,
    
    tx_id: string,
    type_tx_id: number,
    phone?: string,
    email?: string,
    
    stage: number,
    v_stage: string,
    status: number,
    v_status: string,
    
    deleted: boolean,
    
    event_id?: number,
    event_type_id?: number,    
    event_descricao?: string,
    event_data: Date,

    itens?: string,
    service_products?: string,

    isservicodigital: boolean,
    isdeezer: boolean,
    deezer_item_id?: number,
    iswatch: boolean,
    watch_item_id?: number,
    ishbo: boolean,
    hbo_item_id?: number,

    user_id: number,
    user?: User,

    created_at: Date,
    updated_at: Date,
    deleted_at?: Date

}

export default LogEvento