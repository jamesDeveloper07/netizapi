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

  //usado pela watch para nos enviar o code que será trocado por um access_token (homolog)
  Route.post('/tokengeneration', 'Watch/WatchController.tokenGenerationHomologacao');
  //usado pela watch para nos enviar o code que será trocado por um access_token (production)
  Route.post('/productiontokengeneration', 'Watch/WatchController.tokenGenerationProducao');

  //provavelmente serão removidos após os testes
  Route.get('/getaccesstoken', 'Watch/WatchController.getAccessToken');
  Route.get('/getaccesstokenteste', 'Watch/WatchController.getAccessTokenTeste');

  //endpoints
  Route.get('/v1/buscarpacote', 'Watch/WatchController.buscarPacote').middleware(['auth:jwt']);
  Route.get('/v1/buscarticket', 'Watch/WatchController.buscarTicketV1').middleware(['auth:jwt']);
  Route.get('/v2/buscarticket', 'Watch/WatchController.buscarTicketV2').middleware(['auth:jwt']);

  Route.post('/v2/inserirticket', 'Watch/WatchController.inserirTicket').middleware(['auth:jwt']);
  Route.post('/v2/atualizartelefone', 'Watch/WatchController.atualizarTelefone').middleware(['auth:jwt']);
  Route.post('/v1/reenviaremailativacao', 'Watch/WatchController.reenviarEmailAtivacao').middleware(['auth:jwt']);

  Route.post('/v1/atualizarstatus', 'Watch/WatchController.atualizarStatus').middleware(['auth:jwt']);
  Route.post('/v1/deletarticket', 'Watch/WatchController.deletarTicket').middleware(['auth:jwt']);

  Route.post('/v2/inserirticketnew', 'Watch/WatchController.inserirTicketNew').middleware(['auth:jwt']);

}).prefix('/api/watch');
