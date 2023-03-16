const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
    require('../app/Validators/SanitizeRules/maskCpfCnpj');

    const Bull = use('Rocketseat/Bull')
    /* execulta os jobs que rodam periodicamente */

    // const GerenciarMalaDiretaJob = use('App/Jobs/GerenciarMalaDireta')
    // const GerenciarEsteiraJob = use('App/Jobs/GerenciarEsteiras')
    // const FacebookLeadsJob = use('App/Jobs/LoadFacebookLeads')
    const SendNotificacoesJob = use('App/Jobs/SendNotificacoes')
    const GerenciarNotificacoesParametrizadasJob = use('App/Jobs/GerenciarNotificacoesParametrizadas')
    // const SendEmailsAvulsosJob = use('App/Jobs/SendEmailsAvulsos')

    // Bull.add(FacebookLeadsJob.key, {}, {
    //     delay: 0,
    //     repeat: {
    //         cron: "0 */1 * * * *"
    //     }
    // })

    // Bull.add(GerenciarMalaDiretaJob.key, {}, {
    //     delay: 0,
    //     repeat: {
    //         cron: "0 */1 * * * *"
    //     }
    // })

    // Bull.add(GerenciarEsteiraJob.key, {}, {
    //     delay: 0,
    //     repeat: {
    //         cron: "0 */3 * * * *"
    //     }
    // })

    Bull.add(SendNotificacoesJob.key, {}, {
        delay: 0,
        repeat: {
            cron: "0 */1 * * * *"
        }
    })

    Bull.add(GerenciarNotificacoesParametrizadasJob.key, {}, {
        delay: 0,
        repeat: {
            cron: "0 */5 * * * *"
        }
    })

    // Bull.add(SendEmailsAvulsosJob.key, {}, {
    //     delay: 0,
    //     repeat: {
    //         cron: "0 */1 * * * *"
    //     }
    // })



})
