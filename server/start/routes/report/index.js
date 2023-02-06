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

const Route = use('Route')

Route.group(() => {

  Route.get('/dashteste', () => {
    return { greeting: 'Hello world in JSON - NETIZAPI - DASHBOARD' }
  })
    Route.get('/informativos-oportunidades/', 'InformativoAppNetizController.index').middleware(['auth:jwt',])
    Route.get('/informativos/', 'InformativosGeraisController.index').middleware(['auth:jwt',])

}).prefix('/api/dashboards/empresas/:empresa_id')
    .namespace('Report')
    // .middleware(['dashboardAccess', 'empresaAccess'])

