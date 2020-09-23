const grpc = require('grpc');
const protoPackage = require('./package');

function establish(call) {
    // callback(null, {message: 'Hello again, ' + call.request.name});
    console.log(call);

    let num = 1;
    let interval = setInterval(() => {
        // console.log(`sending ${num} to`);
        call.write({action: `${num++}`, data: JSON.stringify({abc: 1})});
    }, 2000)
    call.on('data', (d) => {
        console.log(d);
    });
    call.on('cancelled', (d) => {
        console.log(`${call.request.name} - disconnected`);
        clearInterval(interval);
        call.end();
    });
}

function main() {
    const server = new grpc.Server();
    server.addService(protoPackage.heartbeat.HeartbeatService.service, {
        Establish: establish
    });
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();

    console.log('started grpc server');
}

main();
