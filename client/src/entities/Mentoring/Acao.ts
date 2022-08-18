import { Objetivo } from ".";
import { User } from "../Security";
import { Nota } from ".";


type Acao = {
    id: number,
    objetivo_id: number,
    o_que: string,
    quando: Date,
    como: string,
    situacao: 'nao_iniciado' | 'iniciado' | 'concluido' | 'nao_executado',
    objetivo?: Objetivo,
    users?: Array<User>,
    nota_id?: number,
    nota?: Nota
}

export const getSituacaoFontConfig = (situacao?: string): Object => {
    if (!situacao)
        //return Branco para ficar invisível
        return {fontSize: '130%', color: '#ffffff'}
    if (situacao == 'nao_iniciado') {
        //return cinza escuro
        return { fontSize: '130%', color: '#4e4e4e' }
    } else if (situacao == 'iniciado') {
        //return 'warning Amarelo'
        return { fontSize: '130%', color: '#ffd400' }
    } else if (situacao == 'concluido') {
        //return 'success Verde'
        return { fontSize: '130%', color: '#00ff14' }
    } else if (situacao == 'nao_executado') {
        //return 'danger vermelho'
        return { fontSize: '130%', color: '#f00' }
    } else {
        //return cinza
        return {fontSize: '130%', color: '#a0a0a0'}
    }
}

export const fixSituacaoAcao = (situacao?: string): string => {
    if (!situacao) return ''
    
    switch (situacao) {
        case 'nao_iniciado':
            return 'Não Iniciado'
        case 'concluido':
            return 'Concluído'
            
        case 'iniciado':
            return 'Iniciado'
            
        case 'nao_executado':
            return 'Não Executado'
            
        default:
            return situacao.toString();

    }
}


export default Acao