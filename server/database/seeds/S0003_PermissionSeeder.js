'use strict'

/*
|--------------------------------------------------------------------------
| PermissionSeeder
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


class PermissionSeeder {
  async run () {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)

      const permissionAcessarApi = await Permission.findOrCreate({ slug: 'acessar_api' }, {
        slug: 'acessar_api',
        name: 'Acessar Api',
        description: 'Concede acesso à api e suas funções.'
      }, trx)

      await trx.commit();

      await administrador.permissions().attach([
        permissionAcessarApi.id
      ], trx);

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = PermissionSeeder
