'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddNewColumnsToUserSchema extends Schema {
  up() {
    this.withSchema('security').table('users', (table) => {
      table
        .boolean('status')
        .defaultTo(true)
        .notNullable()
        table.string('avatar')
        table.string('recovery_password_token', 200)
    })
  }

  down() {
    this.withSchema('security').table('users', (table) => {
      table.dropColumn('status')
      table.dropColumn('avatar')
      table.dropColumn('recovery_password_token')
    })
  }
}

module.exports = AddNewColumnsToUserSchema
