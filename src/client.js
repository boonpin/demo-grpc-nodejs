const grpc = require('grpc');
const protoPackage = require('./package');
const os = require('os');

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

    const connection = client.Establish(heartbeat());

    const interval = setInterval(() => {
        connection.write(heartbeat())
    }, 2500)

    connection.on('data', function (d) {
        console.log(d);
    });
    connection.on('cancelled', () => {
        console.log('cancelled')
        clearInterval(interval);
    });
}


main();
