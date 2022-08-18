'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class RoleMenu extends Model {

    static get table() {
        return 'security.roles_menus'
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

    menu() {
        return this.belongsTo('App/Models/Security/Menu')
    }
}

module.exports = RoleMenu
