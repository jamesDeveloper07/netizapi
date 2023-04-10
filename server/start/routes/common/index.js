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
require('./empresas')

const Route = use('Route');

Route.group(() => {
  //Parametros
  Route.get('/parametros/:chave', 'Common/ParametroController.show').middleware(['auth:jwt',]);

}).prefix('/api/common/')

Route.group(() => {
  //cliente
  Route.get('/cliente', 'Common/ClienteController.index').middleware(['auth:jwt']);
  Route.get('/cliente/:id', 'Common/ClienteController.show').middleware(['auth:jwt']);
  Route.post('/cliente', 'Common/ClienteController.store').middleware(['auth:jwt']);

  //servico
  Route.get('/servico', 'Common/ServicoController.index').middleware(['auth:jwt']);
  Route.get('/servico/:id', 'Common/ServicoController.show').middleware(['auth:jwt']);
  Route.post('/servico', 'Common/ServicoController.store').middleware(['auth:jwt']);

  //acao
  Route.get('/acao', 'Common/AcaoController.index').middleware(['auth:jwt']);
  Route.get('/acao/:id', 'Common/AcaoController.show').middleware(['auth:jwt']);
  Route.post('/acao', 'Common/AcaoController.store').middleware(['auth:jwt']);

  //acaoServico
  Route.get('/acao_servico', 'Common/AcaoServicoController.index').middleware(['auth:jwt']);
  Route.get('/acao_servico/:id', 'Common/AcaoServicoController.show').middleware(['auth:jwt']);
  Route.post('/acao_servico', 'Common/AcaoServicoController.store').middleware(['auth:jwt']);

  Route.get('/get_acoes_by_servico', 'Common/AcaoServicoController.getByServico').middleware(['auth:jwt']);


  //Solicitação
  Route.get('/solicitacao', 'Common/SolicitacaoController.index').middleware(['auth:jwt']);
  Route.get('/solicitacao/:id', 'Common/SolicitacaoController.show').middleware(['auth:jwt']);
  Route.post('/solicitacao', 'Common/SolicitacaoController.store').middleware(['auth:jwt']);

  Route.get('/enviarSolicitacoesAtivacao', 'Common/SolicitacaoController.enviarSolicitacoesAtivacao').middleware(['auth:jwt']);
  Route.get('/enviarSolicitacoesDesativacao', 'Common/SolicitacaoController.enviarSolicitacoesDesativacao').middleware(['auth:jwt']);

  Route.get('/executarSolicitacoesPendentes', 'Common/SolicitacaoController.executarSolicitacoesPendentes').middleware(['auth:jwt']);
  Route.get('/findClienteErpByDocumento/:documento', 'Common/SolicitacaoController.findClienteErpByDocumento').middleware(['auth:jwt']);

  //LogIntegracao
  Route.get('/log_integracao', 'Common/LogIntegracaoController.index').middleware(['auth:jwt']);

  //LogEvento
  Route.get('/log_evento', 'Common/LogEventoController.index').middleware(['auth:jwt']);

}).prefix('/api/common');
