'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateNotificacoesUsersSchema extends Schema {
  up() {
    this.withSchema('security').create('notificacoes_users', (table) => {
      table.integer('notificacao_id').notNullable().unsigned().references('id').inTable('security.notificacoes')
      table.integer('user_id').notNullable().unsigned().references('id').inTable('security.users')
      table
        .timestamp('created_at')
      table
        .timestamp('sended_at')
      table
        .timestamp('readed_at')
      table.primary(['notificacao_id', 'user_id'])
    })
  }

  down() {
    this.drop('notificacoes_users')
  }
}

module.exports = CreateNotificacoesUsersSchema
