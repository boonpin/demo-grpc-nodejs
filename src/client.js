const grpc = require('grpc');
const protoPackage = require('./package');
const os = require('os');
const jwt = require('jsonwebtoken');

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
    const client = new protoPackage.heartbeat.HeartbeatService('localhost:50051', grpc.credentials.createInsecure());
    const meta = new grpc.Metadata();
    meta.add('Authorization', jwt.sign({
        hostname: os.hostname()
    }, 'my-secret-1234', {expiresIn: `5m`}));


    const connection = client.Establish(meta);

    const interval = setInterval(() => {
        connection.write(heartbeat(), meta)
    }, 2500)

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


main();
