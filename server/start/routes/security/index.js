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
const Route = use('Route');
require('./notificacoes')
require('./perfis')

Route.group(() => {
  Route.post('/register', 'AuthController.register');
  Route.post('/authenticate', 'AuthController.authenticate');
  Route.delete('/revoke', 'AuthController.revoke').middleware(['auth:jwt']);

   //perfis
   Route.get('/perfis/', 'Security/PerfilController.index').middleware(['auth:jwt', 'roleUserEmpresa:(administrador or administrador_empresa)']);
   Route.get('/perfis/:id', 'Security/PerfilController.show').middleware(['auth:jwt', 'roleUserEmpresa:(administrador or administrador_empresa)']);
   Route.post('/perfis/', 'Security/PerfilController.store').middleware(['auth:jwt', 'roleUserEmpresa:administrador']).validator('Perfil');
   Route.put('/perfis/:id', 'Security/PerfilController.update').middleware(['auth:jwt', 'roleUserEmpresa:administrador']).validator('Perfil');
   Route.delete('/perfis/:id', 'Security/PerfilController.delete').middleware(['auth:jwt', 'roleUserEmpresa:administrador']);

   //Devices para notificação
   Route.get('/devices', 'Security/DeviceController.index').middleware(['auth:jwt']);
   Route.post('/devices', 'Security/DeviceController.store').middleware(['auth:jwt']);
   Route.get('/devices/getById/:id', 'Security/DeviceController.show').middleware(['auth:jwt']);
   Route.delete('/devices/:id', 'Security/DeviceController.delete').middleware(['auth:jwt']);
   Route.get('/usuarios/:user_id/devices', 'Security/DeviceController.getByUsuario').middleware(['auth:jwt']);
   Route.get('/devices/getByToken', 'Security/DeviceController.getByToken').middleware(['auth:jwt']);

   //perfis do usuário
   Route.get('/usuarios/:user_id/perfis', 'Security/PerfilUsuarioController.index').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.delete('/usuarios/:user_id/perfis/:id', 'Security/PerfilUsuarioController.destroy').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.post('/usuarios/:user_id/perfis', 'Security/PerfilUsuarioController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);

   //perfis do usuário na empresas
   Route.get('/usuarios/:user_id/empresas/:empresa_id/perfis', 'Security/PerfilUsuarioEmpresaController.index').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-meus-usuarios)']);
   Route.delete('/usuarios/:user_id/empresas/:empresa_id/perfis/:id', 'Security/PerfilUsuarioEmpresaController.destroy').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-meus-usuarios)']);
   Route.post('/usuarios/:user_id/empresas/:empresa_id/perfis', 'Security/PerfilUsuarioEmpresaController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-meus-usuarios)']);

   //empresas do usuario
   Route.get('/usuarios/:user_id/empresas', 'Security/EmpresaUsuarioController.index').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.delete('/usuarios/:user_id/empresas/:id', 'Security/EmpresaUsuarioController.destroy').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.post('/usuarios/:user_id/empresas', 'Security/EmpresaUsuarioController.store').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   //users
   Route.put('/sessions', 'Security/UserController.updateMe').middleware(['auth:jwt']).validator('UpdateMe');
   Route.get('/usuarios', 'Security/UserController.index').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.get('/usuarios/:id', 'Security/UserController.show').middleware(['auth:jwt', 'permissionRoleUserEmpresa:gerenciar-usuarios']);
   Route.put('/usuarios/:id', 'Security/UserController.update').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-meus-usuarios)']).validator('UpdateUser');
   Route.post('/usuarios', 'Security/UserController.create').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-meus-usuarios)']).validator('StoreUser');
   Route.post('/usuariobyemail', 'Security/UserController.findByEmail').middleware(['auth:jwt', 'permissionRoleUserEmpresa:(gerenciar-usuarios or gerenciar-empresas or gerenciar-minha-empresa)']);


  //empresas
  Route.get('/sessions/empresas', 'Security/MinhaEmpresaController.index').middleware(['auth:jwt']);
  //Menus
  Route.get('/sessions/menus', 'Security/MeuMenuController.index').middleware(['auth:jwt']);
  //User-avatar
  Route.post('/sessions/me/avatars', 'Security/UserAvatarController.store').middleware(['auth:jwt']);

}).prefix('/api/security');
