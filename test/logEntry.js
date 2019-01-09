//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let Session = require('../app/models/logsession.model');
let LogEntry = require('../app/models/logentry.model');
const ConsoleMsgs = require('../config/consolelogs');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

//Parent Block
describe('LogEntries', () => {
    //Delete all previous Log Entries before we begin
    describe('Remove all old LogEntry Data', () => {
        it('it should remove all LogEntry data.', (done) => {
            LogEntry.remove({}, (err) => {
                should.not.exist(err);
            });
            done();
        })
    })

    /*
     * Test the Get route
     */
    describe('/GET logEntry', () => {
        it('it should get all the LogEntries i.e. 0 Log Entries to be specific, since we just wiped out them out.', (done) => {
            chai.request(server)
                .get('/logentry')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                })
        })
    })

    /*
     * Test the Post route with no Session ID
     */
    describe('/POST logentry', () => {
        it('it should not POST a logEntry without a Session', (done) => {
            let entry = {
                changeLog:          null,
                old:                null,
                new:                {a: 'test', b: 'test1', c: Date.now()}
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('message').eql(ConsoleMsgs.err_empty_session_id);
                    done();
                })
        })
    })

    /*
     * Test the Post route with null changeLog & new object
     */
    describe('/POST logentry', () => {
        it('it should not POST a logEntry with null chnagelog & newobj.', (done) => {
            let entry = {
                sessionId:          '1234',
                changeLog:          null,
                old:                null,
                new:                null
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('message').eql(ConsoleMsgs.err_either_log_newObj);
                    done();
                })
        })
    })

    /*
     * Test the Post route with blank changeLog & new object
     */
    describe('/POST logentry', () => {
        it('it should not POST a logEntry with blank chnagelog & newobj.', (done) => {
            let entry = {
                sessionId:          '1234',
                changeLog:          '',
                old:                null,
                new:                ''
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('message').eql(ConsoleMsgs.err_either_log_newObj);
                    done();
                })
        })
    })

    /*
     * Test the Post route with non-existant session ID
     */
    describe('/POST logentry', () => {
        it('it should not POST a logEntry with non-existant session ID.', (done) => {
            let entry = {
                sessionId:          '12341324132iouqwe',        // Garbage
                changeLog:          '',
                old:                null,
                new:                {a: 'test', b: 'test1', c: Date.now()}
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('message').eql(ConsoleMsgs.log_session_id_not_found + entry.sessionId);
                    done();
                })
        })
    })

    /*
     * Test a session, keep it open and log a valid entry
     */
    describe('/POST logentry', () => {
        var sessionToTest;
        var logToTest;
        var dateToTest = Date.now();

        before('it should POST a valid logsession', (done) => {
            let logSession = {
                productName: "Hyundai",
                moduleName: "Verna",
                userName: "Kedar"
            }
            chai.request(server)
                .post('/logsession')
                .send(logSession)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a("object");
                    res.body.should.have.property('productName').eql("Hyundai");
                    res.body.should.have.property('moduleName').eql("Verna");
                    res.body.should.have.property('userName').eql("Kedar");
                    expect(res.body.closed).to.be.false;
                    res.body.should.have.property('closedAt').eql(null);
                    res.body.should.have.property('sessionId');
                    sessionToTest = res.body.sessionId;
                    done();
                })
        })

        it('it should not POST a logEntry with valid session ID.', (done) => {
            let entry = {
                sessionId:          sessionToTest,
                changeLog:          {before: {a: 'test a', b: 'test b', c: dateToTest}, after: {a: 'test', b: 'test1', c: dateToTest}},
                old:                null,
                new:                {a: 'test', b: 'test1', c: dateToTest}
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('logId');
                    logToTest = res.body.logId;
                    done();
                })
        })
    
    // Verify the contents of the recent log
    after('it should retrieve the LogEnty with valid Log ID.', (done) => {
            chai.request(server)
                .get('/logentry/withLogID/' + logToTest)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a("object");
                    res.body[0].should.have.property('old').eql(null);
                    res.body[0].should.have.property('new').to.deep.equal({a: 'test', b: 'test1', c: dateToTest});
                    res.body[0].should.have.property('changeLog').to.deep.equal({before: {a: 'test a', b: 'test b', c: dateToTest}, after: {a: 'test', b: 'test1', c: dateToTest}});
                    done();
            })        
        })
    })

    // Test with a closed session
        /*
     * Test the Closing of the Session
     */
    describe('/POST logentry', () => {
        var sessionToTest;
        before('it should POST a valid logsession for closing later ', (done) => {
            let logSession = {
                productName: "VW",
                moduleName: "Polo",
                userName: "Kedar"
            }
            chai.request(server)
                .post('/logsession')
                .send(logSession)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a("object");
                    res.body.should.have.property('productName').eql("VW");
                    res.body.should.have.property('moduleName').eql("Polo");
                    res.body.should.have.property('userName').eql("Kedar");
                    expect(res.body.closed).to.be.false;
                    res.body.should.have.property('closedAt').eql(null);
                    res.body.should.have.property('sessionId');
                    sessionToTest = res.body.sessionId;
                    done();
                })
        })
        /*
        * Close specific Session ID
        * This should return 1 record
        */
        it('Close a session and try to log against it.', (done) => {
            chai.request(server)
                .put('/logsession/close/' + sessionToTest)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('nModified').eql(1);      // Modified Rows - should be 1
                    res.body.should.have.property('n').eql(1);              // Total rows found - should be 1
                    done();
            })
        })

        after('Try to log an entry against closed session', (done) => {
            let entry = {
                sessionId:          sessionToTest,
                changeLog:          '',
                old:                null,
                new:                {a: 'test', b: 'test1', c: Date.now()}
            }
            chai.request(server)
                .post('/logentry')
                .send(entry)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('message').eql(ConsoleMsgs.log_session_id_closed + sessionToTest);
                    done();
                })        
        })
    })

    // Create a batch of 25 logentries
    describe('/POST logentry', () => {
        var sessionToTest;
        before('it should POST a valid logsession. ', (done) => {
            let logSession = {
                productName: "VW001",
                moduleName: "Polo002",
                userName: "Kedar003"
            }
            chai.request(server)
                .post('/logsession')
                .send(logSession)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.a("object");
                    res.body.should.have.property('productName').eql("VW001");
                    res.body.should.have.property('moduleName').eql("Polo002");
                    res.body.should.have.property('userName').eql("Kedar003");
                    expect(res.body.closed).to.be.false;
                    res.body.should.have.property('closedAt').eql(null);
                    res.body.should.have.property('sessionId');
                    sessionToTest = res.body.sessionId;
                    done();
                })
        })

        it('it should should create multiple LogEntries to test', (done) => {
            var totalLogEntries = 25;
            var j = 0;
            for (var i=0; i<totalLogEntries; i++) {
                let entry = {
                    sessionId:          sessionToTest,
                    changeLog:          {before: {a: 'test a' + i , b: 'test b' + i, c: Date.now()}, 
                                         after: {a: 'test' + i, b: 'test1'+ i, c: Date.now()}},
                    old:                null,
                    new:                {a: 'testnew' + i, b: 'test1new' + i, c: Date.now()}
                }
                chai.request(server)
                    .post('/logentry')
                    .send(entry)
                    .end((err, res) => {
                        res.should.have.status(200);   
                        j++;
                        if (j == (totalLogEntries - 1)) {
                            done();
                        }
                    })
            }   
        })
    })
})