'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddLogEventoIdInLogIntegracaoSchema extends Schema {
  up() {

    this.withSchema('common').table('log_integracao', (table) => {
      table.bigInteger('log_evento_id').unsigned().references('id').inTable('common.log_evento')
    })

  }

  down() {
    this.withSchema('common').table('log_integracao', (table) => {
      table.dropColumn('log_evento_id')
    })

  }
}

module.exports = AddLogEventoIdInLogIntegracaoSchema
