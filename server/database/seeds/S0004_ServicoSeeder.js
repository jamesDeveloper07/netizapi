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
const Servico = use('App/Models/Common/Servico')

class ServicoSeeder {
  async run () {
    const deezer = await Servico.create({
      nome: 'Deezer',
      descricao: 'Serviço de streaming de áudio',
      status: 'ativo'
    })

    const netflix = await Servico.create({
      nome: 'Netflix',
      descricao: 'Serviço de streaming de vídeo',
      status: 'ativo'
    })

    const watch = await Servico.create({
      nome: 'Watch Brasil',
      descricao: 'Serviço de streaming de vídeo e transmissões ao vivo',
      status: 'ativo',
      integracao_id: '3'
    })

    const hbomax = await Servico.create({
      nome: 'HBO Max',
      descricao: 'Serviço de streaming de vídeo e transmissões ao vivo',
      status: 'ativo',
      integracao_id: '4'
    })

  }
}

module.exports = ServicoSeeder
