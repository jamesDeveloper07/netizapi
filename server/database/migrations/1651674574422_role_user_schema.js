'use strict'

const Schema = use('Schema')

class RoleUserTableSchema extends Schema {
  up() {
    this.create('role_user', table => {
      table.increments()
      table.integer('role_id')
        .unsigned()
        .references('id')
        .inTable('roles')
        .notNullable()
        .onDelete('cascade')
        table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('security.users')
        .notNullable()
        .onDelete('cascade')
        table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
    })
  }

  down() {
    this.drop('role_user')
  }
}

module.exports = RoleUserTableSchema
