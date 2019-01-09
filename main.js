const logWrapper = require('mf-logwrapper');
const dbMongo = require('mf-db-mongo');
const mfusesBroker = require('mfuses-moleculer').mfusesBroker;

const logger = logWrapper.getContextLogger('main');

function configureDal() {
  dbMongo.initialize()
    .then(() => {
      logger.debugF('configureDal', 'Database initialized');
    }).catch((e) => {
      logger.error(e);
    });
}

function configureServices() {
  mfusesBroker.loadServices('./services');
}

function startup() {
  configureDal();
  configureServices();
}

startup();
