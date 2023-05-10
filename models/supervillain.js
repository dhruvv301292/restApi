const mongoose = require('mongoose')

const superVillainSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    debut: {
        type: Date,
        required: true

    },
    archNemesis: {
        type: mongoose.SchemaTypes.ObjectId, // reference to another schema
        required: false,
        ref: 'Superhero'
    }

})

// first argument is the name of the model in the db
module.exports = mongoose.model('Supervillain', superVillainSchema)