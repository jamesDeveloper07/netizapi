'use strict'

const Logger = use('Logger')
const Mail = use('Mail')
const EmailAvulso = use('App/Models/Marketing/EmailAvulso');
const Blacklist = use('App/Models/Marketing/ContatoBlacklist')
const Env = use('Env')
const Job = use('App/Models/Common/Job');

class SendEmailMarketing {

    static get key() {
        return "SendEmailsAvulsos-key";
    }

    static get options() {
        return {
            attempts: 3,
            removeOnComplete: true,
        }
    }

    async handle(job) {
        try {

            const jobSendEmailsAvulsos = await Job.findBy({ job_key: 'SendEmailsAvulsos-key' });
            if (!jobSendEmailsAvulsos || jobSendEmailsAvulsos.situacao === 'I') {
                console.log('Job SEND EMAILS AVULSOS Inativo')
                return;
            }

            Logger.info('## Iniciando envio de emails avulsos ##')
            let sended = 0;
            let contatoBlacklist = 0;
            let percentage = 25;
            const emailsAvulsos = await EmailAvulso
                .query()
                .with('usuario')
                .with('empresa')
                .with('remetente')
                .whereRaw(`data_agendamento <= now()`)
                .whereNull('data_envio')
                .where('situacao', 'A')
                .whereNull('deleted_at')
                .fetch();

            const emails = emailsAvulsos.rows

            if (emails && emails.length > 0) {

                await Promise.all(
                    emails.map(async emailAvulso => {
                        try {

                            if (!this.validateEmail(emailAvulso.destinatario)) {
                                console.error('Erro na validação do email ' + emailAvulso.destinatario + ', Email Avulso #' + emailAvulso.id)
                                const emailUpdate = await EmailAvulso.findOrFail(emailAvulso.id);
                                emailUpdate.updated_at = new Date();
                                emailUpdate.situacao = 'I'
                                await emailUpdate.save();
                                return
                            }

                            const isBlacklisted = await Blacklist.findBy({
                                contato: emailAvulso.destinatario,
                                empresa_id: emailAvulso.empresa_id
                            });

                            if (!isBlacklisted) {

                                Logger.info('Enviando email avulso para ' + emailAvulso.destinatario + ' (#' + emailAvulso.id + ')')

                                const empresa = emailAvulso.$relations.empresa;

                                if (empresa) {
                                    //validando existência de site e logo_url da empresa
                                    empresa.site = empresa.site ? empresa.site : '#'

                                    empresa.logo_url = empresa.logo_url ? empresa.logo_url :
                                        empresa.logo ? `${Env.get('S3_SERVER')}${Env.get('S3_APP_PATH')}/empresas/${empresa.id}/logo/${empresa.logo}` : 'https://growbit-main.s3.us-east-2.amazonaws.com/apps/acelerador-vendas/logo/logo-playnee.png'
                                }

                                await Mail.send('emails/email_avulso', {
                                    content: emailAvulso.conteudo,
                                    empresa: empresa,
                                    cancelar_inscricao: `${Env.get('HOST_URL')}/api/marketing/empresas/${emailAvulso.empresa_id}/emails/${emailAvulso.destinatario}/blacklist`
                                }, (message) => {
                                    message.subject(emailAvulso.assunto);
                                    message.from(emailAvulso.$relations.remetente.email);
                                    message.to(emailAvulso.destinatario);
                                    message.replyTo(emailAvulso.$relations.remetente.email);
                                });

                                sended++;

                                const emailUpdate = await EmailAvulso.findOrFail(emailAvulso.id);
                                emailUpdate.updated_at = new Date();
                                emailUpdate.data_envio = new Date();
                                await emailUpdate.save();

                                Logger.info('Email Avulso para ' + emailAvulso.destinatario + ' (#' + emailAvulso.id + ') enviado com sucesso!')

                            } else {
                                contatoBlacklist++;
                                Logger.warning('O Email avulso ' + emailAvulso.destinatario + ', ID #' + emailAvulso.id + ', está em Blacklist.')
                                const emailUpdate = await EmailAvulso.findOrFail(emailAvulso.id);
                                emailUpdate.updated_at = new Date();
                                emailUpdate.situacao = 'I'
                                await emailUpdate.save();
                            }

                            const currentPercentage = (sended + contatoBlacklist) * 100 / emails.length;
                            if (currentPercentage >= percentage) {
                                Logger.info(`Já foram enviados ${currentPercentage}% do total de emails avulsos a serem enviados`);
                                percentage += 25;
                            }
                        } catch (error) {
                            Logger.error(`Erro ao enviar email avulso ${emailAvulso.contato} ID #${emailAvulso.id}\n`, error);

                            if (error && error.responseCode > 500) {
                                await this.addToBlacklist({
                                    contato: emailAvulso.contato,
                                    empresa_id: emailAvulso.empresa_id
                                });
                            }
                        }

                    })
                );
            } else {
                Logger.info(`## NENHUM EMAIL AVULSO A SER ENVIADO NO MOMENTO`)
            }

            Logger.info(`## Finalizado job de envio de emails avulsos as ${(new Date()).toLocaleString()}.`);
            jobSendEmailsAvulsos.last_run_at = new Date();
            await jobSendEmailsAvulsos.save()

        } catch (error) {
            Logger.error('Não foi possível enviar emails avulsos\n', error)
        }
    }

    async addToBlacklist(email) {
        try {
            const contato = email.destinatario.toLowerCase()
            console.log(contato)
            await Blacklist.findOrCreate({
                contato
            }, {
                contato,
                empresa_id: email.empresa_id,
                motivo: 'rejeitado pelo servidor'
            })
        } catch (error) {
            Logger.error('Error ao salvar contato na blacklist ', error)
        }
    }

    validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}

module.exports = SendEmailMarketing;