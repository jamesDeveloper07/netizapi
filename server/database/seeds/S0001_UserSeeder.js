'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const User = use('App/Models/Security/User')

class UserSeeder {
  async run () {
    const admin = await User.create({
      name: 'Administrador',
      username: 'administrador',
      email: 'administracao@netiz.com.br',
      password: '@dM1n2022!#',
    })

    const supervisor = await User.create({
      name: 'Supervisor',
      username: 'supervisor',
      email: 'supervisor@netiz.com.br',
      password: 'Sup3r@2022!#',
    })

    const atendimento = await User.create({
      name: 'Atendente',
      username: 'atendente',
      email: 'atendente@netiz.com.br',
      password: 'At3nd@2022!#',
    })

  }
}

module.exports = UserSeeder
