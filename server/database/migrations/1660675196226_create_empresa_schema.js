'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateEmpresaSchema extends Schema {
  up() {
    this.withSchema('common').create('empresas', (table) => {
      table.increments()
      table.string('nome', 200).notNullable()
      table.string('cnpj', 200)
      table.string('site', 100)
      table.string('logo', 200)
      table.text('observacoes')
      table.string('status', 1).notNullable().defaultTo('A')
      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down() {
    this.withSchema('common').drop('empresas')
  }
}

module.exports = CreateEmpresaSchema
