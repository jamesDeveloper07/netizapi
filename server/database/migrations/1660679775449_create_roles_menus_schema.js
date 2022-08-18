'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateRolesMenusSchema extends Schema {
  up() {
    this.withSchema('security').create('roles_menus', (table) => {
      table.increments()
      table.integer('role_id').unsigned().references('id').inTable('roles').notNullable().onDelete('cascade')
      table.integer('menu_id').unsigned().references('id').inTable('security.menus').notNullable().onDelete('cascade')
      table.unique(['role_id', 'menu_id'])
      table.timestamps()
    })
  }

  down() {
    this.withSchema('security').drop('roles_menus')
  }
}

module.exports = CreateRolesMenusSchema
