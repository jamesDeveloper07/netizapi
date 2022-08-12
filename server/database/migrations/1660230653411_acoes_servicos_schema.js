'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AcoesServicosSchema extends Schema {
  up() {
    this.withSchema('common').create('acoes_servicos', (table) => {
      table.increments()
      table.integer('servico_id').notNullable().unsigned().references('id').inTable('common.servicos')
      table.integer('acao_id').notNullable().unsigned().references('id').inTable('common.acoes')
      table
        .enu('status', ['ativo', 'inativo'])
        .notNullable()
        .comment('Coluna referente ao status da ação_serviço, que pode estar ativo ou inativo')

      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down() {
    this.withSchema('common').drop('acoes_servicos')
  }
}

module.exports = AcoesServicosSchema
