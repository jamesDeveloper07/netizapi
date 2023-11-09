const Logger = use('Logger')

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')

const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')
const LogIntegracao = use('App/Models/Common/LogIntegracao')
const LogEvento = use('App/Models/Common/LogEvento')

const Servico = use('App/Models/Common/Servico');
const AcaoServico = use('App/Models/Common/AcaoServico');


class EventRepository {

  async getStatusList() {
    const statusList = await Database.connection('pgvoalle').raw('select distinct(status) as id, v_status as nome from erp.contracts order by status asc');
    return statusList.rows
  }

  async getStageList() {
    const stageList = await Database.connection('pgvoalle').raw('select distinct(stage) as id, v_stage as nome from erp.contracts order by stage asc');
    return stageList.rows
  }

  async getContractsByEvents(colunas, lastEventId, where, paginate) {

    var isHomologacao = false;
    const paramIsHML = await Parametro.findBy({ chave: 'is_homologacao' });

    if (paramIsHML && paramIsHML.id && paramIsHML.id > 0) {
      if (paramIsHML.valor && (paramIsHML.valor.toLowerCase() == 'true' || paramIsHML.valor.toLowerCase() == 'verdadeiro')) {
        isHomologacao = true;
      }
    }

    var selectContractByEvents;

    const colunasPadrao = `contract_id, client_id, name, tx_id, type_tx_id, phone, email, stage, v_stage, status, v_status,
    deleted, event_id, event_type_id, event_descricao, event_data, itens, service_products, isservicodigital, isdeezer,
    deezer_item_id, iswatch, watch_item_id, ishbo, hbo_item_id`;

    if (isHomologacao) {
      const select = `SELECT ${colunas && colunas.length > 0 && colunas != '*' ? colunas : colunasPadrao} FROM public.select_events where event_id > ${lastEventId ? lastEventId : 0}
      ${where && where.length > 0 ? where : ''}
      ${paginate && paginate.length > 0 ? paginate : 'order by event_id asc limit 1000'}`;

      selectContractByEvents = await Database
        .connection('pg')
        .raw(select);

      // later close the connection
      Database.close(['pg']);

    } else {
      const select = `SELECT ${colunas && colunas.length > 0 && colunas != '*' ? colunas : colunasPadrao} FROM (
      Select contract_id, client_id, name, tx_id, type_tx_id, phone, email, stage, v_stage, status, v_status, deleted, event_id
      ,(select contract_event_type_id from erp.contract_events where id = event_id) as event_type_id
      ,(select description from erp.contract_events where id = event_id) as event_descricao
      ,(select date from erp.contract_events where id = event_id) as event_data
      ,itens::text, service_products::text
      ,(service_products is not null and (service_products @> ARRAY[698::bigint] or service_products @> ARRAY[699::bigint] or service_products @> ARRAY[700::bigint]) ) as isServicoDigital

      ,(service_products is not null and service_products @> ARRAY[698::bigint]) as isDeezer
      ,(select sva.id from erp.contract_items as sva where sva.contract_id = contratos.contract_id and sva.service_product_id = 698 and sva.deleted is FALSE limit 1) as deezer_item_id

      ,(service_products is not null and service_products @> ARRAY[699::bigint]) as isWatch
      ,(select sva.id from erp.contract_items as sva where sva.contract_id = contratos.contract_id and sva.service_product_id = 699 and sva.deleted is FALSE limit 1) as watch_item_id

      ,(service_products is not null and service_products @> ARRAY[700::bigint]) as isHBO
      ,(select sva.id from erp.contract_items as sva where sva.contract_id = contratos.contract_id and sva.service_product_id = 700 and sva.deleted is FALSE limit 1) as hbo_item_id

      from (
      SELECT cont.id as contract_id
      ,cont.client_id, cli.name, cli.tx_id, cli.type_tx_id, cli.cell_phone_1 as phone, cli.email
      , cont.stage, cont.v_stage, cont.status, cont.v_status, cont.deleted
      , (select max(id) from erp.contract_events where contract_id = cont.id and date < now() and id > ${lastEventId}  --and deleted is false
           and contract_event_type_id in (
        3,  145,  117, 118 --Aprovação
        ,24, 110, 144, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 174, 175 --Cancelamento
        ,43, 151 --Suspensão
        ,40, 81 --Bloqueio
        ,41, 106 --Desbloqueio/Reativação
        ,10 --Alteração de Situação
        ,27, 133, 28 --Inclusao, Alteração e Exclusão de Servicos
        ,8 --Alteração Titularidade
        )
        ) as event_id
      ,array_agg(distinct(item.id)) as itens
      ,array_agg(distinct(item.service_product_id)) as service_products

      FROM erp.contracts cont
      left join erp.people cli on (cont.client_id = cli.id)
      left join erp.contract_items item on (item.contract_id = cont.id and item.deleted is FALSE )--and item.service_product_id in (698, 699, 700))

      where cont.id in
      (
        SELECT contract_id FROM erp.contract_events
        where date < now() and id > ${lastEventId} --and deleted is false
        and contract_event_type_id in (
        3,  145,  117, 118 --Aprovação
        ,24, 110, 144, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 174, 175 --Cancelamento
        ,43, 151 --Suspensão
        ,40, 81 --Bloqueio
        ,41, 106 --Desbloqueio/Reativação
        ,10 --Alteração de Situação
        ,27, 133, 28 --Inclusao, Alteração e Exclusão de Servicos
        ,8 --Alteração Titularidade
        )
      )

      and type_tx_id = 2 --pessoa física
      and stage = 3 --aprovado
      GROUP BY cont.id, cont.client_id, cont.stage, cont.v_stage, cont.status, cont.v_status, cli.id
      order by cont.id
      ) as contratos ) as contratos_validados

      ${where && where.length > 0 ? ('where true ' + where) : ''}

      ${paginate && paginate.length > 0 ? paginate : 'order by event_id asc limit 1000'}`


      selectContractByEvents = await Database
        .connection('pgvoalle')
        .raw(select);

      // later close the connection
      //Database.close(['pgvoalle']);
    }

    const contractEvents = selectContractByEvents.rows

    return contractEvents;
  }


  async getTitularesAnterioresByContrato(_contract_id) {

    var isHomologacao = false;
    const paramIsHML = await Parametro.findBy({ chave: 'is_homologacao' });

    if (paramIsHML && paramIsHML.id && paramIsHML.id > 0) {
      if (paramIsHML.valor && (paramIsHML.valor.toLowerCase() == 'true' || paramIsHML.valor.toLowerCase() == 'verdadeiro')) {
        isHomologacao = true;
      }
    }

    var selectTitularesAnteriores;

    if (isHomologacao) {
      const select = `SELECT id, name, tx_id, email, phone FROM public.titulares_anteriores where contract_id = ${_contract_id} order by id asc`;

      selectTitularesAnteriores = await Database
        .connection('pg')
        .raw(select);

      // later close the connection
      //Database.close(['pg']);

    } else {
      //seleciona pessoas que já foram titular neste contrato anteriormente e que, atualmente, não seja titular em nenhum outro contrato ativo com direito a Deezer.
      const select = `SELECT id, name, tx_id, email, cell_phone_1 as phone
      FROM erp.people
      where id in (SELECT distinct(client_id) FROM erp.financial_receivable_titles where contract_id = ${_contract_id})
      and id not in (
      SELECT DISTINCT(cont.client_id)
      FROM erp.contracts cont
      inner join erp.contract_items item on (item.contract_id = cont.id and item.deleted is FALSE and item.service_product_id = 698)
      where  stage = 3 --aprovado
      and cont.status in (1,3) --normal ou cortesia
      AND cont.client_id in (SELECT distinct(client_id) FROM erp.financial_receivable_titles where contract_id = ${_contract_id})
      )
      and id <> (SELECT client_id FROM erp.contracts where id = ${_contract_id})
      order by id`


      selectTitularesAnteriores = await Database
        .connection('pgvoalle')
        .raw(select);

      // later close the connection
      //Database.close(['pgvoalle']);
    }

    const titularesAnteriores = selectTitularesAnteriores.rows

    return titularesAnteriores;
  }

  async executarCancelamentoManual(_contract_id, _user_id) {
    try {
      console.log('\n\n=====EXECUTAR CANCELAMENTO MANUAL\n');

      var sqlContrato = ''
      if (_contract_id && _contract_id > 0) {
        sqlContrato = `and contract_id = ${_contract_id}`
      }
      const where = `${sqlContrato}`;

      const contractEvents = await this.getContractsByEvents('*', 0, where, null);

      console.log('\n===== TRATANDO EVENTOS =====\n')

      for (const evento of contractEvents) {
        console.log('\n===INICIO====================================')
        console.log('===== EVENTO =====')
        console.log({ evento })

        if (_contract_id) {
          console.log('===== ATUALIZANDO DESCRIÇÂO PARA CANCELAMENTO MANUAL =====\n')
          evento.event_descricao += " (CANCELAMENTO MANUAL)"
        }

        if (_user_id && _user_id > 0) {
          console.log('===== ATUALIZANDO USUÀRIO PARA CANCELAMENTO MANUAL =====\n')
          evento.user_id = _user_id;
        } else {
          evento.user_id = 1;
        }

        console.log('===== CADASTRAR LOG EVENTO =====\n')
        var newLogEvent = await LogEvento.create(evento)
        const id = newLogEvent.id
        newLogEvent = await LogEvento.query()
          .where({ id })
          .first()
        newLogEvent = newLogEvent.$attributes;

        if (_contract_id) {
          console.log('===== FORÇANDO CANCELAMENTO MANUAL =====\n')
          await this.forcarCancelamentoSVAS(newLogEvent);
        }
        console.log('===FIM=======================================\n')
      }

      // return contractEvents;
      return {
        status: 200,
        menssage: 'Processo executado com sucesso!',
        contractEvents
      }


    } catch (error) {
      console.error('Erro no metodo executarCancelamentoManual api/voalle \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getEvents api/voalle' })
      return {
        status: 500,
        menssage: 'Não conseguimos realizar o metodo executarCancelamentoManual api/voalle.',
        contractEvents: null
      }
    }
  }

  async executarIntegracoes(_contract_id, _user_id) {
    try {
      console.log('Método GET EVENTS EVENT REPOSITORY');

      const paramLastEventId = await Parametro.findBy({ chave: 'last_event_id' });

      if (!paramLastEventId || !paramLastEventId.id || paramLastEventId.id <= 0) {
        return {
          status: 500,
          menssage: 'Parametro last_event_id não encontrado!',
          contractEvents: null
        }
      }

      var lastEventId = paramLastEventId.valor;

      var sqlContrato = ''
      if (_contract_id && _contract_id > 0) {
        sqlContrato = `and contract_id = ${_contract_id}`
        lastEventId = 0;
      }
      const where = `${sqlContrato}`;

      const contractEvents = await this.getContractsByEvents('*', lastEventId, where, null);

      console.log('\n===== TRATANDO EVENTOS =====\n')

      if (contractEvents && contractEvents.length > 0 && !_contract_id) {
        paramLastEventId.valor = contractEvents[contractEvents.length - 1].event_id
        paramLastEventId.updated_at = new Date();
        await paramLastEventId.save();
        console.log(`===== ACIONANDO O FOR =====\n${contractEvents.length} eventos encontrados`)
      } else {
        if (!_contract_id) {
          console.log('===== SEM EVENTOS NOVOS NO MOMENTO =====\n')
        }
      }

      for (const evento of contractEvents) {
        console.log('\n===INICIO====================================')
        console.log('===== EVENTO =====')
        console.log({ evento })

        if (_contract_id) {
          console.log('===== ATUALIZANDO DESCRIÇÂO PARA REEXECUÇÂO =====\n')
          evento.event_descricao += " (REEXECUÇÃO DE INTEGRAÇÃO)"
        }

        if (_user_id && _user_id > 0) {
          console.log('===== ATUALIZANDO USUÀRIO PARA REEXECUÇÂO =====\n')
          evento.user_id = _user_id;
        } else {
          evento.user_id = 1;
        }

        console.log('===== CADASTRAR LOG EVENTO =====\n')
        var newLogEvent = await LogEvento.create(evento)
        const id = newLogEvent.id
        newLogEvent = await LogEvento.query()
          .where({ id })
          .first()
        newLogEvent = newLogEvent.$attributes;

        if (_contract_id) {
          console.log('===== REEXECUTAR INTEGRAÇÂO =====\n')
          await this.reexecutarIntegracao(newLogEvent);
        } else {
          console.log('===== EXECUTAR INTEGRAÇÂO =====\n')
          await this.executarIntegracao(newLogEvent);
        }
        console.log('===FIM=======================================\n')
      }

      // return contractEvents;
      return {
        status: 200,
        menssage: 'Processo executado com sucesso!',
        contractEvents
      }


    } catch (error) {
      console.error('Erro no metodo executarIntegracoes api/voalle \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getEvents api/voalle' })
      return {
        status: 500,
        menssage: 'Não conseguimos realizar o metodo executarIntegracoes api/voalle.',
        contractEvents: null
      }
    }
  }

  async executarIntegracao(event) {

    if (this.isAprocavao(event.event_type_id)) {
      await this.validarAtivacaoSVAS(event, 'Ativacao');
    } else {
      if (this.isCancelamento(event.event_type_id) || this.isSuspensao(event.event_type_id) || this.isBloqueio(event.event_type_id)) {
        // await this.validarCancelamentoSVAS(event);
        await this.forcarCancelamentoSVAS(event);
      } else {
        if (this.isDesbloqueio(event.event_type_id) || this.isAlteracaoSituacao(event.event_type_id)) {
          await this.forcarCancelamentoSVAS(event);
          await this.validarAtivacaoSVAS(event, 'Reativação (Desbloqueio)');
        } else {
          if (this.isInclusaoOuExclusaoDeServico(event.event_type_id)) {
            await this.forcarCancelamentoSVAS(event);
            await this.validarAtivacaoSVAS(event, 'Reativação (Inclusão/Exclusão de Serviço)');
          } else {
            if (this.isAlteracaoDeServico(event.event_type_id)) {
              await this.forcarCancelamentoSVAS(event);
              await this.validarAtivacaoSVAS(event, 'Reativação (Alteração de Serviço)');
            } else {
              if (this.isTrocaTitularidade(event.event_type_id)) {
                //mudar maneira de tratar troca de titularidade, pois o cancelamento do deezer deve ser forcado para o antigo titular;
                await this.forcarCancelamentoSVAS(event);
                await this.validarAtivacaoSVAS(event, 'Reativação (Troca de titularidade)');
              } else {
                console.log(`TIPO DE EVENTO NÃO PREVISTO: ID ${event.event_type_id}`)
              }
            }
          }
        }
      }
    }
  }

  async reexecutarIntegracao(event) {

    if (this.isAprocavao(event.event_type_id)) {
      await this.forcarCancelamentoSVAS(event);
      await this.validarAtivacaoSVAS(event, 'Ativacao');
    } else {
      this.executarIntegracao(event);
    }
  }

  async validarAtivacaoSVAS(event, tipo) {
    if (event.isservicodigital) {
      var SVAsOK = '';
      var separadorOk = '';

      var SVAsError = '';
      var separadorError = '';

      if (event.isdeezer) {
        await this.ativarDeezer(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }

      if (event.iswatch) {
        await this.ativarWatch(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }

      if (event.ishbo) {
        await this.ativarHBO(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }

      console.log(`${tipo} executada para ${event.contract_id} - ${event.name} - Assinaturas (${SVAsOK})`)
    }
  }

  async validarCancelamentoSVAS(event) {
    console.log('===== VALIDANDO CANCELAMENTO DOS SVAs  =====\n')
    if (event.isservicodigital) {
      var SVAsOK = '';
      var separadorOk = '';

      var SVAsError = '';
      var separadorError = '';

      if (event.isdeezer) {
        await this.cancelarDeezer(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }
      if (event.iswatch) {
        await this.cancelarWatch(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }
      if (event.ishbo) {
        await this.cancelarHBO(event, SVAsOK, separadorOk, SVAsError, separadorError);
      }

      console.log(`Executado cancelamento de SVAs com validação para ${event.contract_id} - ${event.name} - Assinaturas (${SVAsOK})`)
    }
  }

  async forcarCancelamentoSVAS(event) {
    console.log('===== FORÇANDO CANCELAMENTO DOS SVAs  =====\n')
    var SVAsOK = '';
    var separadorOk = '';
    var SVAsError = '';
    var separadorError = '';

    await this.cancelarDeezer(event, SVAsOK, separadorOk, SVAsError, separadorError);
    await this.cancelarWatch(event, SVAsOK, separadorOk, SVAsError, separadorError);
    await this.cancelarHBO(event, SVAsOK, separadorOk, SVAsError, separadorError);

    console.log(`Executado cancelamento forçado de SVAs para ${event.contract_id} - ${event.name}`)
  }


  isAprocavao(event_type_id) {
    const idsTipo = [3, 145, 117, 118]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isCancelamento(event_type_id) {
    const idsTipo = [24, 110, 144, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 174, 175]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isSuspensao(event_type_id) {
    const idsTipo = [43, 151]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isBloqueio(event_type_id) {
    const idsTipo = [40, 81]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isDesbloqueio(event_type_id) {
    const idsTipo = [41, 106]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isAlteracaoSituacao(event_type_id) {
    const idsTipo = [10]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }


  isInclusaoOuExclusaoDeServico(event_type_id) {
    // const idsTipo = [27, 133, 28]
    const idsTipo = [27, 28]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isAlteracaoDeServico(event_type_id) {
    const idsTipo = [133]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isTrocaTitularidade(event_type_id) {
    const idsTipo = [8]
    for (var i = 0; i < idsTipo.length; i++) {
      if (idsTipo[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  async ativarDeezer(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 1
    var acao_id = 1
    var tipoExecucao = 'activate';

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
      var successDeezer = await this.executarDeezer(event, servico, acaoServico, tipoExecucao);

      if (successDeezer) {
        SVAsOK += 'Deezer'
        separadorOk = ', '
      } else {
        SVAsError += 'Deezer'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }
  }

  async cancelarDeezer(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 1
    var acao_id = 2
    var tipoExecucao = 'deactivate';

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {

      var successDeezer = await this.executarDeezer(event, servico, acaoServico, tipoExecucao);

      //executar cancelamento dos titulares anteriores
      successDeezer = await this.cancelarDeezerParaTitularesAnteriores(event, servico, acaoServico);

      if (successDeezer) {
        SVAsOK += 'Deezer'
        separadorOk = ', '
      } else {
        SVAsError += 'Deezer'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }
  }

  async cancelarDeezerParaTitularesAnteriores(event, servico, acaoServico) {

    var successDeezer = false;

    const titularesAnteriores = await this.getTitularesAnterioresByContrato(event.contract_id);

    console.log('\n===== TRATANDO TITULARES ANTERIORES =====\n')

    if (titularesAnteriores && titularesAnteriores.length > 0) {
      console.log(`===== ACIONANDO O FOR =====\n${titularesAnteriores.length} titular(es) anterior(es) encontrado(s)`)
    } else {
      console.log('===== SEM TITULARES ANTERIORES PARA CANCELAMENTO =====\n')
    }

    for (const titularAnterior of titularesAnteriores) {
      var evento = Object.assign({}, event);
      console.log('\n===INICIO====================================')
      console.log('===== EVENTO =====')
      console.log({ evento })

      evento.name = titularAnterior.name;
      evento.tx_id = titularAnterior.tx_id;
      evento.email = titularAnterior.email;
      evento.phone = titularAnterior.phone;
      evento.client_id = titularAnterior.id;
      evento.event_descricao += " (TITULAR ANTERIOR)";

      console.log('===== EXECUTAR INTEGRAÇÂO - TITULAR ANTERIOR =====\n')
      successDeezer = await this.executarDeezer(evento, servico, acaoServico, 'deactivate');
      console.log('===FIM INTEGRAÇÂO - TITULAR ANTERIOR==============\n')
    }

    return successDeezer;
  }

  async executarDeezer(event, servico, acaoServico, tipoExecucao) {
    try {

      //const hostApi = 'https://beta-eng.hubisp.net.br/notification/';
      //const hostApi = 'https://eng.hubisp.net.br/notification/';
      const hostApi = Env.get('HUBISP_API_HOST') + '/notification/';
      var code = `?code=${Env.get('HUBISP_API_CODE')}`;
      var token = Env.get('HUBISP_API_TOKEN');

      var key = '&key=' + event.tx_id;
      var ext = '&ext=' + event.phone;

      var urlApi = hostApi + tipoExecucao + code + key
      var cpfBlindado = false;

      if (tipoExecucao === 'activate') {
        urlApi = urlApi + ext;
      } else {
        // deezer_cpfs_blindados
        const paramCpfsBlindados = await Parametro.findBy({ chave: 'deezer_cpfs_blindados' });
        if (paramCpfsBlindados && paramCpfsBlindados.id && paramCpfsBlindados.id > 0) {

          var cpfArrayStr = paramCpfsBlindados.valor;
          var cpfArray = cpfArrayStr.split(",");

          for (const cpf of cpfArray) {
            if (cpf === event.tx_id) {
              cpfBlindado = true;
              break;
            }
          }
        }
      }

      const newLogIntegracao = {
        nome_cliente: event.name,
        documento_cliente: event.tx_id,
        email_cliente: event.email,
        telefone_cliente: event.phone,
        cliente_erp_id: event.client_id,
        pacote_id: null,
        assinante_id_integracao: null,
        protocolo_externo_id: event.event_id,
        user_id: event.user_id,
        servico_id: servico.id,
        acao_servico_id: acaoServico.id,
        acao: tipoExecucao,
        data_evento: event.event_data,
        log_evento_id: event.id
        // status: 'executada',
        // status_detalhe: null,
      }

      try {

        if (tipoExecucao === 'deactivate' && cpfBlindado) {
          newLogIntegracao.status = 'falha';
          newLogIntegracao.status_detalhe = 'Cpf blindado para desativações em nossas configurações';

          const logIntegracao = await LogIntegracao.create(newLogIntegracao)
          const id = logIntegracao.id
          const data = await LogIntegracao.query()
            .where({ id })
            .first()

          return false;
        }

        const response = await axios({
          method: 'get',
          url: urlApi,
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })

        if (response && response.data && response.data.response) {
          newLogIntegracao.status = 'executada';
          newLogIntegracao.status_detalhe = response.data;

          const logIntegracao = await LogIntegracao.create(newLogIntegracao)
          const id = logIntegracao.id
          const data = await LogIntegracao.query()
            .where({ id })
            .first()

          return true;

        } else {
          if (response && response.data && !response.data.response) {
            // await this.marcarComoFalhaOuInvalida(event[index], 'falha', 'Falha na execução por parte da api')
            // throw Error(response.data.error);

            newLogIntegracao.status = 'falha';
            newLogIntegracao.status_detalhe = response.data;

            const logIntegracao = await LogIntegracao.create(newLogIntegracao)
            const id = logIntegracao.id
            const data = await LogIntegracao.query()
              .where({ id })
              .first()

            console.error(response.data.error);

            return false;
          }
        }

      } catch (error) {
        console.error(error)
        throw error
      }

    } catch (error) {
      console.error(error.response)
      throw error
    }
  }

  async ativarWatch(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 3
    var acao_id = 1

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {

      var successWatch = await this.inserirTicketWatch(event, servico, acaoServico);

      if (successWatch) {
        SVAsOK += separadorOk + 'Watch Brasil'
        separadorOk = ', '
      } else {
        SVAsError += separadorError + 'Watch Brasil'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }

  }

  async cancelarWatch(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 3
    var acao_id = 2

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
      var successWatch = await this.deletarTicketWatch(event, servico, acaoServico);

      if (successWatch) {
        SVAsOK += separadorOk + 'Watch Brasil'
        separadorOk = ', '
      } else {
        SVAsError += separadorError + 'Watch Brasil'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }

  }

  async ativarHBO(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 4
    var acao_id = 1

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
      var successHBO = await this.inserirTicketWatch(event, servico, acaoServico);

      if (successHBO) {
        SVAsOK += separadorOk + 'HBO Max'
        separadorOk = ', '
      } else {
        SVAsError += separadorError + 'HBO Max'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }
  }

  async cancelarHBO(event, SVAsOK, separadorOk, SVAsError, separadorError) {
    var servico_id = 4
    var acao_id = 2

    const servico = await Servico.query()
      .where({ id: servico_id })
      .first()

    const acaoServico = await AcaoServico.query()
      .where({ servico_id })
      .where({ acao_id })
      .first()

    if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
      var successHBO = await this.deletarTicketWatch(event, servico, acaoServico);

      if (successHBO) {
        SVAsOK += separadorOk + 'HBO Max'
        separadorOk = ', '
      } else {
        SVAsError += separadorError + 'HBO Max'
        separadorError = ', '
      }
    } else {
      console.log(`Servico ${servico.nome} inativo ou não possui integração por api`)
    }
  }


  async inserirTicketWatch(event, servico, acaoServico) {
    try {

      const pPacote = parseInt(servico.integracao_id);
      const pName = event.name;
      const pEmail = event.email;
      const pPhone = event.phone;

      const documento = event.tx_id;
      const protocolo_externo_id = event.event_id;

      var url = 'https://apiweb.watch.tv.br/watch/v2/assinantes/insert';
      var separador = '?'

      if (pPacote && pPacote > 0) {
        url += separador + 'pPacote=' + pPacote;
        separador = '&'
      }

      if (pEmail) {
        url += separador + 'pEmail=' + pEmail;
        separador = '&'
      }

      if (pPhone) {
        url += separador + 'pPhone=' + pPhone.replace(/[^0-9]/g, '');
        separador = '&'
      }

      if (pName) {
        url += separador + 'pName=' + pName;
        separador = '&'
      }

      url += separador + 'pAssinanteIDIntegracao=' + event.contract_id;

      const newLogIntegracao = {
        nome_cliente: pName,
        documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: pPhone.replace(/[^0-9]/g, ''),
        cliente_erp_id: event.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: event.contract_id,
        protocolo_externo_id,
        user_id: event.user_id,
        servico_id: servico.id,
        acao_servico_id: acaoServico.id,
        acao: 'insert ticket',
        data_evento: event.event_data,
        log_evento_id: event.id
        // status: 'executada',
        // status_detalhe: null,
      }

      const respToken = await this.getAccessToken({ request: null, response: null });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + respToken.access_token,
          }
        };

        const respTicket = await axios(config)
          .then(function (resp) {
		  console.log('\n\n');
		  console.log('Retorno do Then:\n');
		  console.log(resp);


            return resp.data;
          })
          .catch(function (error) {
            console.log('\n\n');
		  console.log('Retorno do Catch:\n')
            console.log(error);
            return error;
          });


        if (respTicket && !respTicket.HasError && !respTicket.IsValidationError && respTicket.Result && respTicket.Result.ticket) {
          // return response.status(200).send(respTicket.Result)
          newLogIntegracao.ticket = respTicket.Result.ticket;
          newLogIntegracao.status = 'executada';
          newLogIntegracao.status_detalhe = respTicket.Result;

          const logIntegracao = await LogIntegracao.create(newLogIntegracao)
          const id = logIntegracao.id
          const data = await LogIntegracao.query()
            .where({ id })
            .first()

          return true

        } else {
          newLogIntegracao.status = 'falha';
          newLogIntegracao.status_detalhe = respTicket;

          await LogIntegracao.create(newLogIntegracao)

          console.error(respTicket)

          return false;
        }
      } else {
        newLogIntegracao.status = 'falha';
        newLogIntegracao.status_detalhe = respToken;

        await LogIntegracao.create(newLogIntegracao)

        console.error(respToken)

        return false;
      }

    } catch (error) {
      console.error('Erro no insert de ticket em api/watch by event \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar o insert de ticket api/watch by event' })
      throw error
    }

  }


  async deletarTicketWatch(event, servico, acaoServico) {
    try {
      //const { pPacote, pTicket, pEmail, IDIntegracaoAssinante, pStatus } = request.only(['pPacote', 'pTicket', 'pEmail', 'IDIntegracaoAssinante', 'pStatus'])
      //const { protocolo_externo_id } = request.only(['protocolo_externo_id'])

      const pPacote = parseInt(servico.integracao_id);
      const pName = event.name;
      const pEmail = event.email;
      const pPhone = event.phone;

      const documento = event.tx_id;
      const protocolo_externo_id = event.event_id;

      var pTicket = null;
      var IDIntegracaoAssinante = null;

      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/delete';

      var ticket;

      if (pPacote) {
        // ticket = await this.getTicket(pPacote, pEmail, event.contract_id);
        ticket = await this.getTicket(pPacote, null, event.contract_id);
      }

      const newLogIntegracao = {
        nome_cliente: pName,
        documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: pPhone ? pPhone.replace(/[^0-9]/g, '') : null,
        cliente_erp_id: event.client_id,
        pacote_id: pPacote,
        // assinante_id_integracao: event.contract_id,
        protocolo_externo_id,
        user_id: event.user_id,
        servico_id: servico.id,
        acao_servico_id: acaoServico.id,
        acao: 'excluir ticket',
        data_evento: event.event_data,
        log_evento_id: event.id
        // ticket: pTicket,
        // status: 'executada',
        // status_detalhe: null,
      }

      if (!ticket || !ticket.success || !ticket.ticket) {
        console.log('\n\nTicket não encontrato\n')
        newLogIntegracao.status = 'falha';
        newLogIntegracao.status_detalhe = 'Ticket não encontrado pela api watch';
        await LogIntegracao.create(newLogIntegracao)
        //return response.status(400).send(respDeleteTicket.data)
        return false;
      } else {
        pTicket = ticket.ticket.Ticket;
        IDIntegracaoAssinante = ticket.ticket.IDIntegracaoAssinante;
        newLogIntegracao.assinante_id_integracao = IDIntegracaoAssinante;
        newLogIntegracao.ticket = pTicket;
      }

      url += '?pTicket=' + pTicket;

      if (typeof pEmail != "undefined") {
        if (typeof pEmail == "string") {
          url += '&pEmail=' + pEmail;
        }
      }

      const respToken = await this.getAccessToken({ request: null, response: null });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + respToken.access_token
          }
        };

        const respDeleteTicket = await axios(config)
          .then(function (resp) {
            // console.log("\n\nENTROU NO THEN\n\n");
            // console.log({ resp });
            return resp.data;
          })
          .catch(function (error) {
            console.log("\n\nENTROU NO CATCH\n\n");
            console.log(error.response.data);
            return error.response.data;
          });

        if (respDeleteTicket && respDeleteTicket.Result && !respDeleteTicket.HasError && !respDeleteTicket.IsValidationError) {
          // return response.status(200).send({ menssage: 'Ticket deletado com sucesso.' })
          newLogIntegracao.status = 'executada';
          newLogIntegracao.status_detalhe = respDeleteTicket.Result;

          const logIntegracao = await LogIntegracao.create(newLogIntegracao)
          const id = logIntegracao.id
          const data = await LogIntegracao.query()
            .where({ id })
            .first()

          // return response.status(200).send({ menssage: 'Ticket excluído com sucesso.', data })
          return true

        } else {
          newLogIntegracao.status = 'falha';
          newLogIntegracao.status_detalhe = respDeleteTicket.data;
          await LogIntegracao.create(newLogIntegracao)
          //return response.status(400).send(respDeleteTicket.data)
          return false;
        }
      } else {
        newLogIntegracao.status = 'falha';
        newLogIntegracao.status_detalhe = respToken;
        await LogIntegracao.create(newLogIntegracao)
        // return response.status(400).send(respToken)
        return false;
      }

    } catch (error) {
      console.error('Erro no delete de ticket em api/watch \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar o delete de ticket api/watch' })
      throw error
    }

  }

  //-----------------------

  async getAccessToken() {
    try {

      const paramToken = await Parametro.findBy({ chave: 'watch_access_token' });

      if (paramToken && paramToken.id && paramToken.id > 0) {
        console.log(paramToken.updated_at)
        var dateValidade = moment(paramToken.updated_at).add(6, 'h').toDate();
        var isValido = dateValidade > new Date()
        if (isValido) {
          return { status: 'success', access_token: paramToken.valor }
        }
      }

      //se não houver parametro ou ele estiver inválido, solicitar novo token

      const resp = await this.authenticateWatch();

      if (resp && resp.data && !resp.data.HasError && !resp.data.IsValidationError && resp.data.Result && resp.data.Result.success) {
        return await this.validParamToken();
      } else {
        return resp.data;
      }

    } catch (error) {
      console.error('Erro no Get Access Token', error)
      throw error;
    }

  }

  //---UTILS INTERNOS----------

  async authenticateWatch() {
    try {

      const clientId = await Parametro.findBy({ chave: 'watch_client_id' });
      const redirectUrl = await Parametro.findBy({ chave: 'watch_redirect_url' });
      const uid = await Parametro.findBy({ chave: 'watch_uid' });

      if (!clientId) {
        throw { menssage: 'Client_id não parametrizado!' }
      }

      if (!redirectUrl) {
        throw { menssage: 'Redirect_url não parametrizada!' }
      }

      if (!uid) {
        throw { menssage: 'Uid não parametrizado!' }
      }

      console.log('\n\nENTROU NO AUTHENTICATE WATCH')
      console.log({ clientId: clientId.valor })
      console.log({ redirectUrl: redirectUrl.valor })

      var axios = require('axios');
      var qs = require('qs');
      var data = qs.stringify({
        'client_id': `${clientId.valor}`,
        'redirect_url': `${redirectUrl.valor}`,
        'approval_prompt': 'false',
        'uid': `${uid.valor}`
      });
      var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://apiweb.watch.tv.br/watch/v1/oauth/authenticate',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      };

      return await axios(config)
        .then(async function (response) {
          return response;
        })
        .catch(function (error) {
          console.log(error);
          return error;
        });

    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  async validParamToken() {
    console.log('\nENTROU NO VALID PARAM TOKEN')
    try {
      const paramToken = await Parametro.findBy({ chave: 'watch_access_token' });

      if (paramToken && paramToken.id && paramToken.id > 0) {
        var dateValidade = moment(paramToken.updated_at).add(6, 'h').toDate();
        var isValido = dateValidade > new Date()

        if (isValido) {
          console.log('\nPARAM TOKEN VALIDADO')
          return { status: 'success', access_token: paramToken.valor }
        } else {
          console.log('\nPARAM TOKEN NÂO VALIDADO')
          return { status: 'error', menssage: 'Falha na atualização do Access Token Watch (validParamToken)' }
        }
      }
    } catch (error) {
      console.error('Erro no Valid Access Token', error)
      throw error;
    }
  }


  async getTicket(pPacote, pEmailUsuario, pAssinanteIDIntegracao) {
    try {
      // console.log('\n\nGET TICKET BY EVENT\n\n');

      var url = 'https://apiweb.watch.tv.br/watch/v2/tickets/get';
      var separador = '?'

      if (pPacote && pPacote > 0) {
        url += separador + 'pPacote=' + pPacote;
        separador = '&'
      } else {
        return { success: false, menssage: 'Pacote não informado.', ticket: null }
      }

      if (pEmailUsuario) {
        url += separador + 'pEmailUsuario=' + pEmailUsuario;
        separador = '&'
      }
      // } else {
      //   return { success: false, menssage: 'E-mail não informado.', ticket: null }
      // }

      if (pAssinanteIDIntegracao) {
        url += separador + 'pAssinanteIDIntegracao=' + pAssinanteIDIntegracao;
        separador = '&'
      }


      const respToken = await this.getAccessToken({ request: null, response: null });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'get',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + respToken.access_token
          }
        };

        const respTicket = await axios(config)
          .then(function (resp) {
            return resp.data;
          })
          .catch(function (error) {
            console.log(error);
          });

        if (respTicket && !respTicket.HasError && !respTicket.IsValidationError && respTicket.Result && respTicket.Result.list) {
          // return response.status(200).send(respTicket.Result.list)
          return { success: true, menssage: 'Consulta retornada com sucesso.', ticket: respTicket.Result.list[0] || null }
        } else {
          // return response.status(400).send(respTicket)
          return { success: false, menssage: 'Falha na consulta de ticket.', ticket: null }
        }
      } else {
        // return response.status(400).send(respToken)
        return { success: false, menssage: 'Falha na consulta do access token.', ticket: null }
      }

    } catch (error) {
      console.error('Erro na busca de pacote em api/watch \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de pacote api/watch' })
      return { success: false, menssage: 'Falha na consulta de ticket.', ticket: null }
    }

  }

}

module.exports = new EventRepository()
