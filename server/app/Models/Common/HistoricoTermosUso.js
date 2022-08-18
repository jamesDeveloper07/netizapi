'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class HistoricoTermosUso extends Model {

    static get table() {
        return 'common.historicos_termos_uso'
    }

    static get createdAtColumn() {
        return null
    }

    static get updatedAtColumn() {
        return null
    }

    user() {
        return this.belongsTo('App/Models/Security/User')
    }

    empresa() {
        return this.belongsTo('App/Models/Common/Empresa')
    }

    termosUso() {
        return this.belongsTo('App/Models/Common/TermosUso', 'termos_uso_id', 'id')
    }
}

module.exports = HistoricoTermosUso
