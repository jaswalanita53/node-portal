'use strict'
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

module.exports.dbConnect = async function dbConnect() {
    try {
        var client = await MongoClient.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        return { client: client, db: client.db(process.env.DATABASE) }
    } catch (error) {
        console.log('connection error', error)
    }
}

