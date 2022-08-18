'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateDevicesSchema extends Schema {
  up() {
    this.withSchema('security').create('devices', (table) => {
      table.increments()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('security.users')
      table.string('codigo')//.notNullable()
      table.string('token').notNullable().unique().index()
      table.string('type', 20).notNullable()
      table
        .string('status', 1)
        .notNullable()
        .defaultTo('A')
      table
        .timestamp('created_at')
        .defaultTo(this.fn.now())
        .notNullable()
      table
        .timestamp('updated_at')
        .defaultTo(this.fn.now())
        .notNullable()
      //table.unique(['user_id', 'token'], 'user_device_unique')
    })
  }

  down() {
    this.drop('devices')
  }
}

module.exports = CreateDevicesSchema
