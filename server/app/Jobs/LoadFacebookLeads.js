
'use strict'

const bizSdk = require('facebook-nodejs-business-sdk');
const moment = require('moment')
const CanalEmpresa = use('App/Models/Common/CanalEmpresa')
const Anuncio = use('App/Models/Marketing/Anuncio')
const Publicacao = use('App/Models/Marketing/Publicacao')
const Env = use('Env')
const Logger = use('Logger')
const OportunidadeRepository = use('App/Repository/OportunidadeRepository')
const JobFace = use('App/Models/Common/Job');

class LoadFacebookLeads {

  static get key() {
    return "LoadFacebookLeads-key";
  }

  static get options() {
    return {
      attempts: 3,
      removeOnComplete: true,
    }
  }

  async handle(job) {
    const { data } = job;
    try {

      const jobFace = await JobFace.findBy({ job_key: 'LoadFacebookLeads-key' });
      if (jobFace && jobFace.situacao === 'I') {
        console.log('Job FACEBOOK LEADS Inativo')
        return;
      }

      Logger.info(`
      ### INICIANDO JOB FACEBOOK LEADS EM ${(new Date()).toLocaleString()} ###`)

      const Ad = bizSdk.Ad;
      const Lead = bizSdk.Lead;
      const appId = Env.get('FACEBOOK_APP_ID')
      const appSecret = Env.get('FACEBOOK_APP_SECRET')
      const showDebugInfo = Env.get('FACEBOOK_SHOW_DEBUG_INFO', 'false')
      const leadField = ['created_time', 'id', 'ad_id', 'form_id', 'field_data', 'campaign_name']

      if (!appId || !appSecret) throw "Você deve adicionar FACEBOOK_APP_ID e FACEBOOK_APP_SECRET no .env da aplicação."

      //Busca os canais de facebook com token
      const canaisEmpresa = await CanalEmpresa
        .query()
        .whereRaw(`empresa_id IN (SELECT distinct(emp.id)
      from common.empresas emp
      join common.canais_empresa canemp on (emp.id = canemp.empresa_id)
      join marketing.canais can on (can.id = canemp.canal_id)
      where emp.status ILIKE 'A'
      and canemp.token IS NOT NULL
      and can.nome ILIKE 'facebook ads')`)
        .whereRaw(`canal_id IN (SELECT id FROM marketing.canais WHERE nome ILIKE 'facebook ads')`)
        .fetch()

      Logger.info(`${canaisEmpresa.rows.length} canais de empresas do tipo Facebook ADS encontrados`)
      for (let canalEmpresa of canaisEmpresa.rows) {
        //canalEmpresa = await CanalEmpresa.findBy({ token: canalEmpresa.token })
        const empresa = await canalEmpresa.empresa().first()
        //Busca os anuncios que possuem id de rede social
        const anuncios = await Anuncio
          .query()
          //Alterado para passar a pegar por Publicação e não por Anúncio
          //.whereRaw(`(now() BETWEEN dt_inicio AND dt_fim ) AND situacao LIKE 'ativo' AND rede_social_id IS NOT NULL AND campanha_id IN (SELECT id FROM marketing.campanhas WHERE empresa_id = ${empresa.id})`)
          .whereRaw(`(now() BETWEEN dt_inicio AND dt_fim) AND situacao LIKE 'ativo' AND canal_id = ${canalEmpresa.canal_id} AND campanha_id IN (SELECT id FROM marketing.campanhas WHERE empresa_id = ${empresa.id} AND (now() BETWEEN dt_inicio AND dt_fim) AND situacao LIKE 'ativo')`)
          .fetch()

        Logger.info(`${anuncios.rows.length} anuncios de facebook ads encontrados para empresa ${empresa.nome}`)
        for (let anuncio of anuncios.rows) {

          const publicacoes = await Publicacao.query()
            .whereRaw(`anuncio_id = ${anuncio.id} and rede_social_id IS NOT NULL and fase_atual_id >=7`)
            .fetch()
          //implementar uma flag que informe se a publicação está ativa como anúncio ou não,
          //e usá-la para filtrar as publicações a serem consultadas
          try {
            const canal = await anuncio.canal().first()
            if (publicacoes.rows.length > 0) {
              Logger.info(`>>> ${publicacoes.rows.length} publicações de facebook ads encontradas para o anúncio ${anuncio.id} || ${anuncio.nome}`)
            }
            for (let publicacao of publicacoes.rows) {

              try {
                //Inicia o sdk do facebook
                const api = await bizSdk.FacebookAdsApi.init(canalEmpresa.token);
                api.setDebug(showDebugInfo == 'true')
                const facebookLeads = await (new Ad(publicacao.rede_social_id)).getLeads(
                  leadField,
                  {
                    limit: 10000
                  }
                );
                let ultimaAtualizacao = publicacao.data_ultima_atualizacao_leads
                for (let lead of facebookLeads) {

                  if (ultimaAtualizacao && moment(lead.created_time).isBefore(moment(ultimaAtualizacao))) {
                    //caso a data do lead esteja antes da data da ultima atualização, para tudo, porque o resto já foi adicionado
                    break
                  }

                  const leadAllReadyInsert = await empresa
                    .oportunidades()
                    .where({ referencia_externa_id: lead.id + '' })
                    .first()
                  //Verifica que o lead já foi inserido anteriormente
                  if (leadAllReadyInsert) continue

                  const field_data = await lead.field_data
                  const cliente = {
                    ...this.bindCliente({ fields: field_data, lead }),
                    empresa_id: empresa.id
                  }
                  const oportunidade = {
                    ...this.bindOportunidades({ fields: field_data, lead, canal, anuncio }),
                    empresa_id: empresa.id,
                    anuncio_id: anuncio.id,
                    //add publicacao_id na tabela Oportunidades
                    publicacao_id: publicacao.id,
                    funil_id: anuncio.funil_padrao_id ? anuncio.funil_padrao_id : null
                  }

                  let produtos = await anuncio
                    .produtos()
                    .where({ situacao: 'A' })
                    .fetch()
                  produtos = produtos.rows.map(item => ({ id: item.id, preco: item.preco }))

                  const telefone = this.bindTelefone({ fields: field_data })
                  const telefones = []
                  if (telefone) telefones.push(telefone)

                  await OportunidadeRepository.store({
                    oportunidade,
                    cliente,
                    produtos,
                    telefones,
                    empresa_id: empresa.id,
                  })

                }

                var dateNow = new Date()

                publicacao.data_ultima_atualizacao_leads = dateNow
                await publicacao.save()

                anuncio.data_ultima_atualizacao_leads = dateNow
                await anuncio.save()

              } catch (error) {
                Logger.warning(`Erro ao inserir oportunidade de facebook ads da Publicação ${publicacao.nome} - ID: ${publicacao.id}\n`, error)
              }

            }

          } catch (error) {
            Logger.warning(`Erro ao inserir oportunidade de facebook ads do anuncio ${anuncio.nome} id ${anuncio.id}\n`, error)
          }
        }
      }

      jobFace.last_run_at = new Date();
      await jobFace.save()

      Logger.info(`Job de carregamento de leads de facebook ads finalizado em ${(new Date()).toLocaleString()}`)
    } catch (error) {
      Logger.error('Erro no job de LoadFacebookLeads\n', error)
    }
    return 'ok'
  }

  getNameFieldsName() {
    return ['full_name', 'nome_completo', 'primeiro_nome', 'first_name', 'Nome Completo', 'name', 'nome', 'Nome']
  }

  getPhoneFieldsName() {
    return ['phone_number', 'telefone', 'WhatsApp', 'número_de_telefone', 'numero_de_telefone', 'celular', 'Celular']
  }

  bindTelefone({ fields, }) {
    const telefone = this.findLeadValue({ fieldsName: this.getPhoneFieldsName(), fields })
    return this.formartTelefone(telefone)
  }

  getEmailFieldsName() {
    return ['email', 'Email', 'e-mail', 'E-mail']
  }

  getCidadeFieldsName() {
    return ['city', 'City', 'cidade', 'Cidade']
  }

  getRuaFieldsName() {
    return ['rua', 'Rua', 'street_address', 'Street_address']
  }

  getCEPFieldsName() {
    return ['cep', 'Cep', 'CEP', 'post_code']
  }

  getProfissaoFieldsName() {
    return ['profissao', 'Profissao', 'profissão', 'Profissão', 'job_title']
  }

  getTipoPessoaFieldsName() {
    return ['tipo_pessoa', 'tipo pessoa', 'Tipo Pessoa']
  }

  getSexoPessoaFieldsName() {
    return ['sexo', 'Sexo']
  }

  getCpfCnpjFieldsName() {
    return ['cpf_cnpj', 'cpf', 'Cpf', 'CPF', 'cnpj', 'Cnpj', 'CNPJ']
  }


  getArrayFieldsCatalogados() {
    return ['phone_number', 'telefone', 'WhatsApp', 'número_de_telefone', 'numero_de_telefone', 'celular', 'Celular',
      'full_name', 'nome_completo', 'primeiro_nome', 'first_name', 'Nome Completo', 'name', 'nome', 'Nome',
      'email', 'Email', 'e-mail', 'E-mail',
      'city', 'City', 'cidade', 'Cidade',
      'rua', 'Rua', 'street_address', 'Street_address',
      'cep', 'Cep', 'CEP', 'post_code',
      'profissao', 'Profissao', 'profissão', 'Profissão', 'job_title',
      'tipo_pessoa', 'tipo pessoa', 'Tipo Pessoa',
      'sexo', 'Sexo',
      'cpf_cnpj', 'cpf', 'Cpf', 'CPF', 'cnpj', 'Cnpj', 'CNPJ']
  }

  bindOportunidades({ fields, lead, canal }) {
    const nome = this.findLeadValue({ fieldsName: this.getNameFieldsName(), fields })
    const telefone = this.findLeadValue({ fieldsName: this.getPhoneFieldsName(), fields })
    const email = this.findLeadValue({ fieldsName: this.getEmailFieldsName(), fields })
    const cidade = this.findLeadValue({ fieldsName: this.getCidadeFieldsName(), fields })
    const rua = this.findLeadValue({ fieldsName: this.getRuaFieldsName(), fields })
    const cep = this.findLeadValue({ fieldsName: this.getCEPFieldsName(), fields })
    const profissao = this.findLeadValue({ fieldsName: this.getProfissaoFieldsName(), fields })

    const extras = this.findLeadValuesExtras(fields);

    let descricao = `Essa oportunidade foi encontrada a partir do processo de captação de leads do ${canal.nome}:<br><br>`
    if (nome) descricao += `Nome: ${nome}<br>`
    if (telefone) descricao += `Telefone: ${telefone}<br>`
    if (email) descricao += `Email: ${email}<br>`
    if (profissao) descricao += `Profissão: ${profissao}`
    if (cidade) descricao += `Cidade: ${cidade}<br>`
    if (rua) descricao += `Logradouro: ${rua}<br>`
    if (cep) descricao += `CEP: ${cep}<br>`

    if (extras) descricao += `<br>Extras: ${extras}<br>`

    return {
      data_agendamento: new Date(),
      data_origem: lead.created_time,
      referencia_externa_id: lead.id,
      descricao,
    }
  }

  formartTelefone(telefone) {
    if (!telefone) return
    try {
      const newPhone = telefone.replace('+55', '')
      const ddd = parseInt(newPhone.substring(0, 2))
      const numero = parseInt(newPhone.substring(2, newPhone.length))
      return { ddd, numero }
    } catch (error) {
      Logger.warning('Erro ao formatar número de telefone\n', error)
    }
  }


  bindCliente({ fields }) {
    let tipo_pessoa = this.findLeadValue({ fieldsName: this.getTipoPessoaFieldsName(), fields })
    tipo_pessoa = (tipo_pessoa && tipo_pessoa.length > 1) ? tipo_pessoa[0] : tipo_pessoa

    let sexo = this.findLeadValue({ fieldsName: this.getSexoPessoaFieldsName(), fields })
    sexo = (sexo && sexo.length > 1) ? sexo[0] : tipo_pessoa
    return {
      nome: this.findLeadValue({ fieldsName: this.getNameFieldsName(), fields }),
      cpf_cnpj: this.findLeadValue({ fieldsName: this.getCpfCnpjFieldsName(), fields }),
      tipo_pessoa: tipo_pessoa ? tipo_pessoa : 'F',
      sexo,
      email: this.findLeadValue({ fieldsName: this.getEmailFieldsName(), fields })
    }
  }

  //como pode haver mais de um nome para representar um campo
  //fieldsName é um array com nome de fields possiveis 
  findLeadValue({ fieldsName, fields }) {
    if (!Array.isArray(fields)) return
    for (let name of fieldsName) {
      for (let data of fields) {
        if (data.name == name) {
          const values = data.values
          if (values && values.length > 0) {
            return values[0]
          } else {
            return null
          }
        }
      }
    }
    return null
  }


  findLeadValuesExtras(fields) {
    var camposExtras = '';
    var fieldsCatalogados = this.getArrayFieldsCatalogados();
    if (!Array.isArray(fields)) return null

    for (let data of fields) {
      let x = fieldsCatalogados.indexOf(data.name);
      if (x < 0) {
        const values = data.values
        if (values && values.length > 0) {
          camposExtras += `${data.name}: ${data.values[0]}<br>`
        } else {
          camposExtras += `${data.name}: <br>`
        }
      }
    }

    return camposExtras
  }

}

module.exports = LoadFacebookLeads;