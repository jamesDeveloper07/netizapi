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
const AcaoServico = use('App/Models/Common/AcaoServico')

class AcaoServicoSeeder {
  async run() {

    const ativacaoDeezer = await AcaoServico.create({
      servico_id: '1',
      acao_id: '1',
      status: 'ativo'
    })

    const desativacaoDeezer = await AcaoServico.create({
      servico_id: '1',
      acao_id: '2',
      status: 'ativo'
    })

    const reenvoDeezer = await AcaoServico.create({
      servico_id: '1',
      acao_id: '3',
      status: 'ativo'
    })

    const ativacaoNetflix = await AcaoServico.create({
      servico_id: '2',
      acao_id: '1',
      status: 'ativo'
    })

    const desativacaoNetflix = await AcaoServico.create({
      servico_id: '2',
      acao_id: '2',
      status: 'ativo'
    })

    const ativacaoWatch = await AcaoServico.create({
      servico_id: '3',
      acao_id: '1',
      status: 'ativo'
    })

    const desativacaoWatch = await AcaoServico.create({
      servico_id: '3',
      acao_id: '2',
      status: 'ativo'
    })

  }
}

module.exports = AcaoServicoSeeder
