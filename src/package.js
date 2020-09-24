const grpc = require('grpc');
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    [
        path.join(__dirname, 'proto', 'command.proto'),
        path.join(__dirname, 'proto', 'heartbeat.proto'),
    ], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

module.exports = grpc.loadPackageDefinition(packageDefinition);
