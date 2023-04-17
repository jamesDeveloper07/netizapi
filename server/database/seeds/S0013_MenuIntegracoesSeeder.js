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


class MenuIntegracoesSeeder {
  async run() {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)
      const supervisor = await Role.findBy({ slug: 'supervisor' }, trx)
      const relacionamento = await Role.findBy({ slug: 'relacionamento' }, trx)
      const financeiro = await Role.findBy({ slug: 'financeiro' }, trx)

      const menuIntegracoes = await Menu.findOrCreate({ alias: 'integracoes_parent' }, {
        nome: 'Integrações',
        alias: 'integracoes_parent',
        path: null,
        icon: 'fa fa-share-alt',
        is_ativo: true,
        ordem: 3,
        hidden: false,
        parent_menu_id: null
      })

      const menuContratos = await Menu.findOrCreate({ alias: 'contratos_by_eventos' }, {
        nome: 'Contratos',
        alias: 'contratos_by_eventos',
        path: '/contratos_by_eventos',
        icon: 'fas fa-file-contract',
        is_ativo: true,
        ordem: 1,
        hidden: false,
        parent_menu_id: menuIntegracoes.id
      })

      await menuIntegracoes.roles().attach([
        administrador.id
      ]);
      await menuIntegracoes.roles().attach([
        supervisor.id
      ]);
      await menuIntegracoes.roles().attach([
        relacionamento.id
      ]);
      await menuIntegracoes.roles().attach([
        financeiro.id
      ]);

      await menuContratos.roles().attach([
        administrador.id
      ]);

      await menuContratos.roles().attach([
        supervisor.id
      ]);

      await menuContratos.roles().attach([
        relacionamento.id
      ]);
      await menuContratos.roles().attach([
        financeiro.id
      ]);

      await trx.commit();

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = MenuIntegracoesSeeder
