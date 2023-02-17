'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')

class WatchController {

  //Método que verifica a validade do token atual (reduzida pra 6h para reduzir o risco de falhas por Token Inválido) e retorna um token válido
  async getAccessToken({ request, response, params }) {
    try {

      const paramToken = await Parametro.findBy({ chave: 'access_token_watch' });

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


  async authenticateWatch() {
    try {
      var axios = require('axios');
      var qs = require('qs');
      var data = qs.stringify({
        'client_id': '4340937e03212',
        'redirect_url': 'https://netiz.n1z.nl/api/watch/tokengeneration',
        'approval_prompt': 'false',
        'uid': '123'
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
      const paramToken = await Parametro.findBy({ chave: 'access_token_watch' });

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


  //método acessado pela Watch, passando um CODE que será trocado por um TOKEN valido por 8h.
  async tokenGeneration({ request, response, params }) {
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

      var qs = require('qs');
      var data = qs.stringify({
        'client_id': '4340937e03212',
        'client_secret': '12f03ed89258d',
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
        const paramToken = await Parametro.findBy({ chave: 'access_token_watch' });
        const token = res.data.Result[0];

        if (token && token.access_token) {

          try {
            if (paramToken && paramToken.id && paramToken.id > 0) {
              paramToken.valor = token.access_token;
              paramToken.updated_at = new Date();
              await paramToken.save();
              return response.status(200).send('Parametro Access_Token_Watch atualizado com sucesso.');
            } else {
              const newParamToken = new Parametro();
              newParamToken.merge({
                chave: 'access_token_watch',
                valor: token.access_token,
                descricao: 'Parametro referente ao token de autorização a api do Watch Brasil, com validade de 8h a partir da data de atualização.',
                created_at: new Date(),
                updated_at: new Date()
              });

              await newParamToken.save();
              return response.status(200).send('Parametro Access_Token_Watch criado com sucesso.');
            }

          } catch (error) {
            return response.status(400).send('Falha na atualização do parametro access_token_watch.');
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
      const { pPacote } = request.only(['pPacote'])
      const { pEmailUsuario } = request.only(['pEmailUsuario'])
      const { pAssinanteIDIntegracao } = request.only(['pAssinanteIDIntegracao'])
      var url = 'https://apiweb.watch.tv.br/watch/v1/tickets/get';
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
      console.error('Erro na busca de pacote em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de pacote api/watch' })
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
      console.error('Erro na busca de pacote em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar a busca de pacote api/watch' })
    }

  }


  async inserirTicket({ request, response, params }) {
    try {
      const { pPacote } = request.only(['pPacote'])
      const { pEmail } = request.only(['pEmail'])
      const { pAssinanteIDIntegracao } = request.only(['pAssinanteIDIntegracao'])
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

      if (pAssinanteIDIntegracao) {
        url += separador + 'pAssinanteIDIntegracao=' + pAssinanteIDIntegracao;
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

      console.log({url})

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


  async atualizarTelefone({ request, response, params }) {
    try {
      const { pPacote } = request.only(['pPacote'])
      const { pEmail } = request.only(['pEmail'])
      const { pPhone } = request.only(['pPhone'])

      var url = 'https://apiweb.watch.tv.br/watch/v2/assinantes/editPhone';
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
          return response.status(200).send(respEditPhone.Result)
        } else {
          return response.status(400).send(respEditPhone.data)
        }
      } else {
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

  async atualizarStatus({ request, response, params }) {
    try {
      const { pStatus } = request.only(['pStatus'])
      const { pTicket } = request.only(['pTicket'])

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
          return response.status(200).send({ menssage: 'Ticket ' + (pStatus ? 'ativado' : 'inativado') + ' com sucesso.' })
        } else {
          return response.status(400).send(respUpdateStatus)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no update de status em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o update de status api/watch' })
    }

  }


  async deletarTicket({ request, response, params }) {
    try {
      const { pTicket } = request.only(['pTicket'])

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
            console.log({resp});
            return resp.data;
          })
          .catch(function (error) {
            console.log("\n\nENTROU NO CATCH\n\n");
            console.log(error.response.data);
            return error.response.data;
          });

          console.log("");

        if (respDeleteTicket && respDeleteTicket.Result && !respDeleteTicket.HasError && !respDeleteTicket.IsValidationError) {
          return response.status(200).send({ menssage: 'Ticket deletado com sucesso.' })
        } else {
          return response.status(400).send(respDeleteTicket)
        }
      } else {
        return response.status(400).send(respToken)
      }

    } catch (error) {
      console.error('Erro no delete de ticket em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o delete de ticket api/watch' })
    }

  }


}

module.exports = WatchController


