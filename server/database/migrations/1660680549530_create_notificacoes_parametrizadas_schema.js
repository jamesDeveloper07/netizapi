'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateNotificacoesParametrizadasSchema extends Schema {
  up() {
    this.withSchema('security').create('notificacoes_parametrizadas', (table) => {
      table.increments()
      table.string('titulo').notNullable()
      table.text('descricao').notNullable()
      table.text('texto_select').notNullable()
      table.enu('tipo_controle_periodo', ['temporal', 'atemporal']).defaultTo('temporal').comment('Tipo de controle quanto a periodicidade de geração desta notificação. Quando Temporal, definir o valor do intervalo do período.').notNullable()
      table.integer('valor_intervalo_periodo').comment('Valor referente ao intervalo de geração, quando tipo controle for temporal.').defaultTo(1440).notNullable()
      table.enu('status', ['A', 'I']).defaultTo('I').notNullable()
      table.timestamp('data_proxima_execucao').comment('Data para a próxima execução do processo de geração de notificação.').notNullable()
      table.timestamp('data_ultima_execucao').comment('Data em que o processo de geração de notificação foi executado pela última vez.')
      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
    })
  }

  down() {
    this.withSchema('security').drop('notificacoes_parametrizadas')
  }
}

module.exports = CreateNotificacoesParametrizadasSchema
