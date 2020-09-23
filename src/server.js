const grpc = require('grpc');
const protoPackage = require('./package');
const jwt = require('jsonwebtoken');

function establish(call) {
    let user = null;
    try {
        const token = call.metadata.get('authorization')[0];
        user = jwt.verify(token, `my-secret-1234`);
    } catch (e) {
        call.write({action: `Unauthorized!`});
        call.end();
        return;
    }

    console.log(`welcome ${user.hostname}`);

    let num = 1;
    let interval = setInterval(() => {
        // console.log(`sending ${num} to`);
        call.write({action: `${num++}`, data: JSON.stringify({abc: 1})});
    }, 2000)
    call.on('data', (d) => {
        console.log(d);
    });
    call.on('cancelled', () => {
        console.log(`${user.hostname} disconnected`);
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
