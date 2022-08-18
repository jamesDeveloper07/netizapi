'use strict'

const Empresa = use('App/Models/Common/Empresa');
const Database = use('Database');
const RoleAndPermission = use('App/Utils/RoleAndPermission');
const Role = use('Adonis/Acl/Role')

class EmpresaController {

  async index({ response, request, auth }) {
    const { page,
      limit,
      sortField,
      sortOrder,
      paginate
    } = request.only(['page',
      'limit',
      'sortField',
      'sortOrder',
      'paginate'
    ])

    const query = Empresa
      .query()
      .search(request.all())
      .whereNull('deleted_at')
      .orderBy(sortField ? sortField : 'nome', sortOrder ? sortOrder : 'asc')
    if (paginate != null && paginate == 'false') {
      return query.fetch()
    } else {
      return query.paginate((page && page >= 1) ? page : 1, limit ? limit : 10)
    }
  }

  async show({ params }) {
    const { id } = params
    const empresa = await Empresa
      .query()
      .where({ id })
      .first()
    return empresa
  }

  async store({ request, response, auth }) {
    //Função de criação de empresa pelo Playnee (internamente)
    const trx = await Database.beginTransaction();
    try {

      const data = request.only(['nome', 'cnpj', 'site', 'observacoes'])
      let empresa = await Empresa.create(data, trx)

      const user = await auth.getUser()
      const administrador = await Role.findBy({ slug: 'administrador' })

      //insere usuário criador como colaborador da empresa, como cortesia
      await trx.raw(`INSERT INTO security.users_empresas
        (user_id, empresa_id)
    SELECT ${user.id}, ${empresa.id}, true
    WHERE
        NOT EXISTS (
            SELECT id FROM security.users_empresas
            WHERE user_id = ${user.id}
            AND empresa_id = ${empresa.id}
        );`)

      //Concede perfil de administrador ao usuário criador
      await trx.raw(`INSERT INTO security.roles_users_empresas
        (role_id, user_id, empresa_id)
    SELECT ${administrador.id}, ${user.id}, ${empresa.id}
    WHERE
        NOT EXISTS (
            SELECT id FROM security.roles_users_empresas
            WHERE role_id = ${administrador.id}
            AND user_id = ${user.id}
            AND empresa_id = ${empresa.id}
        );`)

      //Cria os canais da empresa
      const destinos = await Destino.all(trx)
      for (let destino of destinos.rows) {
        await empresa
          .destinosEmpresas()
          .create({
            destino_id: destino.id
          }, trx)
      }

      await trx.commit()

      empresa = await Empresa
        .query()
        .where({ id: empresa.id })
        .first()
      return empresa

    } catch (error) {
      await trx.rollback()
      console.error(error)
      return response.status(400).send(error)
    }


  }

  async update({ request, params, auth, response }) {
    try {
      const { id } = params
      const data = request.only(['nome', 'cnpj', 'site', 'observacoes'])
      const empresa = await Empresa.findOrFail(id)

      empresa.merge(data)
      console.log({ data })

      console.log({ empresa })
      await empresa.save()
      return empresa
    } catch (error) {
      console.error(error)
      return response.status(400).send(error)
    }
  }

  async validarJobsEmDia({ response, request, auth }) {
    try {
      const user = await auth.getUser()
      let header = request.headers()
      let empresa_id = header.empresa_id

      let expression = '(administrador)'
      const is = await RoleAndPermission.validarRoles(user.id, empresa_id, expression)

      if (!is) {
        return response.status(200).send([{
          message: 'Validação de JOBS. Usuário sem permissão.',
          validacao: [],
          alerta: false
        }])
      } else {
        const validacao = await Database.raw(`
                --SELECT string_agg(job_key, ', ') as jobs, isAlert
                SELECT job_key, last_run_at, isAlert
            from(
            SELECT alertaJobs.id, alertaJobs.job_key, last_run_at, next_run , (next_run < now()) as isAtrasado, (time_alert < now()) as isAlert
            from
            (SELECT id, job_key, situacao, periodo_intervalo_execucao, periodo_alerta, last_run_at,
            (last_run_at + (periodo_intervalo_execucao * interval '1 second')) as next_run,
            (last_run_at + (periodo_intervalo_execucao * interval '1 second') + (periodo_alerta * interval '1 second') ) as time_alert
            FROM common.jobs
            where periodo_alerta > 0
            and last_run_at is not null
            and situacao = 'A') as alertajobs
            order by id ) as jobsatrasados
            where isAlert is true
            --group by isAlert `)

        if (validacao && validacao.rows.length > 0) {
          //console.log(validacao.rows);
          return response.status(200).send([{
            message: 'Validação de JOBS',
            validacao: validacao.rows,
            alerta: validacao.rows[0].isalert
          }])
        } else {
          return response.status(200).send([{
            message: 'Validação de JOBS',
            validacao: [],
            alerta: false
          }])
        }

      }

    } catch (error) {
      console.error(error);
      return response.status(400).send([{
        message: 'Validação de JOBS. Erro na Validação',
        validacao: [],
        alerta: false
      }])
    }
  }

}

module.exports = EmpresaController
