'use strict'

const Logger = use('Logger')
const Job = use('App/Models/Common/Job');
const Bull = use('Rocketseat/Bull')

const Database = use('Database')
const axios = require('axios');

const Notificacao = use("App/Models/Security/Notificacao");
const NotificacaoUser = use("App/Models/Security/NotificacaoUser");

class SendNotificacoes {

  static get key() {
    return "SendNotificacoes-key";
  }

  static get options() {
    return {
      attempts: 3,
      removeOnComplete: true,
    }
  }

  async handle(job) {
    try {

      const jobSendNotificacoes = await Job.findBy({ job_key: 'SendNotificacoes-key' });
      if (!jobSendNotificacoes || jobSendNotificacoes.situacao === 'I') {
        console.log('Job ENVIAR NOTIFICAÇÕES Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB ENVIAR NOTIFICAÇÕES EM ${(new Date()).toLocaleString()} ###`)

      const result = await this.enviarNotificacoesProgramadas();

      if (result && result.status == 'sucesso') {
        Logger.info(result.mensagem);
      } else {
        Logger.warn(result.mensagem);
      }

      jobSendNotificacoes.last_run_at = new Date();

      await jobSendNotificacoes.save()

      Logger.info(`## Finalizado job de envio de notificações as ${(new Date()).toLocaleString()}.`);
    } catch (error) {
      Logger.error('Erro no envio de notificações.', error);
      throw new Error(error);
    }
  }

  async enviarNotificacoesProgramadas() {
    try {

      const urlApi = 'https://fcm.googleapis.com/fcm/send';

      const select = await Database.raw(`SELECT notif.id, notuser.user_id, users.name as user_name, titulo, mensagem, acao_clique_url, icone_url, sub.icon_font,
origem_id, notif.created_at, scheduled_to, sended_at, readed_at, notif.updated_at, submodulo_id, sub.nome as submodulo_nome, sub.modulo_id, mod.nome as modulo_nome 
from security.notificacoes_users notuser 
join security.notificacoes notif on (notif.id = notuser.notificacao_id) 
join security.users as users on (users.id = notuser.user_id) 
join security.submodulos sub on (notif.submodulo_id = sub.id) 
join security.modulos  mod on (sub.modulo_id = mod.id) 
where sended_at is null and mod.status like 'A' and sub.status like 'A' 
and users.status is true and scheduled_to < now()`);

      const notificacoes = select.rows;

      if (notificacoes && notificacoes.length > 0) {
        for (var index in notificacoes) {
          const selectDevice = await Database.raw(`SELECT token FROM security.devices
                where user_id = ${notificacoes[index].user_id} and status like 'A'`);
          notificacoes[index].devices = selectDevice.rows;

          var toDevices = [];
          const devices = notificacoes[index].devices;
          if (devices && devices.length > 0) {
            for (var ind in devices) {
              toDevices.push(devices[ind].token);
            }
          }

          if (toDevices.length > 0) {
            var dataNot = {
              "notification": {
                "title": notificacoes[index].titulo,
                "body": notificacoes[index].mensagem,
                "click_action": notificacoes[index].acao_clique_url,
                "icon": notificacoes[index].icone_url
              },
              "registration_ids": toDevices
            }

            try {
              const response = await axios({
                method: 'post',
                url: urlApi,
                responseType: 'json',
                headers: {
                  "content-type": "application/json",
                  "authorization": "key=AAAAM4YfNU0:APA91bGF1ohOoivpDv41e1ZGZCm-RzKx9Z9IlwiF94Nfz4psMJpKa6QPBNeJoi0AqaphVKg2Elo76rPk4IlcyYD_o49RWwfVTtLT9CkakeFfYoLFDa04WHFtRI8kPlvcjY-NzgfJOyxv"
                },
                data: dataNot
              })
            } catch (error) {
              console.error(error)
            }

            this.marcarComoEnviada(notificacoes[index])

          } else {
            //console.log('Usuário sem Device cadastrado!');
            this.marcarComoEnviada(notificacoes[index])
          }
        }
        return {
          status: 'sucesso',
          mensagem: 'Notificações enviadas com sucesso!'
        }
      } else {
        return {
          status: 'sucesso',
          mensagem: 'Não há notificações a serem enviadas!'
        }
      }
    } catch (error) {
      console.error(error.response)
      throw error
    }
  }

  async marcarComoEnviada(notificacao) {
    try {

      // console.log('Marcando Como ENVIADA')

      var notificacao_id = notificacao.id;
      var user_id = notificacao.user_id;

      const notFind = await NotificacaoUser.findBy({ notificacao_id, user_id })
      if (notFind) {
        var sql = `UPDATE security.notificacoes_users SET sended_at='${new Date().toISOString()}' WHERE notificacao_id=${notificacao_id} and user_id=${user_id} and sended_at is null`;
        await Database.raw(sql);
        const notiUpdated = await NotificacaoUser.findBy({ notificacao_id, user_id })
        return notiUpdated;
      } else {
        Logger.warn(`Notificação intitulada ${notificacao.titulo} para o usuário ${notificacao.user_name} não foi encontrada para marcação de envio!`)
      }
    } catch (error) {
      console.error(error)
    }

  }

}

module.exports = SendNotificacoes;