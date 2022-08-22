'use strict'

const Solicitacao = use('App/Models/Common/Solicitacao');

const Cliente = use('App/Models/Common/Cliente');

const Database = use('Database')
const axios = require('axios');

const RoleAndPermission = use('App/Utils/RoleAndPermission');

class SolicitacaoController {

  async index({ request, response, auth }) {
    const user = await auth.getUser();

    let header = request.headers()
    let empresa_id = header.empresa_id

    if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
      const { emp_id } = request.only(['emp_id'])
      empresa_id = emp_id
    }

    if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
      response.status(400).send('Empresa não informada')
    }

    const { id, cliente_id, acao_servico_id, status, protocolo_externo_id } = request.only(['id', 'cliente_id', 'acao_servico_id', 'status', 'protocolo_externo_id']);

    var { data_inicio_criacao, data_fim_criacao } = request.only(['data_inicio_criacao', 'data_fim_criacao']);
    var { data_inicio_execucao, data_fim_execucao } = request.only(['data_inicio_execucao', 'data_fim_execucao']);

    const { cliente, pesquisarTelefoneCliente } = request.only(['cliente', 'pesquisarTelefoneCliente']);

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
      .with('user')
      .with('cliente')
      .with('acaoServico.acao')
      .with('acaoServico.servico')
      .orderBy('created_at', 'desc')

    if (id) {
      query.where({ id })
    }

    if (cliente_id) {
      query.where({ cliente_id })
    } else {
      if (cliente) {
        if ((pesquisarTelefoneCliente && pesquisarTelefoneCliente === 'true')) {
          var tel = cliente.replace(/[^0-9]/g, '');
          query.where('cliente_id', Database.from('common.clientes').select('id').whereRaw(`common.clientes.telefone like '%${tel}%'`))
        } else {
          var doc = cliente.replace(/[^0-9]/g, '');
          query.whereIn('cliente_id', Database.from('common.clientes').select('id').whereRaw(`common.clientes.nome ilike '%${cliente}%' ${doc ? `or common.clientes.documento like '%${doc}%'` : ''} `))
        }
      }
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

    if (data_inicio_execucao && data_fim_execucao) {
      query.whereRaw(`date(finished_at AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_execucao}' AT TIME ZONE 'BRA') AND date('${data_fim_execucao}' AT TIME ZONE 'BRA')`);
    } else {
      if (data_inicio_execucao) {
        query.whereRaw(`date(finished_at AT TIME ZONE 'BRA') >= date('${data_inicio_execucao}')`)
      }
      if (data_fim_execucao) {
        query.whereRaw(`date(finished_at AT TIME ZONE 'BRA') <= date('${data_fim_execucao}')`)
      }
    }

    if (protocolo_externo_id) {
      query.where({ protocolo_externo_id })
    }

    const colaboradores = request.only('colaboradores')
    const equipes = request.only('equipes')

    //Se o usuário não tiver permissão de ver as oportunidades de outros
    let permissionsExpression = '(ver-todas-solicitacoes)'
    let validPermissions = await RoleAndPermission.validarPermissions(user.id, empresa_id, permissionsExpression)
    console.log("validar permissão");
    console.log(validPermissions);

    if (!validPermissions) {
      query.where({ user_id: user.id })
    } else {
      //se não houve filtro de colaboradores
      console.log({ colaboradores })
      if (!colaboradores || !colaboradores.colaboradores || colaboradores.colaboradores.length == 0 || colaboradores.colaboradores[0] == -1) {
        //e se não houve filtro de equipes
        if (!equipes || !equipes.equipes || equipes.equipes.length == 0 || equipes.equipes[0] == -1) {
          //VALIDAR RESTRIÇÕES
          //Restringir a somentes colaboradores que não façam parte das equipes restritas ao usuário.
          //Colaborador Responsável
          // query.whereRaw(` marketing.oportunidades.user_id NOT IN (SELECT user_id FROM common.membros_equipes WHERE equipe_id IN (SELECT equipe_id FROM security.restricoes_equipes where user_id = ${user.id} and tipo like 'restricao'))`)
          //Colaborador Criador
          // query.whereRaw(` marketing.oportunidades.criador_id NOT IN (SELECT user_id FROM common.membros_equipes WHERE equipe_id IN (SELECT equipe_id FROM security.restricoes_equipes where user_id = ${user.id} and tipo like 'restricao'))`)
        }
      } else {
        query.whereRaw(`user_id IN (${colaboradores.colaboradores.join()})`)
      }
    }

    const result = await query.paginate(page ? page : 1, limit ? limit : 10)
    return result
  }

  async show({ request, params }) {
    const { id } = params;
    const query = Solicitacao.query()
      .with('user')
      .with('cliente')
      .with('acaoServico.acao')
      .with('acaoServico.servico')
    query.where({ id })
    return await query.first()
  }

  async store({ request, response, auth }) {

    try {

      const user = await auth.getUser();

      const dataSolicitacao = request.only(['cliente_id', 'acao_servico_id', 'status', 'finished_at', 'protocolo_externo_id'])

      const dataCliente = request.only(['cliente'])

      if (dataSolicitacao && !dataSolicitacao.status) {
        dataSolicitacao.status = 'pendente'
      }

      if (dataSolicitacao && !dataSolicitacao.acao_servico_id) {
        response.status(400).send('Serviço/Ação não informado')
        return
      }

      if (dataSolicitacao && !dataSolicitacao.status) {
        response.status(400).send('Status não informado')
        return
      }

      if (dataSolicitacao && !dataSolicitacao.cliente_id) {
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

        dataSolicitacao.cliente_id = cliente.id
      }

      dataSolicitacao.user_id = user.id;

      const solicitacao = await Solicitacao.create(dataSolicitacao)

      const id = solicitacao.id
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

  async executarSolicitacoesPendentes({ request, response, auth }) {

    try {

      const status = 'pendente';

      const user = await auth.getUser();

      let header = request.headers()
      let empresa_id = header.empresa_id

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        const { emp_id } = request.only(['emp_id'])
        empresa_id = emp_id
      }

      if (!empresa_id || isNaN(empresa_id) || parseInt(empresa_id) <= 0) {
        response.status(400).send('Empresa não informada')
      }

      const query = Solicitacao.query()
        .with('user')
        .with('cliente')
        .with('acaoServico.acao')
        .with('acaoServico.servico')
        .orderBy('created_at', 'asc')

      query.where({ status })

      query.where({ user_id: user.id })

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
          console.log('Chegou AQUI');
          console.log({ solicitacao });
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
