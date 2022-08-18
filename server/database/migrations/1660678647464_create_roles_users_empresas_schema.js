'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateRolesUsersEmpresasSchema extends Schema {
  up() {
    this.withSchema('security').create('roles_users_empresas', (table) => {
      table.increments()
      table.integer('role_id').unsigned().references('id').inTable('public.roles').notNullable().onDelete('cascade')
      table.integer('user_id').unsigned().references('id').inTable('security.users').notNullable().onDelete('cascade')
      table.integer('empresa_id').unsigned().references('id').inTable('common.empresas').notNullable().onDelete('cascade')
      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
    })
  }

  down() {
    this.withSchema('security').drop('roles_users_empresas')
  }
}

module.exports = CreateRolesUsersEmpresasSchema
