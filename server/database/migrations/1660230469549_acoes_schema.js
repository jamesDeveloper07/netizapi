'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AcoesSchema extends Schema {
  up () {
    this.withSchema('common').create('acoes', (table) => {
      table.increments()
      table.string('nome', 200).notNullable()
      table.string('descricao', 500).notNullable()
      table
        .enu('status', ['ativo', 'inativo'])
        .notNullable()
        .comment('Coluna referente ao status da ação, que pode estar ativo ou inativo')

      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down () {
    this.withSchema('common').drop('acoes')
  }
}

module.exports = AcoesSchema
