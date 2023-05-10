const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.DB_URL, {family: 4})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('connected', () => console.log('Connected to DB'))

app.use(express.json()) // middleware function to tell express to expect json requests

const superheroesRouter = require('./routes/superheroes')
const supervillainsRouter = require('./routes/supervillains')
app.use('/superheroes', superheroesRouter) // all routes in this router start with /superheroes
app.use('/supervillains', supervillainsRouter)

app.listen(5001, () => console.log('Server started'))