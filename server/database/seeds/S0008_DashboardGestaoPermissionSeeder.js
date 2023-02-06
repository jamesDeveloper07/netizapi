'use strict'

/*
|--------------------------------------------------------------------------
| S0007DashboardAppNetizSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
const Permission = use('Adonis/Acl/Permission')
const Role = use('Adonis/Acl/Role')

class DashboardGestaoPermissionSeeder {
  async run () {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)

      const permissionVerDashboardGestao = await Permission.findOrCreate({ slug: 'ver-dashboard-gestao' }, {
        slug: 'ver-dashboard-gestao',
        name: 'Ver Dashboard Gestão',
        description: 'Concede acesso ao Dashboard Gestão.'
      }, trx)

      await trx.commit();

      await administrador.permissions().attach([
        permissionVerDashboardGestao.id
      ], trx);

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = DashboardGestaoPermissionSeeder
