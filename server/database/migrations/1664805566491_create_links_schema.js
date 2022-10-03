'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateLinksSchema extends Schema {
  up() {
    this.withSchema('shortener').create('links', (table) => {
      table.increments()
      table.text('url_destino').notNullable()
      table.string('codigo', 32)
      table.string('contexto')
      table.enu('situacao', ['A', 'I'], { useNative: true, enumName: 'situation_job_type' }).defaultTo('A')
      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('deleted_at')
    });
  }

  down() {
    this.withSchema('shortener').drop('links');
  }
}

module.exports = CreateLinksSchema
