'use strict'

const Logger = use('Logger')
const Job = use('App/Models/Common/Job');
const Bull = use('Rocketseat/Bull')

const JobSendEmailMalaDireta = use('App/Jobs/SendEmailsMalaDireta')
const JobSendSmsMalaDireta = use('App/Jobs/SendSmsMalaDireta')

const MalaDireta = use('App/Models/Marketing/MalaDireta');
const DestinatarioMalaDireta = use('App/Models/Marketing/DestinatarioMalaDireta');
const MailRepository = use('App/Repository/MailRepository')
const SmsRepository = use('App/Repository/SmsRepository')


class GerenciarMalaDireta {

  static get key() {
    return "GerenciarMalaDireta-key";
  }

  static get options() {
    return {
      attempts: 3,
      removeOnComplete: true,
    }
  }

  async enviarEmail(job) {
    console.log('FUNÇÂO ENVIAR MALA E-MAIL')
    console.log({ job })

    var malaDireta;
    var estagio;

    try {
      malaDireta = await MalaDireta
        .query()
        .with('emailRemetente', (builder) => {
          builder.with('empresa')
        })
        .where('id', job.mala_direta_id)
        .whereNull('situacao_email')
        .first();

    } catch (error) {
      console.log(`### Falha ao Buscar MALA DIRETA ${job.mala_direta_id} ###`)
      return;
    }

    try {
      const jobSendEmail = await Job.findBy({ job_key: 'SendEmailsMalaDireta-key' });
      if (!jobSendEmail || jobSendEmail.situacao === 'I') {
        console.log('Job SEND EMAIL MALA DIRETA Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB ENVIO E-MAIL MALA DIRETA EM ${(new Date()).toLocaleString()} ###`)

      estagio = await malaDireta.estagio().first()

      if (!malaDireta || !malaDireta.id) return

      const destinatarios = await DestinatarioMalaDireta
        .query()
        .where('mala_direta_id', job.mala_direta_id)
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
    }
  }


  async enviarSMS(job) {
    console.log('FUNÇÂO ENVIAR MALA SMS')
    console.log({ job })

    var malaDireta;
    var estagio;

    try {
      malaDireta = await MalaDireta
        .query()
        .where('id', job.mala_direta_id)
        .where({ enviar_sms: true })
        .where('situacao', 'ativo')
        .first();
    } catch (error) {
      console.log(`### Falha ao Buscar MALA DIRETA ${job.mala_direta_id} ###`)
      return;
    }

    try {
      const jobSendSms = await Job.findBy({ job_key: 'SendSmsMalaDireta-key' });
      if (jobSendSms && jobSendSms.situacao === 'I') {
        console.log('Job ENVIO SMS MALA DIRETA Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB ENVIO SMS MALA DIRETA EM ${(new Date()).toLocaleString()} ###`)

      estagio = await malaDireta.estagio().first()

      if (!malaDireta || !malaDireta.id) return

      malaDireta.merge({
        situacao_sms: 'em-andamento',
        situacao: 'em-andamento'
      });
      await malaDireta.save();

      const destinatarios = await DestinatarioMalaDireta
        .query()
        .where('mala_direta_id', job.mala_direta_id)
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
    }
  }

  async handle(job) {
    try {

      const jobGerenciarMalaDireta = await Job.findBy({ job_key: 'GerenciarMalaDireta-key' });
      if (!jobGerenciarMalaDireta || jobGerenciarMalaDireta.situacao === 'I') {
        console.log('Job GERENCIAR MALA DIRETA Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB GERENCIAMENTO DE MALA DIRETA EM ${(new Date()).toLocaleString()} ###`)

      //Bucas as malas diretas convencionais...
      const malasDiretas = await MalaDireta
        .query()
        .where({ situacao: 'ativo' })
        .whereNull('estagio_id')
        .whereRaw(`data_agendamento <= now()`)
        .whereRaw(`is_nps is false`)
        .fetch()

      //Bucas as malas diretas NPS (pesquisa de satisfação)...
      const malasDiretasNPS = await MalaDireta
        .query()
        .where({ situacao: 'ativo' })
        .whereNull('estagio_id')
        .whereRaw(`data_agendamento <= now()`)
        .whereRaw(`is_nps is true`)
        .fetch()

      //Busca as malas diretas das esteiras por data de execucao...
      const malasDiretasEsteirasDataExecucao = await MalaDireta
        .query()
        .where({ situacao: 'ativo' })
        .whereNotNull('estagio_id')
        .whereRaw(` estagio_id IN (
          SELECT id FROM marketing.estagios_esteiras WHERE situacao = 'A' AND deleted_at IS NULL and fluxo like 'data' AND data_execucao <= now()
          AND esteira_id IN (SELECT id FROM marketing.esteiras WHERE situacao = 'A' AND deleted_at IS NULL)
          )`)
        .fetch()

      //Busca as malas diretas de esteiras por periodo...
      const malasDiretasEsteirasPeriodoExecucao = await MalaDireta
        .query()
        .where({ situacao: 'ativo' })
        .whereNotNull('estagio_id')
        .whereRaw(`estagio_id IN (
          SELECT id FROM marketing.estagios_esteiras WHERE situacao = 'A' AND deleted_at IS NULL 
          and fluxo like 'periodo' AND periodo_execucao IS NOT NULL
          AND esteira_id IN (SELECT id FROM marketing.esteiras WHERE situacao = 'A' AND deleted_at IS NULL)
          )`)
        .fetch()


      const malasParaExecutar = [...malasDiretas.rows,
      ...malasDiretasNPS.rows,
      ...malasDiretasEsteirasDataExecucao.rows,
      ...malasDiretasEsteirasPeriodoExecucao.rows]

      Logger.info(`## ${malasParaExecutar.length} malas diretas encontradas para execução.`)

      //itera as malas diretas convencionais...
      for (let malaDireta of malasParaExecutar) {
        if (malaDireta.enviar_email && !malaDireta.situacao_email) {
          Logger.info(`## ACIONANDO JOB de Envio de EMAIL a Mala Direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);
          //Bull.add(JobSendEmailMalaDireta.key, { mala_direta_id: malaDireta.id })
          //await JobSendEmailMalaDireta.handle(JobSendEmailMalaDireta.key, { mala_direta_id: malaDireta.id })
          await this.enviarEmail({ key: JobSendEmailMalaDireta.key, mala_direta_id: malaDireta.id })
        }
        if (malaDireta.enviar_sms && !malaDireta.situacao_sms) {
          Logger.info(`## ACIONANDO JOB de Envio de SMS a Mala Direta ${malaDireta.id} ${malaDireta.nome} em ${(new Date()).toLocaleString()}`);
          //Bull.add(JobSendSmsMalaDireta.key, { mala_direta_id: malaDireta.id })
          //await JobSendSmsMalaDireta.handle(JobSendSmsMalaDireta.key, { mala_direta_id: malaDireta.id })
          await this.enviarSMS({key: JobSendSmsMalaDireta.key, mala_direta_id: malaDireta.id })
        }
      }

      jobGerenciarMalaDireta.last_run_at = new Date();
      await jobGerenciarMalaDireta.save()

      Logger.info(`## Finalizado job de gerenciamento de malas diretas as ${(new Date()).toLocaleString()}.`);
    } catch (error) {
      Logger.error('Erro no gerenciamento das malas diretas.', error);
      throw new Error(error);
    }
  }
}

module.exports = GerenciarMalaDireta;