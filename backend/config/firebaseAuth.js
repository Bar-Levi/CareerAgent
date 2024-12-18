const admin = require('firebase-admin');
const { firebaseConfig } = require('./env');

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
});

module.exports = admin;
