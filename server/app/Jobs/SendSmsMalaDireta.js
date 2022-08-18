'use strict'

const Logger = use('Logger')
const DestinatarioMalaDireta = use('App/Models/Marketing/DestinatarioMalaDireta');
const MalaDireta = use('App/Models/Marketing/MalaDireta');
const Job = use('App/Models/Common/Job');

const SmsRepository = use('App/Repository/SmsRepository')

class SendSmsMalaDireta {
  static get key() {
    return "SendSmsMalaDireta-key";
  }

  static get options() {
    return {
      attempts: 3,
      removeOnComplete: true,
    }
  }

  async handle(job) {

    try {
      const jobSendSms = await Job.findBy({ job_key: 'SendSmsMalaDireta-key' });
      if (jobSendSms && jobSendSms.situacao === 'I') {
        console.log('Job ENVIO SMS MALA DIRETA Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB ENVIO SMS MALA DIRETA EM ${(new Date()).toLocaleString()} ###`)

      const { data } = job;

      const malaDireta = await MalaDireta
        .query()
        .where('id', data.mala_direta_id)
        .where({ enviar_sms: true })
        .where('situacao', 'ativo')
        .first();
      const estagio = await malaDireta.estagio().first()



      if (!malaDireta || !malaDireta.id) return

      malaDireta.merge({
        situacao_sms: 'em-andamento',
        situacao: 'em-andamento'
      });
      await malaDireta.save();

      const destinatarios = await DestinatarioMalaDireta
        .query()
        .where('mala_direta_id', data.mala_direta_id)
        .where({ tipo_contato: 'telefone' })
        .whereNull('data_envio')
        .fetch();

      if (destinatarios && destinatarios.rows.length > 0) {

        Logger.info(`## Iniciando envio de ${destinatarios.rows.length} SMSs da mala direta ` + malaDireta.id + ' ' + malaDireta.nome);

        const canRun = !estagio || (estagio && estagio.data_execucao && !moment().isBefore(estagio.data_execucao))

        if (canRun) {
          await SmsRepository.sendSms({
            destinatarios: destinatarios.rows,
            malaDireta
          })

          malaDireta.merge({
            situacao: estagio && estagio.data_execucao ? 'concluido' : 'ativo',
            situacao_sms: estagio && estagio.data_execucao ? 'concluido' : null
          });
          await malaDireta.save();
        }

        Logger.info(`Finalizado envio de SMS de mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);

      } else {
        Logger.info(`## Nenhum envio de SMS a ser feito para a mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);

        //inicialmente, estou tratando as malas diretas que não são de esteiras
        if (malaDireta.origem != 'esteira') {
          var msg = `## Envio de SMS da Mala Direta ${malaDireta.id} ${malaDireta.nome} Concluído em ${(new Date()).toLocaleString()}`;

          //Já que não temos mais destinatários pendentes, dar o envio de sms como  concluído
          malaDireta.merge({
            situacao_sms: 'concluido',
            updated_at: new Date()
          });
          //se a malaDireta for somente de sms ou envio de email já estiver concluído, concluí-la.
          if (!malaDireta.enviar_email || malaDireta.situacao_email == 'concluído') {
            msg += `
            ## Mala Direta ${malaDireta.id} ${malaDireta.nome} Concluída em ${(new Date()).toLocaleString()}`;
            malaDireta.merge({
              situacao: 'concluido',
              updated_at: new Date()
            });
          }
          await malaDireta.save();
          Logger.info(msg);
        }
        Logger.info(`Finalizado envio de SMS de mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);
      }
      
      jobSendSms.last_run_at = new Date();
      await jobSendSms.save()

    } catch (error) {
      Logger.error(`Não foi possível enviar os sms da mala direta ${malaDireta.id} ${malaDireta.nome}\n`, error);
      if (malaDireta && !estagio) {
        malaDireta.situacao_sms = 'cancelado'
        await malaDireta.save()
      }
      throw error
    }
  }
}

module.exports = SendSmsMalaDireta;