'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateCommonSchema extends Schema {
  up () {
    this.raw(`CREATE SCHEMA IF NOT EXISTS common`);
  }

  down () {
    this.raw('DROP SCHEMA IF EXISTS common');
  }
}

module.exports = CreateCommonSchema
