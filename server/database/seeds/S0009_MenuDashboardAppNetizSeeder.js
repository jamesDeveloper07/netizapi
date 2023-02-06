'use strict'

/*
|--------------------------------------------------------------------------
| S0009MenuDashboardAppNetizSeeder
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


class MenuDashboardAppNetizSeeder {
  async run () {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)

      const menuDashboard = await Menu.findOrCreate({ alias: 'dashboard_parent' }, {
        nome: 'Dashboard',
        alias: 'dashboard_parent',
        path: null,
        icon: 'ni ni-chart-pie-35',
        is_ativo: true,
        ordem: 1,
        hidden: false,
        parent_menu_id: null
      })

      const menuDashboardAppNetiz = await Menu.findOrCreate({ alias: 'dashboard_app_netiz' }, {
        nome: 'App Netiz',
        alias: 'dashboard_app_netiz',
        path: '/dashboard/app-netiz',
        icon: 'fas fa-mobile-alt',
        is_ativo: true,
        ordem: 1,
        hidden: false,
        parent_menu_id: menuDashboard.id
      })

      await menuDashboard.roles().attach([
        administrador.id
      ]);

      await menuDashboardAppNetiz.roles().attach([
        administrador.id
      ]);

      await trx.commit();

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = MenuDashboardAppNetizSeeder
