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
    return { greeting: 'Hello world in JSON - NETIZAPI - VOALLE DB' }
  })

  Route.get('/getcontratos/:client_id', 'Voalle/VoalleController.getContratosByClientId');
  Route.get('/getservicosbycontrato/:contract_id', 'Voalle/VoalleController.getServicesByContractId');
  Route.get('/getfaturasbycliente/:client_id', 'Voalle/VoalleController.getFaturasByClientId');
  Route.get('/getfaturasbycontrato/:contract_id', 'Voalle/VoalleController.getFaturasByContractId');
  Route.get('/getfaturabyid/:id', 'Voalle/VoalleController.getFaturaById');

  Route.get('/getstatuslist', 'Voalle/EventController.getStatusList').middleware(['auth:jwt']);
  Route.get('/getstageslist', 'Voalle/EventController.getStageList').middleware(['auth:jwt']);

  Route.get('/getcontratosbyeventos', 'Voalle/EventController.getByVarious').middleware(['auth:jwt']);
  Route.get('/processareventos', 'Voalle/EventController.processarEventos').middleware(['auth:jwt']);
  Route.get('/reexecutarintegracao', 'Voalle/EventController.reexecutarIntegracao').middleware(['auth:jwt']);
  Route.get('/executarcancelamentomanual', 'Voalle/EventController.executarCancelamentoManual').middleware(['auth:jwt']);

  Route.get('/teste2', 'Voalle/VoalleController.teste2');

}).prefix('/api/voalle');
