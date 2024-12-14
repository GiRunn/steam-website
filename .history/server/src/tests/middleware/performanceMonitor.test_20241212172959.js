// server/src/tests/middleware/performanceMonitor.test.js
const { strict: assert } = require('assert');
const sinon = require('sinon');
const { performanceMonitor, logger } = require('../../middleware/performanceMonitor');

describe('Performance Monitor Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      headers: {}
    };
    res = {
      statusCode: 200,
      on: sinon.stub()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should log request start', () => {
    const loggerSpy = sinon.spy(logger, 'info');
    performanceMonitor(req, res, next);
    assert.equal(loggerSpy.calledOnce, true);
  });

  it('should measure response time', (done) => {
    res.on = (event, callback) => {
      if (event === 'finish') {
        setTimeout(callback, 100);
      }
    };

    const loggerSpy = sinon.spy(logger, 'info');
    performanceMonitor(req, res, next);
    
    setTimeout(() => {
      assert.equal(loggerSpy.calledTwice, true);
      done();
    }, 150);
  });
});