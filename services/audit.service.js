const logWrapper = require('mf-logwrapper');
const logEntryBl = require('../bl/logEntry');

const logger = logWrapper.getContextLogger('service', 'audit');

module.exports = {
  version: 'v0',
  name: 'audit',
  actions: {
    record: {
      cache: false,
      params: {
        eventType: 'string',
        eventTime: { type: 'date', convert: true },
        eventData: [{ type: 'object', optional: true }, 'string'],
      },
      handler(ctx) {
        const auditData = {
          eventType: ctx.params.eventType,
          eventTime: new Date(ctx.params.eventTime),
          eventData: ctx.params.eventData,
          _callerNodeID: ctx.callerNodeID,
        };
        logEntryBl.record(auditData);
      },
    },
  },
  events: {
    'v0.audit.record': {
      handler(payload, sender) {
        const auditData = {
          _callerNodeID: sender.callerNodeID,
        };

        if (typeof payload.eventType === 'string') {
          auditData.eventType = payload.eventType;
        } else {
          logger.debugF('v0.audit.record', 'No eventType sent, ignoring');
          return;
        }

        auditData.eventTime = new Date(payload.eventTime);
        if (Number.isNaN(auditData.eventTime)) {
          auditData.eventTime = new Date();
          auditData._eventTimeOriginal = false; // eslint-disable-line no-underscore-dangle
        }

        if (payload.eventData === undefined) {
          logger.debugF('v0.audit.record', 'No eventData sent, ignoring');
          return;
        }
        auditData.eventData = payload.eventData;

        logEntryBl.record(auditData);
      },
    },
  },
};
