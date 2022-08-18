'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Device extends Model {

    static get table() {
        return 'security.devices'
    }

    user() {
        return this.belongsTo('App/Models/Security/Users')
    }
}

module.exports = Device
