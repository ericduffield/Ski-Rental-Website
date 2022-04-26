const app = require('./app.js');
const port = 1339;
const model = require('./models/skiEquipmentModelMysql');
let dbName = process.argv[2];
if (!dbName) {
    dbName = 'skiEquipment_db_test';
}

model.initialize(dbName, false)
    .then(
        app.listen(port) // Run the server
    );