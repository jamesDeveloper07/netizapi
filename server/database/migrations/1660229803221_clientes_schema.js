'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ClientesSchema extends Schema {
  up() {
    this.withSchema('common').create('clientes', (table) => { 
      table.increments()
      table.string('nome', 300).notNullable()
      table.string('documento').notNullable().unsigned().comment('Número do CPF ou CNPJ, somente números, sem separação')
      table.string('telefone').notNullable().unsigned().comment('Número de telefone, contendo DDI e DDD, somente números, sem separação')
      table
        .enu('status', ['ativo', 'inativo'])
        .notNullable()
        .comment('Coluna referente ao status do cliente, que pode estar ativo ou inativo')

      table.string('origem').notNullable().unsigned().comment('Nome do sistema de origem do cliente')
      table.integer('externo_id').notNullable().unsigned().comment('Coluna referente ao id do cliente no sistema de origem')

      table.timestamp('created_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.fn.now())
      table.timestamp('deleted_at')
    })
  }

  down() {
    this.withSchema('common').drop('clientes')
  }
}

module.exports = ClientesSchema
