'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateMenusSchema extends Schema {
  up() {
    this.withSchema('security').create('menus', (table) => {
      table.increments()
      table.string('nome')
        .notNullable()
      table.string('alias')
        .notNullable()
        .unique()
        .comment('o apelido é uma key para o menu usada internamente no sistema')
      table.string('path')
        .unique()
      table.string('icon')
      table.boolean('is_ativo')
        .notNullable()
        .defaultTo(false)
      table.integer('ordem')
        .defaultTo(99)
      table.boolean('hidden')
        .notNullable()
        .defaultTo(true)
        .comment('define se o menu estará visivel na sidebar')
      table.integer('parent_menu_id')
        .references('id')
        .inTable('security.menus')
      table.unique(['nome', 'path'])

      table.timestamps()
    })
  }

  down() {
    this.withSchema('security').drop('menus')
  }
}

module.exports = CreateMenusSchema
