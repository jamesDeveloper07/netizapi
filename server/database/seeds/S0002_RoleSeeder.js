'use strict'

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
const Role = use('Adonis/Acl/Role')
const User = use('App/Models/Security/User')

class RoleSeeder {
  async run() {
    const trx = await Database.beginTransaction();
    try {

      const administrador = await User.findBy({ username: 'administrador' }, trx)
      const supervisor = await User.findBy({ username: 'supervisor' }, trx)
      const atendente = await User.findBy({ username: 'atendente' }, trx)
      const relacionamento = await User.findBy({ username: 'relacionamento' }, trx)
      const financeiro = await User.findBy({ username: 'financeiro' }, trx)

      const roleAdministrador = await Role.findOrCreate({ slug: 'administrador' }, {
        name: 'Administrador',
        slug: 'administrador',
        description: 'privilégios de administrador'
      }, trx)

      const roleSupervisor = await Role.findOrCreate({ slug: 'supervisor' }, {
        name: 'Supervisor',
        slug: 'supervisor',
        description: 'privilégios de supervisor'
      }, trx)

      const roleAtendente = await Role.findOrCreate({ slug: 'atendente' }, {
        name: 'Atendente',
        slug: 'atendente',
        description: 'privilégios de atendente'
      }, trx)

      const roleRelacionamento = await Role.findOrCreate({ slug: 'relacionamento' }, {
        name: 'Relacionamento',
        slug: 'relacionamento',
        description: 'privilégios de relacionamento com o cliente'
      }, trx)

      const roleFinanceiro = await Role.findOrCreate({ slug: 'financeiro' }, {
        name: 'Financeiro',
        slug: 'financeiro',
        description: 'privilégios de financeiro'
      }, trx)

      await trx.commit();

      await administrador.roles().attach([
        roleAdministrador.id
      ], trx);

      await supervisor.roles().attach([
        roleSupervisor.id
      ], trx);

      await atendente.roles().attach([
        roleAtendente.id
      ], trx);

      await relacionamento.roles().attach([
        roleRelacionamento.id
      ], trx);

      await financeiro.roles().attach([
        roleFinanceiro.id
      ], trx);

    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}

module.exports = RoleSeeder
