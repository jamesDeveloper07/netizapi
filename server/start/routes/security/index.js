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

  //empresas
  Route.get('/sessions/empresas', 'Security/MinhaEmpresaController.index').middleware(['auth:jwt']);
  //Menus
  Route.get('/sessions/menus', 'Security/MeuMenuController.index').middleware(['auth:jwt']);
  //User-avatar
  Route.post('/sessions/me/avatars', 'Security/UserAvatarController.store').middleware(['auth:jwt']);

}).prefix('/api/security');
