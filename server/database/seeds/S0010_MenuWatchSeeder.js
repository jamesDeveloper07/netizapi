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

class MenuWatchSeeder {
  async run () {

    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)
      const parentMenu = await Menu.findBy({ alias: 'administracao_parent' }, trx)

      const menuWatch = await Menu.findOrCreate({ alias: 'watch' }, {
        nome: 'Watch',
        alias: 'watch',
        path: '/watch/pacotes',
        icon: 'fas fa-tv',
        is_ativo: true,
        ordem: 99,
        hidden: false,
        parent_menu_id: parentMenu.id,
      })

      const menuTickets = await Menu.findOrCreate({ alias: 'tickets' }, {
        nome: 'Tickets',
        alias: 'tickets',
        path: '/watch/pacotes/:codigo/tickets',
        icon: null,
        is_ativo: true,
        ordem: 99,
        hidden: true,
        parent_menu_id: menuWatch.id
      })

      const menuNovosTickets = await Menu.findOrCreate({ alias: 'novos-tickets' }, {
        nome: 'Novos Assinantes',
        alias: 'novos-tickets',
        path: '/watch/pacotes/:codigo/tickets/new',
        icon: null,
        is_ativo: true,
        ordem: 99,
        hidden: true,
        parent_menu_id: menuWatch.id
      })

      await menuWatch.roles().attach([
        administrador.id
      ]);

      await menuTickets.roles().attach([
        administrador.id
      ]);

      await menuNovosTickets.roles().attach([
        administrador.id
      ]);

      await trx.commit();

    } catch (error) {
      await trx.rollback()
      throw error
    }

  }
}

module.exports = MenuWatchSeeder
