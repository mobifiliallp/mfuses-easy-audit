const config = require('config');
const uuidv1 = require('uuid/v1');
const logWrapper = require('mf-logwrapper');
const dbMongo = require('mf-db-mongo');

const logger = logWrapper.getContextLogger('bl', 'logEntry');

let auditLogCollectionName = 'auditLog';
if (config.has('auditLogCollectionName')) {
  auditLogCollectionName = config.get('auditLogCollectionName');
}

function record(auditData) {
  const logEntry = {
    _logId: uuidv1(),
    _created: new Date(),
  };

  Object.assign(logEntry, auditData);
  dbMongo.getCollection(auditLogCollectionName)
    .then(logCollection => logCollection.insert(logEntry))
    .catch((e) => {
      logger.error(e);
    });
}
module.exports.record = record;
