'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateLogEventosSchema extends Schema {
  up () {
    this.withSchema('common').create('log_evento', (table) => {
      table.increments()

      table.bigInteger('contract_id').notNullable()
      table.bigInteger('client_id').notNullable()
      table.string('name', 300)
      table.string('tx_id').unsigned().comment('Número do CPF ou CNPJ, somente números, sem separação')
      table.integer('type_tx_id').unsigned().comment('Tipo de tx_id: 1 - CNPJ | 2 - CPF')
      table.string('phone').unsigned().comment('Número de telefone, contendo DDI e DDD, somente números, sem separação')
      table.string('email').unsigned()
      table.bigInteger('stage').notNullable().comment('Id do estágio do contrato no ERP')
      table.string('v_stage').notNullable().comment('Descrição do estágio do contrato no ERP')
      table.bigInteger('status').notNullable().comment('Id do status do contrato no ERP')
      table.string('v_status').notNullable().comment('Descrição do status do contrato no ERP')
      table.boolean('deleted').notNullable().comment('Boleano referente a exclusão do contrato no erp')
      table.bigInteger('event_id').comment('Id do evento no ERP')
      table.bigInteger('event_type_id').comment('Id do tipo de evento no ERP')
      table.text('event_descricao').comment('Descrição do evento no ERP')
      table.timestamp('event_data').comment('Data do evento')
      table.string('itens')
      table.string('service_products')
      table.boolean('isservicodigital')
      table.boolean('isdeezer')
      table.bigInteger('deezer_item_id')
      table.boolean('iswatch')
      table.bigInteger('watch_item_id')
      table.boolean('ishbo')
      table.bigInteger('hbo_item_id')

      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down () {
    this.withSchema('common').drop('log_evento')
  }
}

module.exports = CreateLogEventosSchema
