'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateModulosSchema extends Schema {
  up() {
    this.withSchema('security').create('modulos', (table) => {
      table.increments()
      table.string('nome').notNullable().unique()
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
    this.drop('modulos')
  }
}

module.exports = CreateModulosSchema
