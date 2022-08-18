'use strict'

const User = use('App/Models/Security/User')

const Parametro = use('App/Models/Common/Parametro')

class MinhaEmpresaController {

    //Retornar as empresas do usuario logado
    async index({ auth }) {
        try {
            let user = await auth.getUser();

            var chave = 'link_video_inicial';
            var parametroLink = await Parametro.findBy({ chave })

            chave = 'flag_mostrar_video_inicial'
            var parametroFlag = await Parametro.findBy({ chave })

            const empresas = await user
                .empresas()
                .whereNull('deleted_at')
                .orderBy('nome', 'ASC')
                .fetch();

            for (const empresa of empresas.rows) {
                if (parametroLink) {
                    empresa.$attributes.link_video_inicial = parametroLink.valor
                }
                if (parametroFlag) {
                    empresa.$attributes.flag_mostrar_video_inicial = parametroFlag.valor
                }
            }

            return await empresas
        } catch (error) {
            console.log(error)
        }

    }
}

module.exports = MinhaEmpresaController
