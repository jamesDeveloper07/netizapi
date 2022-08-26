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

Route.group(() => {

  Route.get('/', () => {
    return { greeting: 'Hello world in JSON - NETIZAPI' }
  })

  Route.get('/validarhorario/:tipo', 'Api/V1/ApiController.validarHorario').middleware(['auth:jwt']);
  Route.get('/verificarsinistro', 'Api/V1/ApiController.verificarSinistro');
  Route.get('/validardocumento', 'Api/V1/ApiController.validarDocumento').middleware(['auth:jwt']);

}).prefix('/api');
