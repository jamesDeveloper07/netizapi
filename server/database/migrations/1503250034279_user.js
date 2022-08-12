'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.raw(`CREATE SCHEMA IF NOT EXISTS security`)
    this.withSchema('security').create('users', (table) => {
      table.increments()
      table.string('name', 200).notNullable().unique()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.withSchema('security').drop('users')	
    this.raw(`DROP SCHEMA IF EXISTS security`)
  }
}

module.exports = UserSchema
