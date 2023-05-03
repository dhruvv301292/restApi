const mongoose = require('mongoose')

const superHeroSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    debut: {
        type: Date,
        required: true

    },
    secretIdentity: {
        type: String,
        required: false
    },
    archNemesis: {
        type: mongoose.SchemaTypes.ObjectId, // reference to another schema
        required: false
    }

})

// first argument is the name of the model in the db
module.exports = mongoose.model('Superhero', superHeroSchema)