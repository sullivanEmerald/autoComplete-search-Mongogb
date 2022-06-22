const express = require('express')
const app = express()
const {MongoClient, ObjectId} = require('mongodb')
const PORT =  process.env.PORT || 7000
const cors = require('cors')
require('dotenv').config()

let db, 
    connetionString  = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(connetionString)
    .then(client => {
        console.log(`connected to ${dbName} Database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended : true }))
app.use(express.json())

app.get('/search', async (request, response) => {
    try{
        let result =  await collection.aggregate([
            {
                "$search" : {
                    "autocomplete" : {
                        "query" : `${request.query.query}`,
                        "path" : "title",
                        "fuzzy" : {
                            "MaxEdits" : 2,
                            "prefixLength" : 3
                        }
                    }
                }
            }
        ]).toArray()
        response.send(result)
    }catch(error){
       response.status(404).send({message : error.message})
    }
})

app.get('/get/:id', async (request, response) => {
    try{
        let result =  await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    }catch(error){
        response.status(404).send({message : error.message})
    }
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT} local Server`)
})
