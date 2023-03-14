'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ServicosSchema extends Schema {
  up() {
    this.withSchema('common').create('servicos', (table) => {
      table.increments()
      table.string('nome', 200).notNullable()
      table.string('descricao', 500).notNullable()
      table
        .enu('status', ['ativo', 'inativo'])
        .notNullable()
        .comment('Coluna referente ao status do serviço, que pode estar ativo ou inativo')
      table.boolean('integracao_by_api').defaultTo(false).notNullable()
      table.string('integracao_id', 25)
      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down() {
    this.withSchema('common').drop('servicos')
  }
}

module.exports = ServicosSchema
