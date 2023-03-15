'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')
const LogWatch = use('App/Models/Common/LogWatch')

class WatchController {

  //Método que verifica a validade do token atual (reduzida pra 6h para reduzir o risco de falhas por Token Inválido) e retorna um token válido
  async getAccessToken({ request, response, params }) {
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
      if (response) {
        if (error.menssage) {
          return response.status(500).send({ menssage: error.menssage })
        }
      }
      throw error;
    }

  }


  //método acessado pela Watch, passando um CODE que será trocado por um TOKEN valido por 6h (homologação).
  async tokenGenerationHomologacao({ request, response, params }) {
    try {

      console.log('\n\nTOKEN GENERATION HML\n');

      const { code } = request.only(['code'])
      const { uid } = request.only(['uid'])

      if (!code) {
        return response.status(400).send({ menssage: 'code não informada!' })
      }

      if (!uid) {
        return response.status(400).send({ menssage: 'uid não informada!' })
      }

      console.log('\nSolicitando access-token by code ' + code + '\n');

      const clientId = await Parametro.findBy({ chave: 'watch_hml_client_id' });
      const clientSecret = await Parametro.findBy({ chave: 'watch_hml_client_secret' });

      if (!clientId) {
        return response.status(400).send({ menssage: 'Client_id não parametrizado!' })
      }

      if (!clientSecret) {
        return response.status(400).send({ menssage: 'Client_secret não parametrizado!' })
      }

      var qs = require('qs');
      var data = qs.stringify({
        'client_id': clientId.valor,
        'client_secret': clientSecret.valor,
        'code': code,
        'grant_type': 'password'
      });

      const resp = await axios({
        method: 'post',
        url: 'https://apiweb.watch.tv.br/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      }).then(async (res) => {

        console.log('\n\nENTROU NO THEN \n');

        const paramToken = await Parametro.findBy({ chave: 'watch_hml_access_token' });
        const token = res.data.Result[0];
        console.log({ token });

        var msgResponse;

        if (token && token.access_token) {

          try {
            if (paramToken && paramToken.id && paramToken.id > 0) {
              paramToken.valor = token.access_token;
              paramToken.updated_at = new Date();
              await paramToken.save();
              msgResponse = 'Parametro watch_hml_access_token atualizado com sucesso.'
            } else {
              const newParamToken = new Parametro();
              newParamToken.merge({
                chave: 'watch_hml_access_token',
                valor: token.access_token,
                descricao: 'Parametro referente ao token de autorização para a api do Watch Brasil em homologação, com validade de 8h a partir da data de atualização.',
                created_at: new Date(),
                updated_at: new Date()
              });

              await newParamToken.save();
              msgResponse = 'Parametro watch_hml_access_token criado com sucesso.'
            }

            const clientIdPro = await Parametro.findBy({ chave: 'watch_client_id' });
            if (clientIdPro.valor == clientId.valor) {
              const paramTokenProd = await Parametro.findBy({ chave: 'watch_access_token' });
              if (paramTokenProd && paramTokenProd.id && paramTokenProd.id > 0) {
                paramTokenProd.valor = token.access_token;
                paramTokenProd.updated_at = new Date();
                await paramTokenProd.save();
                msgResponse += ' (hml e prod)'
              }
            }

            return response.status(200).send(msgResponse);

          } catch (error) {
            return response.status(400).send('Falha na atualização do parametro watch_access_token.');
          }

        } else {
          return response.status(400).send('Falha no response do access_token');
        }

      }, (error) => {
        console.log('\nENTROU NO ERROR');
        console.log(error);
        if (error && error.response) {
          return response.status(error.response.status).send(error.response.data)
        } else {
          return response.status(400).send(error)
        }
      });

    } catch (error) {
      console.error('Erro no tokengeneration em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a geração de token api/watch' })
    }

  }

  //método acessado pela Watch, passando um CODE que será trocado por um TOKEN valido por 6h (produção).
  async tokenGenerationProducao({ request, response, params }) {
    try {
      const { code } = request.only(['code'])
      const { uid } = request.only(['uid'])

      if (!code) {
        return response.status(400).send({ menssage: 'code não informada!' })
      }

      if (!uid) {
        return response.status(400).send({ menssage: 'uid não informada!' })
      }

      console.log('\n\nSolicitando access-token by code ' + code + '\n');

      const clientId = await Parametro.findBy({ chave: 'watch_client_id' });
      const clientSecret = await Parametro.findBy({ chave: 'watch_client_secret' });


      if (!clientId) {
        return response.status(400).send({ menssage: 'Client_id não parametrizado!' })
      }

      if (!clientSecret) {
        return response.status(400).send({ menssage: 'Client_secret não parametrizado!' })
      }

      var qs = require('qs');
      var data = qs.stringify({
        'client_id': clientId.valor,
        'client_secret': clientSecret.valor,
        'code': code,
        'grant_type': 'password'
      });

      const resp = await axios({
        method: 'post',
        url: 'https://apiweb.watch.tv.br/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      }).then(async (res) => {
        const paramToken = await Parametro.findBy({ chave: 'watch_access_token' });
        const token = res.data.Result[0];

        if (token && token.access_token) {

          try {
            if (paramToken && paramToken.id && paramToken.id > 0) {
              paramToken.valor = token.access_token;
              paramToken.updated_at = new Date();
              await paramToken.save();
              return response.status(200).send('Parametro watch_access_token atualizado com sucesso.');
            } else {
              const newParamToken = new Parametro();
              newParamToken.merge({
                chave: 'watch_access_token',
                valor: token.access_token,
                descricao: 'Parametro referente ao token de autorização para a api do Watch Brasil em produção, com validade de 8h a partir da data de atualização.',
                created_at: new Date(),
                updated_at: new Date()
              });

              await newParamToken.save();
              return response.status(200).send('Parametro watch_access_token criado com sucesso.');
            }

          } catch (error) {
            return response.status(400).send('Falha na atualização do parametro watch_access_token.');
          }

        } else {
          return response.status(400).send('Falha no response do access_token');
        }

      }, (error) => {
        console.log('\nENTROU NO ERROR');
        console.log(error);
        if (error && error.response) {
          return response.status(error.response.status).send(error.response.data)
        } else {
          return response.status(400).send(error)
        }
      });

    } catch (error) {
      console.error('Erro no tokengeneration em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a geração de token api/watch' })
    }

  }


  async buscarPacote({ request, response, params }) {
    try {
      const { pPacote } = request.only(['pPacote'])
      var url = 'https://apiweb.watch.tv.br/watch/v1/pacotes/get';

      if (pPacote && pPacote > 0) {
        url += '?pPacote=' + pPacote;
      }

      const resp = await this.getAccessToken({ request, response });

      if (resp && resp.access_token) {

        var config = {
          method: 'get',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + resp.access_token
          }
        };

        const res = await axios(config)
          .then(function (resp) {
            return resp.data;
          })
          .catch(function (error) {
            console.log(error);
          });

        if (res && !res.HasError && !res.IsValidationError && res.Result && res.Result.list) {
          return response.status(200).send(res.Result.list)
        } else {
          return response.status(400).send(res)
        }
      } else {
        return response.status(400).send(resp)
      }

    } catch (error) {
      console.error('Erro na busca de pacote em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de pacote api/watch' })
    }

  }


  async buscarTicketV1({ request, response, params }) {
    try {

      console.log('\n\nENTROU NA BUSCA DE TICKETS V1')

      const { pPacote } = request.only(['pPacote'])
      const { pEmailUsuario } = request.only(['pEmailUsuario'])
      const { pAssinanteIDIntegracao } = request.only(['pAssinanteIDIntegracao'])
      const { notFixIdIntegracao } = request.only(['notFixIdIntegracao'])
      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/get';
      var separador = '?'

      console.log('\n\n')
      console.log({ notFixIdIntegracao })

      if (pPacote && pPacote > 0) {
        url += separador + 'pPacote=' + pPacote;
        separador = '&'
      }

      if (pEmailUsuario) {
        url += separador + 'pEmailUsuario=' + pEmailUsuario;
        separador = '&'
      }

      if (pAssinanteIDIntegracao) {
        url += separador + 'pAssinanteIDIntegracao=' + pAssinanteIDIntegracao;
        separador = '&'
      } else {
        if (!notFixIdIntegracao || (notFixIdIntegracao && notFixIdIntegracao == 'false')) {
          url += separador + 'pAssinanteIDIntegracao=n3t1z-api';
          separador = '&'
        }
      }

      console.log('\n' + url)

      console.log('\n\n')

      const respToken = await this.getAccessToken({ request, response });

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
          return response.status(200).send(respTicket.Result.list)
        } else {
          return response.status(400).send(respTicket)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro na busca de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de ticket api/watch' })
    }

  }

  async buscarTicketV2({ request, response, params }) {
    try {
      const { pPacote } = request.only(['pPacote'])
      const { pEmailUsuario } = request.only(['pEmailUsuario'])
      const { pAssinanteIDIntegracao } = request.only(['pAssinanteIDIntegracao'])
      var url = 'https://apiweb.watch.tv.br/watch/v2/tickets/get';
      var separador = '?'

      if (pPacote && pPacote > 0) {
        url += separador + 'pPacote=' + pPacote;
        separador = '&'
      }

      if (pEmailUsuario) {
        url += separador + 'pEmailUsuario=' + pEmailUsuario;
        separador = '&'
      }

      if (pAssinanteIDIntegracao) {
        url += separador + 'pAssinanteIDIntegracao=' + pAssinanteIDIntegracao;
        separador = '&'
      }

      const respToken = await this.getAccessToken({ request, response });

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
          return response.status(200).send(respTicket.Result.list)
        } else {
          return response.status(400).send(respTicket)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro na busca de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de ticket api/watch' })
    }

  }


  async inserirTicket({ request, response, params }) {
    try {
      const { pPacote } = request.only(['pPacote'])
      const { pEmail } = request.only(['pEmail'])
      const { pPhone } = request.only(['pPhone'])
      const { pName } = request.only(['pName'])

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
        url += separador + 'pPhone=' + pPhone;
        separador = '&'
      }

      if (pName) {
        url += separador + 'pName=' + pName;
        separador = '&'
      }

      url += separador + 'pAssinanteIDIntegracao=n3t1z-api';

      console.log({ url })

      const respToken = await this.getAccessToken({ request, response });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
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
            console.log('\n\n');
            console.log(error.response);
            return error.response;
          });

        if (respTicket && !respTicket.HasError && !respTicket.IsValidationError && respTicket.Result && respTicket.Result.ticket) {
          return response.status(200).send(respTicket.Result)
        } else {
          return response.status(400).send(respTicket.data)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no insert de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o insert de ticket api/watch' })
    }

  }


  async atualizarTelefone({ request, response, params, auth }) {
    try {
      const { pPacote, pTicket, pEmail, IDIntegracaoAssinante, pPhone } = request.only(['pPacote', 'pTicket', 'pEmail', 'IDIntegracaoAssinante', 'pPhone'])

      const { protocolo_externo_id } = request.only(['protocolo_externo_id'])

      const user = await auth.getUser();

      var url = 'https://apiweb.watch.tv.br/watch/v2/assinantes/editPhone';

      //------------

      var newPhone;

      if (typeof pPhone != "undefined") {
        if (typeof pPhone != "number") {
          return response.status(400).send({ menssage: 'Parametro pPhone deve ser um número.' })
        } else {
          newPhone = (pPhone.toString().length != 13 ? '55' : '') + pPhone;
          url += '?pPhone=' + newPhone;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pPhone deve ser informado.' })
      }

      if (typeof pTicket != "undefined") {
        if (typeof pTicket != "string") {
          return response.status(400).send({ menssage: 'Parametro pTicket deve ser uma string.' })
        } else {
          // url += '&pTicket=' + pTicket;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pTicket deve ser informado.' })
      }

      if (typeof pEmail != "undefined") {
        if (typeof pEmail != "string") {
          return response.status(400).send({ menssage: 'Parametro pEmail deve ser uma string.' })
        } else {
          url += '&pEmail=' + pEmail;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pEmail deve ser informado.' })
      }

      var ticket;

      if (typeof pPacote != "undefined") {
        if (typeof pPacote != "number") {
          return response.status(400).send({ menssage: 'Parametro pPacote deve ser um número inteiro.' })
        } else {
          url += '&pPacote=' + pPacote;
          ticket = await this.getTicket(pPacote, pEmail);
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pPacote deve ser informado.' })
      }

      if (!ticket || !ticket.success || !ticket.ticket) {
        return response.status(400).send({ menssage: 'Falha na validação do ticket.' })
      }

      if (pTicket != ticket.ticket.Ticket) {
        return response.status(400).send({ menssage: `Falha na validação do ticket. (Tickets diferentes)` })
      }

      console.log("\n\nAtualização de telefone\n")
      console.log({ newPhone })

      var oldPhone = parseInt(ticket.ticket.telefone);
      console.log({ oldPhone })

      var validacaoTelefones = this.compararTelefones(pPhone, oldPhone)

      console.log({ validacaoTelefones })

      if (!validacaoTelefones.valido) {
        return response.status(400).send({ menssage: validacaoTelefones.msg })
      }

      const newLogIntegracaoWatch = {
        // nome_cliente: pName,
        // documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: ticket.ticket.telefone ? ticket.ticket.telefone.replace(/[^0-9]/g, '') : null,
        //cliente_erp_id: clienteValidado.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: IDIntegracaoAssinante,
        protocolo_externo_id,
        user_id: user.id,
        acao: 'alteração de telefone',
        ticket: pTicket,
        // status: 'executada',
        // status_detalhe: null,
      }

      const respToken = await this.getAccessToken({ request, response });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + respToken.access_token
          }
        };

        const respEditPhone = await axios(config)
          .then(function (resp) {
            return resp.data;
          })
          .catch(function (error) {
            console.log('\n\n');
            console.log(error.response);
            return error.response;
          });

        if (respEditPhone && !respEditPhone.HasError && !respEditPhone.IsValidationError && respEditPhone.Result && respEditPhone.Result.User) {
          // return response.status(200).send(respEditPhone.Result)

          newLogIntegracaoWatch.telefone_cliente = newPhone;
          newLogIntegracaoWatch.status = 'executada';
          newLogIntegracaoWatch.status_detalhe = `Telefone alterado de ${oldPhone} para ${newPhone}`;

          const logWatch = await LogWatch.create(newLogIntegracaoWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return response.status(200).send({ menssage: 'Telefone alterado com sucesso.', data })
        } else {
          newLogIntegracaoWatch.status = 'falha';
          newLogIntegracaoWatch.status_detalhe = respEditPhone.data;

          await LogWatch.create(newLogIntegracaoWatch)
          return response.status(400).send(respEditPhone.data)
        }
      } else {
        newLogIntegracaoWatch.status = 'falha';
        newLogIntegracaoWatch.status_detalhe = respToken;

        await LogWatch.create(newLogIntegracaoWatch)
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no update de telefone em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o update de telefone api/watch' })
    }

  }



  async reenviarEmailAtivacao({ request, response, params }) {
    try {
      const { pTicket } = request.only(['pTicket'])
      var url = 'https://apiweb.watch.tv.br/watch/v1/assinante/sendemailactivation';
      var separador = '?'

      if (pTicket) {
        url += separador + 'pTicket=' + pTicket;
        separador = '&'
      }

      const respToken = await this.getAccessToken({ request, response });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + respToken.access_token
          }
        };

        const respSendEmail = await axios(config)
          .then(function (resp) {
            return resp.data;
          })
          .catch(function (error) {
            console.log('\n\n');
            console.log(error.response);
            return error.response;
          });

        if (respSendEmail && !respSendEmail.HasError && !respSendEmail.IsValidationError && respSendEmail.Result) {


          if (respSendEmail.Result[0] && respSendEmail.Result[0].email_send) {
            return response.status(200).send(respSendEmail.Result[0])
          } else {
            return response.status(400).send(respSendEmail.Result)
          }
        } else {
          return response.status(400).send(respSendEmail.data)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no reenvio de email de ativação em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o reenvio de email de ativação api/watch' })
    }

  }

  async atualizarStatus({ request, response, params, auth }) {
    try {
      const { pPacote, pTicket, pEmail, IDIntegracaoAssinante, pStatus } = request.only(['pPacote', 'pTicket', 'pEmail', 'IDIntegracaoAssinante', 'pStatus'])

      const { protocolo_externo_id } = request.only(['protocolo_externo_id'])

      const user = await auth.getUser();

      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/updatestatus';

      if (typeof pStatus != "undefined") {
        if (typeof pStatus != "boolean") {
          return response.status(400).send({ menssage: 'Parametro pStatus deve ser um boleano (true ou false).' })
        } else {
          url += '?pStatus=' + pStatus;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pStatus deve ser informado.' })
      }

      if (typeof pTicket != "undefined") {
        if (typeof pTicket != "string") {
          return response.status(400).send({ menssage: 'Parametro pTicket deve ser uma string.' })
        } else {
          url += '&pTicket=' + pTicket;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pTicket deve ser informado.' })
      }

      if (typeof pEmail != "undefined") {
        if (typeof pEmail != "string") {
          return response.status(400).send({ menssage: 'Parametro pEmail deve ser uma string.' })
        } else {
          url += '&pEmail=' + pEmail;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pEmail deve ser informado.' })
      }

      var ticket;

      if (typeof pPacote != "undefined") {
        if (typeof pPacote != "number") {
          return response.status(400).send({ menssage: 'Parametro pPacote deve ser um número inteiro.' })
        } else {
          ticket = await this.getTicket(pPacote, pEmail);
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pPacote deve ser informado.' })
      }

      if (!ticket || !ticket.success || !ticket.ticket) {
        return response.status(400).send({ menssage: 'Falha na validação do ticket.' })
      }

      if (pStatus == ticket.ticket.Status) {
        return response.status(400).send({ menssage: `Este Ticket já está ${pStatus ? 'Ativo' : 'Inativo'}.` })
      }

      const newLogIntegracaoWatch = {
        // nome_cliente: pName,
        // documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: ticket.ticket.telefone ? ticket.ticket.telefone.replace(/[^0-9]/g, '') : null,
        //cliente_erp_id: clienteValidado.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: IDIntegracaoAssinante,
        protocolo_externo_id,
        user_id: user.id,
        acao: pStatus ? 'ativação de ticket' : 'desativação de ticket',
        ticket: pTicket,
        // status: 'executada',
        // status_detalhe: null,
      }

      const respToken = await this.getAccessToken({ request, response });

      if (respToken && respToken.access_token) {

        var config = {
          method: 'post',
          maxBodyLength: Infinity,
          url,
          headers: {
            'Authorization': 'Bearer ' + respToken.access_token
          }
        };

        const respUpdateStatus = await axios(config)
          .then(function (resp) {
            return resp.data;
          })
          .catch(function (error) {
            console.log(error.response.data);
            return error.response.data;
          });

        if (respUpdateStatus && respUpdateStatus.Result && !respUpdateStatus.HasError && !respUpdateStatus.IsValidationError) {
          // return response.status(200).send({ menssage: 'Ticket ' + (pStatus ? 'ativado' : 'inativado') + ' com sucesso.' })
          newLogIntegracaoWatch.status = 'executada';
          newLogIntegracaoWatch.status_detalhe = respUpdateStatus.Result;

          const logWatch = await LogWatch.create(newLogIntegracaoWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return response.status(200).send({ menssage: 'Ticket ' + (pStatus ? 'ativado' : 'inativado') + ' com sucesso.', data })
        } else {
          newLogIntegracaoWatch.status = 'falha';
          newLogIntegracaoWatch.status_detalhe = respUpdateStatus.data;

          await LogWatch.create(newLogIntegracaoWatch)
          return response.status(400).send(respUpdateStatus.data)
        }
      } else {
        newLogIntegracaoWatch.status = 'falha';
        newLogIntegracaoWatch.status_detalhe = respToken;

        await LogWatch.create(newLogIntegracaoWatch)
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no update de status em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o update de status api/watch' })
    }

  }


  async deletarTicket({ request, response, params, auth }) {
    try {
      const { pPacote, pTicket, pEmail, IDIntegracaoAssinante, pStatus } = request.only(['pPacote', 'pTicket', 'pEmail', 'IDIntegracaoAssinante', 'pStatus'])
      const { protocolo_externo_id } = request.only(['protocolo_externo_id'])
      const user = await auth.getUser();

      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/delete';

      if (typeof pTicket != "undefined") {
        if (typeof pTicket != "string") {
          return response.status(400).send({ menssage: 'Parametro pTicket deve ser uma string.' })
        } else {
          url += '?pTicket=' + pTicket;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pTicket deve ser informado.' })
      }

      if (typeof pEmail != "undefined") {
        if (typeof pEmail != "string") {
          return response.status(400).send({ menssage: 'Parametro pEmail deve ser uma string.' })
        } else {
          url += '&pEmail=' + pEmail;
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pEmail deve ser informado.' })
      }

      var ticket;

      if (typeof pPacote != "undefined") {
        if (typeof pPacote != "number") {
          return response.status(400).send({ menssage: 'Parametro pPacote deve ser um número inteiro.' })
        } else {
          ticket = await this.getTicket(pPacote, pEmail);
        }
      } else {
        return response.status(400).send({ menssage: 'Parametro pPacote deve ser informado.' })
      }

      if (!ticket || !ticket.success || !ticket.ticket) {
        return response.status(400).send({ menssage: 'Falha na validação do ticket.' })
      }

      const newLogIntegracaoWatch = {
        // nome_cliente: pName,
        // documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: ticket.ticket.telefone ? ticket.ticket.telefone.replace(/[^0-9]/g, '') : null,
        //cliente_erp_id: clienteValidado.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: IDIntegracaoAssinante,
        protocolo_externo_id,
        user_id: user.id,
        acao: 'excluir ticket',
        ticket: pTicket,
        // status: 'executada',
        // status_detalhe: null,
      }

      const respToken = await this.getAccessToken({ request, response });

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
          newLogIntegracaoWatch.status = 'executada';
          newLogIntegracaoWatch.status_detalhe = respDeleteTicket.Result;

          const logWatch = await LogWatch.create(newLogIntegracaoWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return response.status(200).send({ menssage: 'Ticket excluído com sucesso.', data })

        } else {
          newLogIntegracaoWatch.status = 'falha';
          newLogIntegracaoWatch.status_detalhe = respDeleteTicket.data;
          await LogWatch.create(newLogIntegracaoWatch)
          return response.status(400).send(respDeleteTicket.data)
        }
      } else {
        newLogIntegracaoWatch.status = 'falha';
        newLogIntegracaoWatch.status_detalhe = respToken;
        await LogWatch.create(newLogIntegracaoWatch)
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no delete de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o delete de ticket api/watch' })
    }

  }



  //------------------------


  async inserirTicketNew({ request, response, params, auth }) {
    try {

      console.log('\n\nINSERT TICKET NEW\n\n')

      const { pPacote, pName, pEmail, pPhone } = request.only(['pPacote', 'pName', 'pEmail', 'pPhone'])
      const { documento, protocolo_externo_id } = request.only(['documento', 'protocolo_externo_id'])

      const user = await auth.getUser();

      var url = 'https://apiweb.watch.tv.br/watch/v2/assinantes/insert';
      var separador = '?'

      var clienteValidado

      if (documento && documento > 0) {
        var documentoValido = false;
        documentoValido = await this.validarCPF(documento);

        if (!documentoValido) {
          documentoValido = await this.validarCNPJ(documento);
        }

        if (!documentoValido) {
          return response.status(400).send('Documento inválido.')
        }

        clienteValidado = await this.getClienteByDocumento(documento);

        if (!clienteValidado || !clienteValidado.client_id || clienteValidado.client_id <= 0) {
          return response.status(400).send('Cliente não encontrado.')
        }

      } else {
        return response.status(400).send('Documento não informado.')
      }

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

      console.log({ url })

      const newLogIntegracaoWatch = {
        nome_cliente: pName,
        documento_cliente: documento.replace(/[^0-9]/g, ''),
        email_cliente: pEmail,
        telefone_cliente: pPhone.replace(/[^0-9]/g, ''),
        cliente_erp_id: clienteValidado.client_id,
        pacote_id: pPacote,
        assinante_id_integracao: 'n3t1z-api',
        protocolo_externo_id,
        user_id: user.id,
        acao: 'insert ticket',
        // status: 'executada',
        // status_detalhe: null,
      }

      const respToken = await this.getAccessToken({ request, response });

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
          newLogIntegracaoWatch.ticket = respTicket.Result.ticket;
          newLogIntegracaoWatch.status = 'executada';
          newLogIntegracaoWatch.status_detalhe = respTicket.Result;

          const logWatch = await LogWatch.create(newLogIntegracaoWatch)
          const id = logWatch.id
          const data = await LogWatch.query()
            .where({ id })
            .first()

          return data
        } else {
          newLogIntegracaoWatch.status = 'falha';
          newLogIntegracaoWatch.status_detalhe = respTicket.data;

          await LogWatch.create(newLogIntegracaoWatch)
          return response.status(400).send(respTicket.data)
        }
      } else {
        newLogIntegracaoWatch.status = 'falha';
        newLogIntegracaoWatch.status_detalhe = respToken;

        await LogWatch.create(newLogIntegracaoWatch)
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no insert de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o insert de ticket api/watch' })
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

  async findClienteErpByDocumento({ request, response, params, auth }) {
    const { documento } = params;

    if (!documento) {
      return response.status(400).send('Documento não informado!')
    }

    var documentoValido = false;
    documentoValido = await this.validarCPF(documento);

    if (!documentoValido) {
      console.log('PRIMEIRO IF DOC INVALIDO - CPF')
      documentoValido = await this.validarCNPJ(documento);
    }

    if (!documentoValido) {
      console.log('SEGUNDO IF DOC INVALIDO - CNPJ')
      return response.status(400).send('Documento Inválido!')
    }

    var clienteValidado = await this.getClienteByDocumento(documento);

    if (clienteValidado) {
      console.log('CLIENTE VALIDADO')
      // console.log({ clienteValidado })

      var cliente = {
        client_id: clienteValidado.client_id,
        client_name: clienteValidado.client_name,
        client_type_tx_id: clienteValidado.client_type_tx_id,
        client_cell_phone: clienteValidado.client_cell_phone,
        client_email: clienteValidado.client_email,
        contracts: clienteValidado.contracts,
        blocked_contracts: clienteValidado.blocked_contracts
      }

      return cliente
    } else {
      response.status(400).send('Cliente não encontrado!')
    }


  }

  async getClienteByDocumento(documento) {

    try {

      if (!documento) {
        console.log('Documento não informado');
        return null;
      }

      var documentoValido = false;
      documentoValido = await this.validarCPF(documento);

      if (!documentoValido) {
        documentoValido = await this.validarCNPJ(documento);
      }

      if (!documentoValido) {
        console.log('Documento não válido');
        return null;
      }

      console.log('Documento válidado');

      const host = Env.get('VOALLE_PABX_HOST');
      const evento = '/CLIENT_VALIDATE'
      var token = Env.get('VOALLE_TOKEN');

      var urlApi = host + evento;
      console.log(urlApi);

      var doc = documento.replace(/[^\d]+/g, '');

      const response = await axios({
        method: 'post',
        url: urlApi,
        responseType: 'json',
        headers: {
          "content-type": "application/json"
        },
        data: {
          codigo: doc,
          token
        }
      })

      if (response && response.data) {
        console.log("TEM RESPONSE")

        var clients = response.data.clients;

        if (clients && clients.length > 0) {
          console.log("CLIENTE ENCONTRADO")
          // console.log(clients[0])
          return clients[0];
        } else {
          console.log("CLIENTE NÃO ENCONTRADO")
          return null;
        }

      } else {
        console.log("NÂO TEM RESPONSE")
        return null;
      }

    } catch (error) {
      console.error(error);
      return null;
    }

  }

  async validarCPF(strCPF) {

    strCPF = strCPF.replace(/[^\d]+/g, '');
    if (strCPF == '') return false;
    if (strCPF.length != 11) return false;
    // Elimina CNPJs invalidos conhecidos
    if (strCPF == "00000000000" ||
      strCPF == "11111111111" ||
      strCPF == "22222222222" ||
      strCPF == "33333333333" ||
      strCPF == "44444444444" ||
      strCPF == "55555555555" ||
      strCPF == "66666666666" ||
      strCPF == "77777777777" ||
      strCPF == "88888888888" ||
      strCPF == "99999999999") return false;

    var Soma;
    var Resto;
    Soma = 0;

    for (var i = 1; i <= 9; i++) {
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)) {
      Resto = 0;
    }
    if (Resto != parseInt(strCPF.substring(9, 10))) {
      return false;
    }

    Soma = 0;

    for (var i = 1; i <= 10; i++) {
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11)) {
      Resto = 0;
    }
    if (Resto != parseInt(strCPF.substring(10, 11))) {
      return false;
    }
    return true;
  }

  async validarCNPJ(cnpj) {

    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj == '') return false;
    if (cnpj.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
      cnpj == "11111111111111" ||
      cnpj == "22222222222222" ||
      cnpj == "33333333333333" ||
      cnpj == "44444444444444" ||
      cnpj == "55555555555555" ||
      cnpj == "66666666666666" ||
      cnpj == "77777777777777" ||
      cnpj == "88888888888888" ||
      cnpj == "99999999999999") return false;

    // Valida DVs
    var tamanho = cnpj.length - 2;
    var numeros = cnpj.substring(0, tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) {
      return false;
    }

    return true;
  }

  compararTelefones(newPhone, oldPhone) {

    if (typeof newPhone != "undefined") {
      if (typeof newPhone != "number") {
        return { valido: false, msg: 'Novo Telefone deve ser um número.' }
      } else {

        if (newPhone.toString().length != 11 && newPhone.toString().length != 13) {
          return { valido: false, msg: 'Novo Telefone inválido.' }
        }

      }
    } else {
      return { valido: false, msg: 'Novo Telefone não informado.' }
    }

    if (typeof oldPhone != "undefined") {
      if (typeof oldPhone != "number") {
        return { valido: false, msg: 'Antigo Telefone deve ser um número.' }
      } else {

        if (oldPhone.toString().length != 13) {
          return { valido: false, msg: 'Antigo Telefone inválido.' }
        }

      }
    } else {
      return { valido: false, msg: 'Antigo Telefone não informado.' }
    }

    if (newPhone == oldPhone) {
      return { valido: false, msg: 'Novo telefone idêntico ao atual.' }
    }

    if (('55' + newPhone) == oldPhone.toString()) {
      return { valido: false, msg: 'Novo telefone idêntico ao atual.' }
    }

    return { valido: true, msg: 'Telefones serão alterado.' }

  }


}

module.exports = WatchController
