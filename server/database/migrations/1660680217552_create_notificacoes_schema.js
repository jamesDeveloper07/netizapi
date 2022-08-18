'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateNotificacoesSchema extends Schema {
  up() {
    this.withSchema('security').create('notificacoes', (table) => {
      table.increments()
      table.integer('submodulo_id').notNullable().unsigned().references('id').inTable('security.submodulos')
      table.string('titulo').notNullable()
      table.text('mensagem').notNullable()
      table.string('acao_clique_url')
      table.string('icone_url')
      table.bigint('origem_id')
      table
        .timestamp('created_at')
        .defaultTo(this.fn.now())
        .notNullable()
      table
        .timestamp('scheduled_to')
        .defaultTo(this.fn.now())
        .notNullable()
      table
        .timestamp('updated_at')
        .defaultTo(this.fn.now())
        .notNullable()
    })
  }

  down() {
    this.withSchema('security').drop('notificacoes')
  }
}

module.exports = CreateNotificacoesSchema
