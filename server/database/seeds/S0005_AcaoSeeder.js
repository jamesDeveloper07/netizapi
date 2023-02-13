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
const Acao = use('App/Models/Common/Acao')

class AcaoSeeder {
  async run() {
    const ativacao = await Acao.create({
      nome: 'Ativação',
      descricao: 'Ação de ativação de algum serviço',
      status: 'ativo'
    })

    const desativacao = await Acao.create({
      nome: 'Desativação',
      descricao: 'Ação de desativação de algum serviço',
      status: 'ativo'
    })

    const reenvio = await Acao.create({
      nome: 'Reenvio de Ativação',
      descricao: 'Ação de reenvio de ativação de algum serviço',
      status: 'ativo'
    })
  }
}

module.exports = AcaoSeeder
