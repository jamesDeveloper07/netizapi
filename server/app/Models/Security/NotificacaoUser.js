'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class NotificacaoUser extends Model {

    static get table() {
        return 'security.notificacoes_users'
    }

    static get updatedAtColumn() {
        return null
    }

    static get primaryKey() {
        return ['notificacao_id', 'user_id']
    }

    static get incrementing() {
        return false
    }

    notificacao() {
        return this.belongsTo('App/Models/Security/Notificacao')
    }

    user() {
        return this.belongsTo('App/Models/Security/User')
    }
}

module.exports = NotificacaoUser
