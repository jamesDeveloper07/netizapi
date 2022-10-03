'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateAcessosSchema extends Schema {
  up() {
    this.withSchema('shortener').create('acessos', (table) => {
      table.increments()
      table.text('ip_origem').notNullable()
      table.integer('contador').notNullable().defaultTo(1)
      table.integer('link_id').notNullable().unsigned().references('id').inTable('shortener.links')
      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('deleted_at')
    });
  }

  down() {
    this.withSchema('shortener').drop('acessos');
  }
}

module.exports = CreateAcessosSchema
