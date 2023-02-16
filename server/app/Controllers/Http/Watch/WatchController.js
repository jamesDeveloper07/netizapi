'use strict'

const Env = use('Env')
const axios = require('axios');
const Database = use('Database')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const moment = require('moment-timezone');

const Parametro = use('App/Models/Common/Parametro')

class WatchController {

  async getAccessTokenTeste({ request, response, params }) {
    try {

      return this.getAccessToken({ request, response });

    } catch (error) {
      console.error('Erro no Get Access Token', error)
      throw error;
    }

  }

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

  async teste({ request, response, params }) {
    try {
      const { code } = request.only(['code'])
      const { uid } = request.only(['uid'])
      console.log('\n\nTESTE API WATCH\n');
      console.log({ code });
      console.log({ uid });


      if (!code) {
        return response.status(400).send({ menssage: 'code não informada!' })
      }

      if (!uid) {
        return response.status(400).send({ menssage: 'uid não informada!' })
      }

      return response.status(200).send({ menssage: 'Teste concluído!' })

    } catch (error) {
      console.error('Erro no teste em api/watch \n', error)
      return response.status(500).send({ menssage: 'Não conseguimos realizar o teste api/watch' })
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


}

module.exports = WatchController


