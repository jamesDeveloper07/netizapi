'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be a good choice for a development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true,
    debug: Env.get('DB_DEBUG', false)
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  pgvoalle: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST_VOALLE', 'localhost'),
      port: Env.get('DB_PORT_VOALLE', ''),
      user: Env.get('DB_USER_VOALLE', 'root'),
      password: Env.get('DB_PASSWORD_VOALLE', ''),
      database: Env.get('DB_DATABASE_VOALLE', 'adonis')
    },
    debug: Env.get('DB_DEBUG_VOALLE', false)
  },

  pgappnetiz: {
    client: Env.get('DB_CONNECTION_APP', 'pg'),
    connection: {
      host: Env.get('DB_HOST_APP', 'localhost'),
      port: Env.get('DB_PORT_APP', ''),
      user: Env.get('DB_USER_APP', 'root'),
      password: Env.get('DB_PASSWORD_APP', ''),
      database: Env.get('DB_DATABASE_APP', 'adonis')
    },
    debug: Env.get('DB_DEBUG_APP', false)
  }

}
