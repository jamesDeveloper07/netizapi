'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateJobsSchema extends Schema {
  up() {
    this.withSchema('common').create('jobs', (table) => {
      table.increments()
      table
        .string('job_key')
        .notNullable()
        .unique()
      table
        .string('descrição', 200)
      table
        .enu('situacao', ['A', 'I'],
          { useNative: true, enumName: 'situation_job_type' })
        .defaultTo('A')

      table
        .integer('periodo_intervalo_execucao')
        .notNullable()
        .defaultTo(180)
        .comment('Valor referente ao intervalo entre as execuções do job, medido em segundos.')

      table
        .integer('periodo_alerta')
        .notNullable()
        .defaultTo(0)
        .comment('Valor referente ao tempo limite para acionar um alerta de não execução do job dentro do horário, medido em segundos.')

      table.timestamp('last_run_at')

      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()

    });
  }

  down() {
    this.withSchema('common').drop('jobs');
  }
}

module.exports = CreateJobsSchema
