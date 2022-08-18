import {Equipe} from '../Common'

export default interface EquipeAnuncio {
    id: number,
    anuncio_id: number,
    equipe_id: number,
    equipe?: Equipe
}