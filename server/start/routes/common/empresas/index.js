'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */

require('./termos_uso')

const Route = use('Route')

Route.group(() => {
  //logo-empresa
  Route.post('/empresas/:empresa_id/logos', 'Common/EmpresaLogoController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)'])
 //verificar-email
  Route.post('/empresas/:empresa_id/emails', 'Security/VerificarEmailEmpresaController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Common/EmailEmpresa');
  Route.delete('/empresas/:empresa_id/emails/:email', 'Security/VerificarEmailEmpresaController.delete').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);
  Route.get('/empresas/:empresa_id/emails', 'Security/VerificarEmailEmpresaController.index').middleware(['auth:jwt'])

  //empresas
  Route.post('empresas/', 'Common/EmpresaController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas)']).validator('Empresa')
  Route.put('empresas/:id', 'Common/EmpresaController.update').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Empresa')


  //colaboradores
  Route.post('/empresas/:empresa_id/colaboradores/', 'Common/ColaboradorController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)'])
  Route.delete('/empresas/:empresa_id/colaboradores/:id', 'Common/ColaboradorController.destroy').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)'])
  Route.get('/empresas/:empresa_id/colaboradores', 'Common/ColaboradorController.index').middleware(['auth:jwt'])
  Route.get('/empresas/:empresa_id/colaboradoresbyempresas', 'Common/ColaboradorController.getbyempresas').middleware(['auth:jwt'])

  Route.get('/empresas/:empresa_id/colaboradores/:user_id/restricoes-equipes/', 'Security/RestricaoEquipeController.index').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);
  Route.delete('/empresas/:empresa_id/colaboradores/:user_id/restricoes-equipes/:equipe_id', 'Security/RestricaoEquipeController.delete').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);
  Route.post('/empresas/:empresa_id/colaboradores/:user_id/restricoes-equipes/', 'Security/RestricaoEquipeController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);
  Route.get('/empresas/:empresa_id/colaboradores/:user_id/restricoes-equipes-restricao/', 'Security/RestricaoEquipeController.indexrestricao').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);
  Route.get('/empresas/:empresa_id/colaboradores/:user_id/restricoes-equipes-permissao/', 'Security/RestricaoEquipeController.indexpermissao').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']);

  //equipes
  Route.post('/empresas/:empresa_id/equipes/', 'Common/EquipeController.store')
      .middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Common/Equipe');
  Route.put('/empresas/:empresa_id/equipes/:id', 'Common/EquipeController.update')
      .middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Common/Equipe');
  Route.delete('/empresas/:empresa_id/equipes/:id', 'Common/EquipeController.delete').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)'])
  Route.get('/empresas/:empresa_id/equipes', 'Common/EquipeController.index').middleware(['auth:jwt']);
  Route.get('/empresas/:empresa_id/equipes/:id', 'Common/EquipeController.show').middleware(['auth:jwt',])

  //membros das equipes
  Route.post('/empresas/:empresa_id/equipes/:equipe_id/membros', 'Common/MembroEquipeController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Common/MembroEquipe');
  Route.put('/empresas/:empresa_id/equipes/:equipes_id/membros/:id', 'Common/MembroEquipeController.update').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)']).validator('Common/MembroEquipe');
  Route.delete('/empresas/:empresa_id/equipes/:equipe_id/membros/:id', 'Common/MembroEquipeController.delete').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-empresas or gerenciar-minha-empresa)'])

  Route.get('/validacaojobs', 'Common/EmpresaController.validarJobsEmDia').middleware(['auth:jwt',])

}).prefix('/api/common').middleware(['gerenciarEmpresa'])

