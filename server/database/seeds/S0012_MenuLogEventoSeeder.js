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

class MenuLogEventoSeeder {
  async run () {

    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)
      const supervisor = await Role.findBy({ slug: 'supervisor' }, trx)
      const relacionamento = await Role.findBy({ slug: 'relacionamento' }, trx)
      const financeiro = await Role.findBy({ slug: 'financeiro' }, trx)

      const parentMenu = await Menu.findBy({ alias: 'administracao_parent' }, trx)

      const menuLog = await Menu.findOrCreate({ alias: 'log_evento' }, {
        nome: 'Log Evento',
        alias: 'log_evento',
        path: '/log_evento',
        icon: 'fa fa-history',
        is_ativo: true,
        ordem: 99,
        hidden: false,
        parent_menu_id: parentMenu.id,
      })

      await menuLog.roles().attach([
        administrador.id
      ]);

      await menuLog.roles().attach([
        supervisor.id
      ]);

      await menuLog.roles().attach([
        relacionamento.id
      ]);

      await menuLog.roles().attach([
        financeiro.id
      ]);

      await trx.commit();

    } catch (error) {
      await trx.rollback()
      throw error
    }

  }
}

module.exports = MenuLogEventoSeeder
