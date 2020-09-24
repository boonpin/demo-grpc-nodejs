const grpc = require('grpc');
const protoPackage = require('./package');
const os = require('os');
const jwt = require('jsonwebtoken');
const moment = require('moment');

function heartbeat() {
    return {
        hostname: os.hostname(),
        time: (new Date()).getTime(),
        uptime: os.uptime(),
        mem_free: os.freemem(),
        mem_total: os.totalmem(),
        storage_free: undefined,
        storage_used: undefined,
        cpu_usage: undefined,
    }
}

function main() {
    const meta = new grpc.Metadata();
    meta.add('Authorization', jwt.sign({
        hostname: os.hostname()
    }, 'my-secret-1234', {expiresIn: `5m`}));

    runHeartbeat(meta);
    runCommand(meta);
}

function runHeartbeat(meta) {
    const client = new protoPackage.heartbeat.HeartbeatService('localhost:80', grpc.credentials.createInsecure());
    const connection = client.Establish(meta);
    const interval = setInterval(() => {
        connection.write(heartbeat())
    }, 60000)
    const stop = (msg) => () => {
        console.log(msg);
        clearInterval(interval);
    };
    connection.on('data', function (d) {
        console.log(d);
    });
    connection.on('end', stop('end'));
    connection.on('cancelled', stop('cancelled'));
}

function runCommand(meta) {
    const client = new protoPackage.command.CommandService('localhost:80', grpc.credentials.createInsecure());
    const connection = client.Establish(meta);
    connection.on('data', function (request) {
        const {uid, action, data} = request;

        const dObject = JSON.parse(JSON.parse(data));

        console.log(`action = ${action}`);

        switch (action) {
            case 'SHOW_TIME':
                connection.write({uid, data: moment().format(dObject.format)})
                break;
            default:
                connection.write({uid, error: `unhandled action ${action}`});
        }
    });
    connection.on('end', () => console.log('end'));
    connection.on('cancelled', () => console.log('cancelled'));
}

main();
