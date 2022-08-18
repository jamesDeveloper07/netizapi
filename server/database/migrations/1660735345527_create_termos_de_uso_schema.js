'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')
const Permission = use('Adonis/Acl/Permission')
const Menu = use('App/Models/Security/Menu')
const Role = use('Adonis/Acl/Role')

class CreateTermosDeUsoSchema extends Schema {
  async up() {
    //POLITICAS PRIVACIDADE
    this.withSchema('common').create('termos_uso', (table) => {
      table.increments()
      table.string('nome').notNullable()
      table.text('descricao')
      table.string('versao').notNullable()
      table.text('link_url').notNullable()

      table.timestamp('data_inicio_vigencia').notNullable()
      table.timestamp('data_fim_vigencia')

      table.integer('user_id').notNullable().unsigned().references('id').inTable('security.users')
      .comment('Usuário criador dos termos de uso.')

      table.timestamp('created_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.fn.now()).notNullable()
      table.timestamp('deleted_at')
    })

    //EMPRESAS - adiciona coluna termos_uso_id
    this.withSchema('common').table('empresas', (table) => {
      // alter table
      table.integer('termos_uso_id').unsigned().references('id').inTable('common.termos_uso')
      .comment('Últimos Termos de Uso aceito.')
    })

    //HISTORIO TERNOS USO
    this.withSchema('common').create('historicos_termos_uso', (table) => {
      table.increments()
      table.integer('termos_uso_id').notNullable().unsigned().references('id').inTable('common.termos_uso')
      table.integer('empresa_id').notNullable().unsigned().references('id').inTable('common.empresas')
      table.integer('user_id').notNullable().unsigned().references('id').inTable('security.users')
      .comment('Usuário Assinante dos Termos de Uso.')
      table.timestamp('dt_assinatura').notNullable().defaultTo(this.fn.now()).notNullable()
      table.unique(['termos_uso_id', 'empresa_id'])
    })


    const trx = await Database.beginTransaction();
    try {
      const parentMenu = await Menu.findBy({ alias: 'administracao_parent' }, trx)

      const administrador = await Role.findBy({ slug: 'administrador' }, trx)

      const permissionTermosUso = await Permission.findOrCreate({ slug: 'gerenciar-termos-uso' }, {
        slug: 'gerenciar-termos-uso',
        name: 'Gerenciar Termos de Uso',
        description: 'Concede acesso a gestão de Termos de Uso do sistema.'
      }, trx)


      const menuPoliticas = await Menu.findOrCreate({
        alias: 'termos_uso'
      }, {
        hidden: false,
        parent_menu_id: parentMenu.id,
        path: '/termos-uso',
        nome: 'Termos de Uso',
        alias: 'termos_uso',
        is_ativo: true,
        icon: 'fas fa-file-signature',
      }, trx);

      const menuNovosTermos = await Menu.findOrCreate({
        alias: 'novos_termos_uso'
      }, {
        hidden: true,
        parent_menu_id: null,
        path: '/termos-uso/new',
        nome: 'Novos Termos de Uso',
        alias: 'novos_termos_uso',
        is_ativo: true,
        icon: null,
      }, trx);

      const menuAlterarTermos = await Menu.findOrCreate({
        alias: 'alterar_termos_uso'
      }, {
        hidden: true,
        parent_menu_id: null,
        path: '/termos-uso/:id/edit',
        nome: 'Alterar Termos de Uso',
        alias: 'alterar_termos_uso',
        is_ativo: true,
        icon: null,
      }, trx);

      await trx.commit();

      await administrador.permissions().attach([
        permissionTermosUso.id
      ], trx);

      await menuPoliticas.roles().attach([
        administrador.id
      ], trx);

      await menuNovosTermos.roles().attach([
        administrador.id
      ], trx);

      await menuAlterarTermos.roles().attach([
        administrador.id
      ], trx);

    } catch (error) {
      await trx.rollback()
      throw error
    }

  }

  async down() {

    this.withSchema('common').table('empresas', (table) => {
      table.dropColumn('termos_uso_id');
    })

    this.withSchema('common').drop('historicos_termos_uso')
    this.withSchema('common').drop('termos_uso')

    await Permission
      .query()
      .where({ slug: 'gerenciar-termos-uso' })
      .delete()

    await Menu
      .query()
      .where({ alias: 'termos_uso' })
      .delete()

    await Menu
      .query()
      .where({ alias: 'novos_termos_uso' })
      .delete()

    await Menu
      .query()
      .where({ alias: 'alterar_termos_uso' })
      .delete()

  }
}

module.exports = CreateTermosDeUsoSchema
