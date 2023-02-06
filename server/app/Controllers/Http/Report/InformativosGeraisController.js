'use strict'

// const Campanha = use('App/Models/Marketing/Campanha')
const Empresa = use('App/Models/Common/Empresa')
const moment = require('moment')
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const Database = use('Database')

class InformativosGeraisController {

    async index({ params, auth, request }) {
        const { empresa_id } = params
        const user = await auth.getUser()
        const empresa = await Empresa.findOrFail(empresa_id)

        const inicioPeriodo = moment().startOf('month').format('YYYY-MM-DD');
        const fimPeriodo = moment().endOf('month').format('YYYY-MM-DD');

        const informativos = []

        let permissionsExpression = '(ver-dashboard-gestao)'
        let validPermissions = await RoleAndPermission.validarPermissions(user.id, empresa_id, permissionsExpression)
        if (validPermissions) {

          const select = await Database
          .connection('pgappnetiz')
          .raw(`SELECT count("Id") FROM public."AspNetUsers"`)

          // later close the connection
          Database.close(['pgappnetiz']);

          const usuariosApp = select.rows[0].count;

          informativos.push({
              nome: `O App Netiz possui ${usuariosApp} usuários cadastrados neste momento`,
              link: '/admin/dashboard/app-netiz',
              valor: 'Atualizar'
          })
        }
        return informativos

    }
}

module.exports = InformativosGeraisController
