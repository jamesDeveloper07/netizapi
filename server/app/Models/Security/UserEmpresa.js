'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserEmpresa extends Model {

    static get table() {
        return 'security.users_empresas'
    }

    user() {
        return this.belongsTo('App/Models/Security/User')
    }

    empresa() {
        return this.belongsTo('App/Models/Common/Empresa')
    }

    static get createdAtColumn() {
        return null
    }

    static get updatedAtColumn() {
        return null
    }

}

module.exports = UserEmpresa
