'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Job extends Model {
  static get table() {
    return 'common.jobs';
  }
}

module.exports = Job;
