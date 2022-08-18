'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateUsersEmpresasSchema extends Schema {
  up() {
    this.withSchema('security').create('users_empresas', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('security.users').notNullable().onDelete('cascade')
      table.integer('empresa_id').unsigned().references('id').inTable('common.empresas').notNullable().onDelete('cascade')

      table.enu('situacao', ['A', 'I']).defaultTo('A').notNullable()
      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
      table.unique(['user_id', 'empresa_id'])
    })
  }

  down() {
    this.withSchema('security').drop('users_empresas')
  }
}

module.exports = CreateUsersEmpresasSchema
