# mfuses-easy-audit

This module provides an simple audit logging service for the MFuSes framework.

## Deployment

1. Clone the repository.
2. Update/create configuration as per your environment in the `config` folder.
3. Run the module - `npm start` or using your favorite process manager (PM2, etc.)

## Service endpoints

### Actions
1. Record an audit entry
      * Action Name: `v0.audit.record`
      * Parameters: 
        * eventType: `string`
        * eventTime: `Date`
        * eventData: `Object|string`
      * Returns: Nothing, *do not wait for a response*.

### Events
1. Record an audit entry
      * Event Name: `v0.audit.record`
      * Payload: Object with following keys
        * eventType: `string`
        * eventTime: `Date` *(Optional, will default to current time)*
        * eventData: `Object|string`

## Usage
### Install dependencies in your app.
```shell
npm install https://github.com/mobifiiliallp/mfuses-moleculer.git#semver:^1.0.0
npm install https://github.com/mobifiiliallp/mfuses-easy-audit.git#semver:^1.0.0
```
### Call the action or the event wherever needed
```js
const { mfusesHelper } = require('mfuses-moleculer');

// Call the action 
function callAuditLog(eventType, data) {
  const actionName = 'v0.audit.record';
  const callParams = {
    eventType: eventType,
    eventTime: new Date(),
    eventData: data
  };

  return mfusesHelper.call(actionName, callParams);
}

// Broadcast the event
function broadcastAuditLog(eventType, data) {
  const eventName = 'v0.audit.record';
  const payload = {
    eventType: eventType,
    eventData: data
  };

  return mfusesHelper.emit(eventName, payload);
}
  ```