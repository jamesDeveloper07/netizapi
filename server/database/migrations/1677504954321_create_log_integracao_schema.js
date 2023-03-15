'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateLogIntegracaoSchema extends Schema {
  up() {
    this.withSchema('common').create('log_integracao', (table) => {
      table.increments()

      table.string('nome_cliente', 300)
      table.string('documento_cliente').unsigned().comment('Número do CPF ou CNPJ, somente números, sem separação')
      table.string('email_cliente').notNullable().unsigned()
      table.string('telefone_cliente').unsigned().comment('Número de telefone, contendo DDI e DDD, somente números, sem separação')
      table.string('cliente_erp_id').unsigned().comment('Id do cliente no ERP')

      table.integer('servico_id').unsigned().references('id').inTable('common.servicos')

      table.string('pacote_id').unsigned().comment('Id do pacote na plataforma watch')
      table.string('assinante_id_integracao').unsigned().comment('Id utilizado na integração com a plataforma watch')
      table.string('ticket').unsigned().comment('Ticket do assinante disponibilizado pela plataforma watch')

      table.string('protocolo_externo_id').unsigned().comment('Protocolo da solicitação em seu sistema de origem')
      // table.integer('acao_servico_id').notNullable().unsigned().references('id').inTable('common.acoes_servicos')
      table.string('acao').notNullable().unsigned()
      table
        .enu('status', ['pendente', 'executada', 'cancelada', 'falha', 'invalida'])
        .notNullable()
        .comment('Coluna referente ao status da ação, que pode estar pendente, executada, cancelada ou falha')
      table.string('status_detalhe').comment('Coluna destinada a detalhes referente ao status')

      table.integer('user_id').notNullable().unsigned().references('id').inTable('security.users').comment('Usuário que criou/executou a ação.')
      table.timestamp('data_evento')
      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down() {
    this.withSchema('common').drop('log_integracao')
  }
}

module.exports = CreateLogIntegracaoSchema
