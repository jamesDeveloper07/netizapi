'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')

const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')
const LogWatch = use('App/Models/Common/LogWatch')

const Servico = use('App/Models/Common/Servico');

const Solicitacao = use('App/Models/Common/Solicitacao');
const Cliente = use('App/Models/Common/Cliente');
const RoleAndPermission = use('App/Utils/RoleAndPermission');


class EventController {

  async getEvents({ request, response, params }) {
    try {
      console.log('Método GET EVENTS Event Controller');

      const paramLastEventId = await Parametro.findBy({ chave: 'last_event_id' });

      if (paramLastEventId && paramLastEventId.id && paramLastEventId.id > 0) {
        // return response.status(200).send({ menssage: `Parametro last_event_id: ${paramLastEventId.valor} ` })
      } else {
        return response.status(500).send({ menssage: 'Parametro last_event_id não encontrado!' })
      }

      // const selectContractEvents = await Database
      //   .connection('pgvoalle')
      //   .raw(`Select *,
      //   (svas is not null) as isServicoDigital,
      //   (svas is not null and svas ilike '%698%') as isDeezer,
      //   (svas is not null and svas ilike '%699%') as isWatch,
      //   (svas is not null and svas ilike '%700%') as isHBO

      //   from (
      //   SELECT even.id, even.contract_id, even.contract_event_type_id, even.date, even.description
      //   ,cont.client_id, cli.name, cli.tx_id as cpf, cli.cell_phone_1 as phone, cli.email
      //   , cont.stage, cont.v_stage, cont.status, cont.v_status
      //   , string_agg(distinct(item.id)||'' , ',') as itens
      //   , string_agg(distinct(item.service_product_id)||'' , ',') as service_products
      //   , string_agg(comp.service_product_id||'' , ',') as svas

      //   FROM erp.contract_events even
      //   inner join erp.contracts cont on  (even.contract_id = cont.id)
      //   inner join erp.people cli on (cont.client_id = cli.id)
      //   inner join erp.contract_items item on (cont.id = item.contract_id and item.deleted is FALSE and item.contract_service_tag_id is not null)
      //   inner join erp.service_compositions comp on (comp.parent_id = item.service_product_id and comp.service_product_id in (698,699,700))

      //   where TRUE
      //   and even.id > ${paramLastEventId.valor}

      //   and (even.contract_event_type_id = 3 --cadastro aprovado
      //   or even.contract_event_type_id in(110, 153, 154, 155, 156, 157,158,159,160,161,162,163,164,165,166,167,168,169,170,174,175) ) --cadastro cancelados

      //   --and even.contract_event_type_id = 3 --cadastro aprovado
      //   --and even.contract_event_type_id = 27 --inclusão de serviço
      //   --and even.contract_event_type_id in(3, 156) --cadastro aprovado ou cancelado(Mudança)
      //   --and even.contract_event_type_id = 105
      //   --and even.contract_event_type_id = 28

      //   --and cont.id = 9762 -- HBO
      //   --and cont.id = 220085 -- cancelado
      //   --and cont.id = 214515 -- cancelado

      //   and even.deleted = false
      //   GROUP BY even.id, even.contract_id, cont.client_id, cont.stage, cont.v_stage, cont.status, cont.v_status, cli.id
      //   order by even.id desc
      //   limit 1000
      //   ) as eventos_svas`);


      const selectContractEvents = await Database
        .connection('pg')
        .raw(`Select * FROM public.contract_events even
        where TRUE
        and even.id > ${paramLastEventId.valor}
        order by even.id desc
        limit 1000 `);

      // later close the connection
      Database.close(['pg']);

      const contractEvents = selectContractEvents.rows

      if (contractEvents && contractEvents.length > 0) {
        paramLastEventId.valor = contractEvents[0].id
        paramLastEventId.updated_at = new Date();
        await paramLastEventId.save();
      }

      for (const event of contractEvents) {
        if (event.isservicodigital) {
          if (this.isAprocavao(event.contract_event_type_id)) {
            var SVAsOK = '';
            var separadorOk = '';

            var SVAsError = '';
            var separadorError = '';

            if (event.isdeezer) {
              var servico_id = 1
              var tipoExecucao = 'activate';

              const servico = await Servico.query()
                .where({ id: servico_id })
                .first()

              if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
                var successDeezer = await this.executarDeezer(event, servico, tipoExecucao);

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

            if (event.iswatch) {
              var servico_id = 3

              const servico = await Servico.query()
                .where({ id: servico_id })
                .first()

              if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {

                var successWatch = await this.inserirTicketWatch(event, servico);

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

            if (event.ishbo) {
              var servico_id = 4
              const servico = await Servico.query()
                .where({ id: servico_id })
                .first()

              if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
                var successHBO = await this.inserirTicketWatch(event, servico);

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

            console.log(`Criar assinatura (${SVAsOK}) para ${event.name}`)
          } else {
            if (this.isCancelamento(event.contract_event_type_id)) {

              var SVAsOK = '';
              var separadorOk = '';

              var SVAsError = '';
              var separadorError = '';

              if (event.isdeezer) {
                var servico_id = 1
                var tipoExecucao = 'deactivate';

                const servico = await Servico.query()
                  .where({ id: servico_id })
                  .first()

                if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {

                  var successDeezer = await this.executarDeezer(event, servico, tipoExecucao);

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

              if (event.iswatch) {
                var servico_id = 3
                const servico = await Servico.query()
                  .where({ id: servico_id })
                  .first()

                if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
                  var successWatch = await this.deletarTicketWatch(event, servico);

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

              if (event.ishbo) {
                var servico_id = 4
                const servico = await Servico.query()
                  .where({ id: servico_id })
                  .first()

                if (servico && servico.status && servico.status == 'ativo' && servico.integracao_by_api) {
                  var successHBO = await this.deletarTicketWatch(event, servico);

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

              console.log(`Remover assinatura (${SVAsOK}) para ${event.name}`)

            }

          }
        }
      }


      return contractEvents;

    } catch (error) {
      console.error('Erro no metodo getEvents api/voalle \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o metodo getEvents api/voalle' })
    }
  }

  isAprocavao(event_type_id) {
    const idsAprovacao = [3]
    for (var i = 0; i < idsAprovacao.length; i++) {
      if (idsAprovacao[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  isCancelamento(event_type_id) {
    const idsCancelamento = [110, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 174, 175]
    for (var i = 0; i < idsCancelamento.length; i++) {
      if (idsCancelamento[i] == event_type_id) {
        return true;
      }
    }
    return false;
  }

  async executarDeezer(event, servico, tipoExecucao) {
    try {

      //const hostApi = 'https://beta-eng.hubisp.net.br/notification/';
      //const hostApi = 'https://eng.hubisp.net.br/notification/';
      const hostApi = Env.get('HUBISP_API_HOST') + '/notification/';
      var code = `?code=${Env.get('HUBISP_API_CODE')}`;
      var token = Env.get('HUBISP_API_TOKEN');

      var key = '&key=' + event.cpf;
      var ext = '&ext=' + event.phone;

      var urlApi = hostApi + tipoExecucao + code + key

      if (tipoExecucao === 'activate') {
        urlApi = urlApi + ext;
      }

      const newWatch = {
        nome_cliente: event.name,
        documento_cliente: event.cpf,
        email_cliente: event.email,
        telefone_cliente: event.phone,
        cliente_erp_id: event.client_id,
        pacote_id: null,
        assinante_id_integracao: null,
        protocolo_externo_id: event.id,
        user_id: 1,
        servico_id: servico.id,
        acao: tipoExecucao,
        // status: 'executada',
        // status_detalhe: null,
      }

      try {

        const response = await axios({
          method: 'get',
          url: urlApi,
          headers: {
            'Authorization': 'Bearer ' + token
          }
        })


        if (response && response.data && response.data.response) {
          newWatch.status = 'executada';
          newWatch.status_detalhe = response.data;

          const logWatch = await LogWatch.create(newWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return true;

        } else {
          if (response && response.data && !response.data.response) {
            // await this.marcarComoFalhaOuInvalida(event[index], 'falha', 'Falha na execução por parte da api')
            // throw Error(response.data.error);

            newWatch.status = 'falha';
            newWatch.status_detalhe = response.data;

            const logWatch = await LogWatch.create(newWatch)
            const id = logWatch.id
            const data = await LogWatch.query()
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


  async inserirTicketWatch(event, servico) {
    try {

      const pPacote = parseInt(servico.integracao_id);
      const pName = event.name;
      const pEmail = event.email;
      const pPhone = event.phone;

      const documento = event.cpf;
      const protocolo_externo_id = event.id;

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

      url += separador + 'pAssinanteIDIntegracao=n3t1z-api';

      const newWatch = {
        nome_cliente: pName,
        documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: pPhone.replace(/[^0-9]/g, ''),
        cliente_erp_id: event.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: 'n3t1z-api',
        protocolo_externo_id,
        user_id: 1,
        servico_id: servico.id,
        acao: 'insert ticket',
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
            return resp.data;
          })
          .catch(function (error) {
            console.log('\n\n');
            console.log(error.response);
            return error.response;
          });


        if (respTicket && !respTicket.HasError && !respTicket.IsValidationError && respTicket.Result && respTicket.Result.ticket) {
          // return response.status(200).send(respTicket.Result)
          newWatch.ticket = respTicket.Result.ticket;
          newWatch.status = 'executada';
          newWatch.status_detalhe = respTicket.Result;

          const logWatch = await LogWatch.create(newWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return true

        } else {
          newWatch.status = 'falha';
          newWatch.status_detalhe = respTicket.data;

          await LogWatch.create(newWatch)

          console.error(respTicket.data)

          return false;
        }
      } else {
        newWatch.status = 'falha';
        newWatch.status_detalhe = respToken;

        await LogWatch.create(newWatch)

        console.error(respToken)

        return false;
      }

    } catch (error) {
      console.error('Erro no insert de ticket em api/watch by event \n', error)
      // return response.status(500).send({ menssage: 'Não conseguimos realizar o insert de ticket api/watch by event' })
      throw error
    }

  }


  async deletarTicketWatch(event, servico) {
    try {
      //const { pPacote, pTicket, pEmail, IDIntegracaoAssinante, pStatus } = request.only(['pPacote', 'pTicket', 'pEmail', 'IDIntegracaoAssinante', 'pStatus'])
      //const { protocolo_externo_id } = request.only(['protocolo_externo_id'])

      const pPacote = parseInt(servico.integracao_id);
      const pName = event.name;
      const pEmail = event.email;
      const pPhone = event.phone;

      const documento = event.cpf;
      const protocolo_externo_id = event.id;

      var pTicket = null;
      var IDIntegracaoAssinante = null;

      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/delete';

      var ticket;

      if (pPacote) {
        ticket = await this.getTicket(pPacote, pEmail);
      }

      const newWatch = {
        nome_cliente: pName,
        documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: pPhone ? pPhone.replace(/[^0-9]/g, '') : null,
        cliente_erp_id: event.client_id,
        pacote_id: pPacote,
        // assinante_id_integracao: IDIntegracaoAssinante,
        protocolo_externo_id,
        user_id: 1,
        servico_id: servico.id,
        acao: 'excluir ticket',
        // ticket: pTicket,
        // status: 'executada',
        // status_detalhe: null,
      }

      if (!ticket || !ticket.success || !ticket.ticket) {
        console.log('\n\nTicket não encontrato\n')
        newWatch.status = 'falha';
        newWatch.status_detalhe = 'Ticket não encontrado pela api watch';
        await LogWatch.create(newWatch)
        //return response.status(400).send(respDeleteTicket.data)
        return false;
      } else {
        pTicket = ticket.ticket.Ticket;
        IDIntegracaoAssinante = ticket.ticket.IDIntegracaoAssinante;
        newWatch.assinante_id_integracao = IDIntegracaoAssinante;
        newWatch.ticket = pTicket;
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
            console.log("\n\nENTROU NO THEN\n\n");
            console.log({ resp });
            return resp.data;
          })
          .catch(function (error) {
            console.log("\n\nENTROU NO CATCH\n\n");
            console.log(error.response.data);
            return error.response.data;
          });

        if (respDeleteTicket && respDeleteTicket.Result && !respDeleteTicket.HasError && !respDeleteTicket.IsValidationError) {
          // return response.status(200).send({ menssage: 'Ticket deletado com sucesso.' })
          newWatch.status = 'executada';
          newWatch.status_detalhe = respDeleteTicket.Result;

          const logWatch = await LogWatch.create(newWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          // return response.status(200).send({ menssage: 'Ticket excluído com sucesso.', data })
          return true

        } else {
          newWatch.status = 'falha';
          newWatch.status_detalhe = respDeleteTicket.data;
          await LogWatch.create(newWatch)
          //return response.status(400).send(respDeleteTicket.data)
          return false;
        }
      } else {
        newWatch.status = 'falha';
        newWatch.status_detalhe = respToken;
        await LogWatch.create(newWatch)
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
      console.log('\n\nGET TIOCKET BY EVENT\n\n');

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
      } else {
        return { success: false, menssage: 'E-mail não informado.', ticket: null }
      }

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

module.exports = EventController


