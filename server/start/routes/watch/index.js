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
    return { greeting: 'Hello world in JSON - NETIZAPI - WATCH BRASIL' }
  })

  Route.post('/tokengeneration', 'Watch/WatchController.tokenGeneration');
  Route.post('/teste', 'Watch/WatchController.teste');
  Route.get('/getaccesstoken', 'Watch/WatchController.getAccessToken');
  Route.get('/getaccesstokenteste', 'Watch/WatchController.getAccessTokenTeste');

  Route.get('/buscarpacote', 'Watch/WatchController.buscarPacote').middleware(['auth:jwt']);



}).prefix('/api/watch');
