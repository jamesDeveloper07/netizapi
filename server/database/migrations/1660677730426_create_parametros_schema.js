'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateParametrosSchema extends Schema {
  up () {
    this.withSchema('common').create('parametros', (table) => {
      table.increments()
      table
        .string('chave', 200)
        .notNullable()
        .unique()
      table
        .text('valor')
        .notNullable()
      table
        .text('descricao')
        .notNullable()
    })
  }

  down () {
    this.withSchema('common').drop('parametros')
  }
}

module.exports = CreateParametrosSchema
