//MONGOOSE reemplaza todo esto...

const mongodb = require('mongodb');
const MongoCLient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoCLient.connect(            //test database
        'mongodb+srv://ramiro:ramiro29@phzcluster0-9pdn0.mongodb.net/test?retryWrites=true&w=majority'
    )
        .then(client => {
            console.log('Connected!');
            _db = client.db('test');
            callback();
        }).catch(err => {
            console.log(err);
        });
    
}

const getDb = () => {
    if(_db)
        return _db;
    throw 'No database found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
