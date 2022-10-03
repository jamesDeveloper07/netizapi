'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateShortenerSchema extends Schema {
  up() {
    this.raw(`CREATE SCHEMA IF NOT EXISTS shortener`);
  }

  down() {
    this.raw('DROP SCHEMA IF EXISTS shortener');
  }

}

module.exports = CreateShortenerSchema
