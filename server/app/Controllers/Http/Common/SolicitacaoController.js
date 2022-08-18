'use strict'

const Solicitacao = use('App/Models/Common/Solicitacao');

const Cliente = use('App/Models/Common/Cliente');

const Database = use('Database')
const axios = require('axios');

class SolicitacaoController {

  async index({ request }) {
    const { id, cliente_id, acao_servico_id, status } = request.only(['id', 'cliente_id', 'acao_servico_id', 'status']);

    var { data_inicio_criacao, data_fim_criacao } = request.only(['data_inicio_criacao', 'data_fim_criacao']);

    const { page,
      limit,
      sortField = 'id',
      sortOrder = 'ASC',
    } = request.only(['page',
      'limit',
      'sortField',
      'sortOrder'
    ])

    const query = Solicitacao.query()
      .with('cliente')
      .with('acaoServico.acao')
      .with('acaoServico.servico')
      .orderBy('created_at', 'desc')

    if (id) {
      query.where({ id })
    }

    if (cliente_id) {
      query.where({ cliente_id })
    }

    if (acao_servico_id) {
      query.where({ acao_servico_id })
    }

    if (status) {
      query.where({ status })
    }

    if (data_inicio_criacao && data_fim_criacao) {
      query.whereRaw(`date(created_at AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_criacao}' AT TIME ZONE 'BRA') AND date('${data_fim_criacao}' AT TIME ZONE 'BRA')`);
    } else {
      if (data_inicio_criacao) {
        query.whereRaw(`date(created_at AT TIME ZONE 'BRA') >= date('${data_inicio_criacao}')`)
      }
      if (data_fim_criacao) {
        query.whereRaw(`date(created_at AT TIME ZONE 'BRA') <= date('${data_fim_criacao}')`)
      }
    }

    const result = await query.paginate(page ? page : 1, limit ? limit : 10)
    return result
  }

  async show({ request, params }) {
    const { id } = params;
    const query = Solicitacao.query()
      .with('cliente')
      .with('acaoServico.acao')
      .with('acaoServico.servico')
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {

      const dataServico = request.only(['cliente_id', 'acao_servico_id', 'status', 'finished_at'])

      const dataCliente = request.only(['cliente'])

      if (dataServico && !dataServico.status) {
        dataServico.status = 'ativo'
      }

      if (dataServico && !dataServico.acao_servico_id) {
        response.status(400).send('Ação do Serviço não informada')
        return
      }

      if (dataServico && !dataServico.status) {
        response.status(400).send('Status não informado')
        return
      }

      if (dataServico && !dataServico.cliente_id) {
        // console.log('Cliente_id não informado');

        if (dataCliente && dataCliente.cliente && !dataCliente.cliente.origem) {
          dataCliente.cliente.origem = 'NETIZ APP'
        }

        if (dataCliente && dataCliente.cliente && !dataCliente.cliente.externo_id) {
          dataCliente.cliente.externo_id = 0;
        }

        if (dataCliente && dataCliente.cliente && !dataCliente.cliente.status) {
          dataCliente.cliente.status = 'ativo'
        }

        console.log(dataCliente.cliente)

        if (dataCliente && dataCliente.cliente && dataCliente.cliente.documento) {
          dataCliente.cliente.documento = dataCliente.cliente.documento.replace(/[^0-9]/g, '');
        }

        if (dataCliente && dataCliente.cliente && dataCliente.cliente.telefone) {
          dataCliente.cliente.telefone = dataCliente.cliente.telefone.replace(/[^0-9]/g, '');
        }

        const cliente = await Cliente.create(dataCliente.cliente)

        dataServico.cliente_id = cliente.id
      }

      const servico = await Solicitacao.create(dataServico)

      const id = servico.id
      const data = await Solicitacao.query()
        .where({ id })
        .first()

      return data

    } catch (error) {
      console.log({ error })
      if (error && error.constraint) {
        response.status(400).send('Catch Error: ' + error.constraint + '\n' + 'Detail: ' + error.detail)
      } else {
        response.status(400).send('Catch Error')
      }
    }
  }

  async enviarSolicitacoesAtivacao({ request, response, auth }) {

    try {

      const status = 'pendente';
      const acao_servico_id = 1;

      const query = Solicitacao.query()
        .with('cliente')
        .with('acaoServico.acao')
        .with('acaoServico.servico')

      if (acao_servico_id) {
        query.where({ acao_servico_id })
      }
      if (status) {
        query.where({ status })
      }
      query.orderBy('id', 'asc')

      const data = await query.fetch()
      const solicitacoes = data.rows
      var idsSolicitacoes = [];

      if (solicitacoes && solicitacoes.length > 0) {

        for (var index in solicitacoes) {
          idsSolicitacoes.push(solicitacoes[index].id);
        }

        await this.enviarSolicitacao(solicitacoes)

        const solicitacoesUpdate = await Solicitacao.query()
          .whereIn('id', idsSolicitacoes)
          .fetch();

        return {
          status: 'sucesso',
          mensagem: 'Solicitações enviadas!',
          solicitacoes: solicitacoesUpdate
        }

      } else {
        return {
          status: 'sucesso',
          mensagem: 'Não há solicitações a serem enviadas!',
          solicitacoes: []
        }
      }

    } catch (error) {
      console.error(error.response)
      throw error
    }
  }

  async enviarSolicitacoesDesativacao({ request, response, auth }) {

    try {

      const status = 'pendente';
      const acao_servico_id = 2;

      const query = Solicitacao.query()
        .with('cliente')
        .with('acaoServico.acao')
        .with('acaoServico.servico')

      if (acao_servico_id) {
        query.where({ acao_servico_id })
      }
      if (status) {
        query.where({ status })
      }
      query.orderBy('id', 'asc')

      const data = await query.fetch()
      const solicitacoes = data.rows
      var idsSolicitacoes = [];

      if (solicitacoes && solicitacoes.length > 0) {

        for (var index in solicitacoes) {
          idsSolicitacoes.push(solicitacoes[index].id);
        }

        await this.enviarSolicitacao(solicitacoes)

        const solicitacoesUpdate = await Solicitacao.query()
          .whereIn('id', idsSolicitacoes)
          .fetch();

        return {
          status: 'sucesso',
          mensagem: 'Solicitações enviadas!',
          solicitacoes: solicitacoesUpdate
        }

      } else {
        return {
          status: 'sucesso',
          mensagem: 'Não há solicitações a serem enviadas!',
          solicitacoes: []
        }
      }

    } catch (error) {
      console.error(error.response)
      throw error
    }
  }

  async enviarSolicitacao(solicitacoes) {
    try {

      //const hostApi = 'https://beta-eng.hubisp.net.br/notification/';
      const hostApi = 'https://eng.hubisp.net.br/notification/';
      var code = '?code=NETIZ01';
      var tipo;

      if (solicitacoes && solicitacoes.length > 0) {
        for (var index in solicitacoes) {

          console.log("\nAção Serviço");
          console.log(solicitacoes[index].acao_servico_id);

          if (solicitacoes[index].acao_servico_id == 1) {
            tipo = 'activate';
          }

          if (solicitacoes[index].acao_servico_id == 2) {
            tipo = 'deactivate';
          }

          var solicitacao = solicitacoes[index]
          //console.log({solicitacao});
          var cliente = solicitacao.$relations.cliente
          console.log(cliente.nome);
          console.log(cliente.documento);
          console.log(cliente.telefone);

          var key = '&key=' + cliente.documento;
          var ext = '&ext=' + cliente.telefone;

          var urlApi = hostApi + tipo + code + key

          if (tipo === 'activate') {
            urlApi = urlApi + ext;
          }

          console.log(urlApi);

          try {
            const response = await axios({
              method: 'get',
              url: urlApi,
              headers: {
                'Authorization': 'Bearer bec0c3179beb19987da59dc982600a44'
              }
            })

            console.log("RESPONSE (response.data)")
            console.log(response.data)

            if (response && response.data && response.data.response) {
              console.log("SUCESSO TRUE")
              await this.marcarComoFinalizada(solicitacoes[index])
            } else {
              if (response && response.data && !response.data.response) {
                await this.marcarComoFalha(solicitacoes[index])
                throw Error(response.data.error);
              }
            }

          } catch (error) {
            console.error(error)
            throw error
          }

        }
      }

    } catch (error) {
      console.error(error.response)
      throw error
    }
  }

  async marcarComoFinalizada(solicitacao) {
    try {

      // console.log('Marcando Como FINALIZADA')
      var id = solicitacao.id;
      const solicitacaoFind = await Solicitacao.findBy({ id })
      if (solicitacaoFind) {
        var sql = `UPDATE common.solicitacoes_cliente_acao_servicos SET status ='finalizada', finished_at='${new Date().toISOString()}', updated_at='${new Date().toISOString()}' WHERE id=${id} and finished_at is null`;
        await Database.raw(sql);
      } else {
        Logger.warn(`Solicitação de id ${solicitacao.id} não foi encontrada para marcação de finalização!`)
      }
    } catch (error) {
      console.error(error)
    }

  }

  async marcarComoFalha(solicitacao) {
    try {
      // console.log('Marcando Como FINALIZADA')
      var id = solicitacao.id;
      const solicitacaoFind = await Solicitacao.findBy({ id })
      if (solicitacaoFind) {
        var sql = `UPDATE common.solicitacoes_cliente_acao_servicos SET status ='falha', updated_at='${new Date().toISOString()}' WHERE id=${id} and finished_at is null`;
        await Database.raw(sql);
      } else {
        Logger.warn(`Solicitação de id ${solicitacao.id} não foi encontrada para marcação de finalização!`)
      }
    } catch (error) {
      console.error(error)
    }

  }


}

module.exports = SolicitacaoController
