'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateSubmodulosSchema extends Schema {
  up() {
    this.withSchema('security').create('submodulos', (table) => {
      table.increments()
      table.string('nome').notNullable().unique()
      table.integer('modulo_id').notNullable().unsigned().references('id').inTable('security.modulos')
      table.integer('qtd_dias_coleta').notNullable().defaultTo(2).comment('quantidade de dias que uma notificação deste submodulo será mantida, antes de ser apagada pelo coletor.')
      table.string('icon_font')
      table
        .string('status', 1)
        .notNullable()
        .defaultTo('A')
      table
        .timestamp('created_at')
        .defaultTo(this.fn.now())
        .notNullable()
      table
        .timestamp('updated_at')
        .defaultTo(this.fn.now())
        .notNullable()
    })
  }

  down() {
    this.drop('submodulos')
  }
}

module.exports = CreateSubmodulosSchema
