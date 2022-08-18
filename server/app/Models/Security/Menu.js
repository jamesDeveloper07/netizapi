'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Menu extends Model {

    static get table() {
        return 'security.menus'
    }


    roles() {
        return this.belongsToMany('App/Models/Security/RoleMenu', 'menu_id', 'role_id', 'id', 'id').pivotTable('security.roles_menus')
    }
}

module.exports = Menu
