'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SolicitacoesClienteAcaoServicoSchema extends Schema {
  up() {
    this.withSchema('common').create('solicitacoes_cliente_acao_servicos', (table) => {
      table.increments()
      table.integer('cliente_id').notNullable().unsigned().references('id').inTable('common.clientes')
      table.integer('acao_servico_id').notNullable().unsigned().references('id').inTable('common.acoes_servicos')
      table
        .enu('status', ['pendente', 'finalizada', 'cancelada', 'falha'])
        .notNullable()
        .comment('Coluna referente ao status da solicitação, que pode estar pendente, finalizada, cancelada ou falha')
      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('finished_at').comment('Data referente a finalização da solicitação, quando seu status for finalizada')
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
      // table.unique(['cliente_id', 'acao_servico_id'])
    })
  }

  down() {
    this.withSchema('common').drop('solicitacoes_cliente_acao_servicos')
  }
}

module.exports = SolicitacoesClienteAcaoServicoSchema
