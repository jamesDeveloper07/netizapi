'use strict'

// const Oportunidade = use('App/Models/Marketing/Oportunidade')
const Parametro = use('App/Models/Common/Parametro')
const moment = require('moment')
moment.locale('pt-br')
const Database = use('Database')

class InformativoAppNetizController {

  async index({ request, params }) {
    const { empresa_id } = params
    let { colaborador, } = request.all()
    let { mes, ano } = request.all()

    const hoje = moment()
    const ontem = moment().subtract(1, 'day')
    // const estagioVenda = await Parametro.findBy({ chave: 'estagio-venda' })
    const tempoParaNovaOportunidade = 30

    console.log('HOJE')
    console.log(hoje.format('YYYY-MM-DD'))
    console.log('ONTEM')
    console.log(ontem.format('YYYY-MM-DD'))

    const periodo = moment(`${mes}-${ano}`, 'MM-YYYY')
    const inicioPeriodo = periodo.startOf('month').format('YYYY-MM-DD');
    const fimPeriodo = periodo.endOf('month').format('YYYY-MM-DD');

    const inicioPeriodoConversaoMalaDireta = moment(`${mes}-${ano}`, 'MM-YYYY').subtract(1, 'months').startOf('month').format('YYYY-MM-DD');

    const selectTotalClientes = await Database
    .connection('pgvoalle')
    .raw(`select count(distinct(client_id)) FROM erp.contracts cont where cont.deleted is false and cont.status not in (4,9)`)
  const totalClientes = selectTotalClientes.rows[0].count;
  Database.close(['pgvoalle']);

    const selectTotalUsuarios = await Database
      .connection('pgappnetiz')
      .raw(`SELECT count("Id") FROM public."AspNetUsers"`)
    const totalUsuarios = selectTotalUsuarios.rows[0].count;

    const selectUsuariosCriadosPeriodo = await Database
      .connection('pgappnetiz')
      .raw(`SELECT count("Id") FROM public."AspNetUsers"
     where date("Created" AT TIME ZONE 'BRA') BETWEEN '${inicioPeriodo}' AND '${fimPeriodo}'`)
    const usuariosCriadosPeriodo = selectUsuariosCriadosPeriodo.rows[0].count;

    const selectUsuariosCriadosHoje = await Database
      .connection('pgappnetiz')
      .raw(`SELECT count("Id") FROM public."AspNetUsers"
     where date("Created" AT TIME ZONE 'BRA') = '${hoje.format('YYYY-MM-DD')}'`)
    const usuariosCriadosHoje = selectUsuariosCriadosHoje.rows[0].count;

    const selectUsuariosCriadosOntem = await Database
      .connection('pgappnetiz')
      .raw(`SELECT count("Id") FROM public."AspNetUsers"
     where date("Created" AT TIME ZONE 'BRA') = '${ontem.format('YYYY-MM-DD')}'`)
    const usuariosCriadosOntem = selectUsuariosCriadosOntem.rows[0].count;

    // later close the connection
    Database.close(['pgappnetiz']);

    return [
      {
        nome: 'Usuários',
        descricao: 'Total de usuários no app',
        icon: 'fas fa-mobile-alt',
        background: 'card-stats',
        count: totalUsuarios,
      },
      {
        nome: 'Neste mês',
        descricao: `Usuários criados em ${this.capitalize(periodo.format('MMMM'))}`,
        icon: 'far fa-calendar-alt',
        background: 'card-stats',
        count: usuariosCriadosPeriodo,
      },
      {
        nome: `Hoje`,
        icon: 'far fa-calendar-times',
        background: 'card-stats',
        descricao: `Usuários criados hoje`,
        count: usuariosCriadosHoje,
      },
      {
        nome: `Ontem`,
        icon: 'far fa-calendar-times',
        background: 'card-stats',
        descricao: `Usuários criados ontem`,
        count: usuariosCriadosOntem,
      },
      {
        nome: `Clientes`,
        icon: 'fa fa-users',
        background: 'card-stats',
        descricao: `Total de clientes ativos`,
        count: totalClientes,
      },
      {
        nome: `Percentual`,
        icon: 'fa fa-percent',
        background: 'card-stats',
        descricao: `Percentual de clientes no app `,
        count: ((totalUsuarios*100)/totalClientes).toFixed(2) + '%',
      },
    ]
  }

  capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}

module.exports = InformativoAppNetizController
