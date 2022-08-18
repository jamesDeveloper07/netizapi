'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RoleUserEmpresa extends Model {

    static get table() {
        return 'security.roles_users_empresas'
    }

    static get updatedAtColumn() {
        return null
    }

    static get createdAtColumn() {
        return null
    }

    role() {
        return this.belongsTo('Adonis/Acl/Role')
    }

    user() {
        return this.belongsTo('App/Models/Security/User')
    }

    empresa() {
        this.belongsTo('App/Models/Common/Empresa')
    }

}

module.exports = RoleUserEmpresa
