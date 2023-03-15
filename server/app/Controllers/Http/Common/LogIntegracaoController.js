'use strict'

const LogIntegracao = use('App/Models/Common/LogIntegracao');
const Cliente = use('App/Models/Common/Cliente');

const Env = use('Env')
const Database = use('Database')
const axios = require('axios');

const RoleAndPermission = use('App/Utils/RoleAndPermission');

class LogIntegracaoController {

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

    const { id, cliente_id, servico_id, acao_servico_id, acao_id, status, protocolo_externo_id } = request.only(['id', 'cliente_id', 'servico_id', 'acao_servico_id', 'acao_id', 'status', 'protocolo_externo_id']);

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

    const query = LogIntegracao.query()
      .with('user')
      .with('servico')
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
          query.whereRaw(`common.log_integracao.telefone_cliente like '%${tel}%'`)
        } else {
          var doc = cliente.replace(/[^0-9]/g, '');
          query.whereRaw(`common.log_integracao.nome_cliente ilike '%${cliente}%' ${doc ? `or common.log_integracao.documento_cliente like '%${doc}%'` : ''} `)
        }
      }
    }


    if (acao_servico_id && acao_servico_id > 0) {
      query.where({ acao_servico_id })
    } else {
      if (servico_id && servico_id > 0) {
        if (acao_id && acao_id > 0) {
          query.whereIn('acao_servico_id', Database.from('common.acoes_servicos').select('id').where({ servico_id }).where({ acao_id }))
        } else {
          query.where({ servico_id })
        }
      } else {
        if (acao_id && acao_id > 0) {
          query.whereIn('acao_servico_id', Database.from('common.acoes_servicos').select('id').where({ acao_id }))
        }
      }

    }

    if (status) {
      query.where({ status })
    }

    if (data_inicio_criacao && data_fim_criacao) {
      query.whereRaw(`date(data_evento AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_criacao}' AT TIME ZONE 'BRA') AND date('${data_fim_criacao}' AT TIME ZONE 'BRA')`);
    } else {
      if (data_inicio_criacao) {
        query.whereRaw(`date(data_evento AT TIME ZONE 'BRA') >= date('${data_inicio_criacao}')`)
      }
      if (data_fim_criacao) {
        query.whereRaw(`date(data_evento AT TIME ZONE 'BRA') <= date('${data_fim_criacao}')`)
      }
    }

    if (data_inicio_execucao && data_fim_execucao) {
      query.whereRaw(`date(created_at AT TIME ZONE 'BRA') BETWEEN date('${data_inicio_execucao}' AT TIME ZONE 'BRA') AND date('${data_fim_execucao}' AT TIME ZONE 'BRA')`);
    } else {
      if (data_inicio_execucao) {
        query.whereRaw(`date(created_at AT TIME ZONE 'BRA') >= date('${data_inicio_execucao}')`)
      }
      if (data_fim_execucao) {
        query.whereRaw(`date(created_at AT TIME ZONE 'BRA') <= date('${data_fim_execucao}')`)
      }
    }

    if (protocolo_externo_id) {
      query.where({ protocolo_externo_id })
    }

    // const colaboradores = request.only('colaboradores')
    // const equipes = request.only('equipes')

    // //Se o usuário não tiver permissão de ver as oportunidades de outros
    // let permissionsExpression = '(ver-todas-solicitacoes)'
    // let validPermissions = await RoleAndPermission.validarPermissions(user.id, empresa_id, permissionsExpression)
    // console.log("validar permissão");
    // console.log(validPermissions);

    // if (!validPermissions) {
    //   query.where({ user_id: user.id })
    // } else {
    //   //se não houve filtro de colaboradores
    //   console.log({ colaboradores })
    //   if (!colaboradores || !colaboradores.colaboradores || colaboradores.colaboradores.length == 0 || colaboradores.colaboradores[0] == -1) {
    //     //e se não houve filtro de equipes
    //     if (!equipes || !equipes.equipes || equipes.equipes.length == 0 || equipes.equipes[0] == -1) {
    //       //VALIDAR RESTRIÇÕES
    //       //Restringir a somentes colaboradores que não façam parte das equipes restritas ao usuário.
    //       //Colaborador Responsável
    //       // query.whereRaw(` marketing.oportunidades.user_id NOT IN (SELECT user_id FROM common.membros_equipes WHERE equipe_id IN (SELECT equipe_id FROM security.restricoes_equipes where user_id = ${user.id} and tipo like 'restricao'))`)
    //       //Colaborador Criador
    //       // query.whereRaw(` marketing.oportunidades.criador_id NOT IN (SELECT user_id FROM common.membros_equipes WHERE equipe_id IN (SELECT equipe_id FROM security.restricoes_equipes where user_id = ${user.id} and tipo like 'restricao'))`)
    //     }
    //   } else {
    //     query.whereRaw(`user_id IN (${colaboradores.colaboradores.join()})`)
    //   }
    // }

    const result = await query.paginate(page ? page : 1, limit ? limit : 10)
    return result
  }

}

module.exports = LogIntegracaoController
