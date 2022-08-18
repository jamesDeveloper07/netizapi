'use strict'

const Logger = use('Logger')
const Mail = use('Mail')
const Env = use('Env')

class ForgotPasswordEmail {

    static get key() {
        return "ForgotPasswordEmail-key";
    }

    async handle(job) {
        try {
            const { data } = job

            if (!data.recovery_password_token) throw { message: 'Token de recuperação de senha não está presente' }

            const recovery_password_url = `${Env.get('HOST_URL')}/auth/recovery-password?token=${data.recovery_password_token}`
            data.recovery_password_url = recovery_password_url

            const emailTamplate = data.email_tamplate || 'emails/forgot_password'
            const subject = data.subject || 'Esqueceu sua senha?'
            
            await Mail.send(emailTamplate, data, (message) => {
                message.subject(subject)
                message.from('no-reply@playnee.com.br')
                message.to(data.email)
            })
        } catch (error) {
            Logger.error('Não foi possível enviar email de recuperação de senha\n', error)
        }

    }
}

module.exports = ForgotPasswordEmail;