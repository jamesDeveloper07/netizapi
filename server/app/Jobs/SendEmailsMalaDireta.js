'use strict'

const Logger = use('Logger')
const DestinatarioMalaDireta = use('App/Models/Marketing/DestinatarioMalaDireta');
const MalaDireta = use('App/Models/Marketing/MalaDireta');
const Job = use('App/Models/Common/Job');

const MailRepository = use('App/Repository/MailRepository')

class SendEmailsMalaDireta {
  static get key() {
    return "SendEmailsMalaDireta-key";
  }

  static get options() {
    return {
      attempts: 3,
      removeOnComplete: true,
    }
  }

  async handle(job) {

    try {
      const jobSendEmail = await Job.findBy({ job_key: 'SendEmailsMalaDireta-key' });
      if (!jobSendEmail || jobSendEmail.situacao === 'I') {
        console.log('Job SEND EMAIL MALA DIRETA Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB ENVIO E-MAIL MALA DIRETA EM ${(new Date()).toLocaleString()} ###`)

      const { data } = job;

      const malaDireta = await MalaDireta
        .query()
        .with('emailRemetente', (builder) => {
          builder.with('empresa')
        })
        .where('id', data.mala_direta_id)
        .whereNull('situacao_email')
        .first();
      const estagio = await malaDireta.estagio().first()

      if (!malaDireta || !malaDireta.id) return

      const destinatarios = await DestinatarioMalaDireta
        .query()
        .where('mala_direta_id', data.mala_direta_id)
        .where({ tipo_contato: 'email' })
        .whereNull('data_envio')
        .fetch();

      if (destinatarios && destinatarios.rows.length > 0) {

        malaDireta.merge({
          situacao_email: 'em-andamento',
          situacao: 'em-andamento'
        });
        await malaDireta.save();

        Logger.info(`## Iniciando envio de ${destinatarios.rows.length} emails da mala direta ` + malaDireta.id + ' ' + malaDireta.nome);

        const canRun = !estagio || (estagio && estagio.data_execucao && !moment().isBefore(estagio.data_execucao))

        if (canRun) {
          await MailRepository.sendEmailsByMalaDireta({
            destinatarios: destinatarios.rows,
            malaDireta
          })
        }

        malaDireta.merge({
          situacao: estagio && estagio.data_execucao ? 'concluido' : 'ativo',
          situacao_email: estagio && estagio.data_execucao ? 'concluido' : null
        });
        await malaDireta.save();
        Logger.info(`## Finalizado Envio de EMAIL de mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);

      } else {
        Logger.info(`## Nenhum envio de emails a ser feito para a mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);

        //inicialmente, estou tratando as malas diretas que não são de esteiras
        if (malaDireta.origem != 'esteira') {
          var msg = `## Envio de E-mail da Mala Direta ${malaDireta.id} ${malaDireta.nome} Concluído em ${(new Date()).toLocaleString()}`;

          //Já que não temos mais destinatários pendentes, dar o envio de email como  concluído
          malaDireta.merge({
            situacao_email: 'concluido',
            updated_at: new Date()
          });

          //se a malaDireta for somente de email ou envio de sms já estiver concluído, concluí-la.
          if (!malaDireta.enviar_sms || malaDireta.situacao_sms == 'concluído') {
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
        Logger.info(`## Finalizado Envio de EMAIL de mala direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);
      }

      jobSendEmail.last_run_at = new Date();
      await jobSendEmail.save()

    } catch (error) {
      Logger.error(`Não foi possível enviar os emails da mala direta ${malaDireta.id} ${malaDireta.nome}\n`, error);
      if (malaDireta && !estagio) {
        malaDireta.situacao_email = 'cancelado'
        await malaDireta.save()
      }
      throw new Error(error);
    }
  }
}

module.exports = SendEmailsMalaDireta;