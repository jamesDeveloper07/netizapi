'use strict'

/*
|--------------------------------------------------------------------------
| S0010MenuWatchSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
const Menu = use('App/Models/Security/Menu')
const Role = use('Adonis/Acl/Role')

class MenuLogIntegracaoSeeder {
  async run () {

    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)
      const parentMenu = await Menu.findBy({ alias: 'administracao_parent' }, trx)

      const menuLog = await Menu.findOrCreate({ alias: 'log_integracao' }, {
        nome: 'Log Integração',
        alias: 'log_integracao',
        path: '/log_integracao',
        icon: 'fa fa-history',
        is_ativo: true,
        ordem: 99,
        hidden: false,
        parent_menu_id: parentMenu.id,
      })

      await menuLog.roles().attach([
        administrador.id
      ]);

      await trx.commit();

    } catch (error) {
      await trx.rollback()
      throw error
    }

  }
}

module.exports = MenuLogIntegracaoSeeder