'use strict'

/*
|--------------------------------------------------------------------------
| S0007PermissionSeeder
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

class PermissionsSeeder {
  async run () {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)
      const supervisor = await Role.findBy({ slug: 'supervisor' }, trx)
      const relacionamento = await Role.findBy({ slug: 'relacionamento' }, trx)
      const financeiro = await Role.findBy({ slug: 'financeiro' }, trx)

      const permissionGerenciarTermo = await Permission.findOrCreate({ slug: 'gerenciar-termos-uso' }, {
        slug: 'gerenciar-termos-uso',
        name: 'Gerenciar Termos de Uso',
        description: 'Concede acesso a gestão de Termos de Uso do sistema.'
      }, trx)

      const permissionVerTodasSolicitacoes = await Permission.findOrCreate({ slug: 'ver-todas-solicitacoes' }, {
        slug: 'ver-todas-solicitacoes',
        name: 'Ver todas as solicitações',
        description: 'Concede permissão a ver as solicitações de todos os colaboradores.'
      }, trx)

      await trx.commit();

      await administrador.permissions().attach([
        permissionGerenciarTermo.id
      ], trx);

      await administrador.permissions().attach([
        permissionVerTodasSolicitacoes.id
      ], trx);

      await supervisor.permissions().attach([
        permissionVerTodasSolicitacoes.id
      ], trx);

      await relacionamento.permissions().attach([
        permissionVerTodasSolicitacoes.id
      ], trx);

      await financeiro.permissions().attach([
        permissionVerTodasSolicitacoes.id
      ], trx);

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = PermissionsSeeder
