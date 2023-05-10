const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const { graphqlHTTP }  = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLScalarType, GraphQLList, GraphQLID } = require('graphql')
const Superhero = require('./models/superhero')
const Supervillain = require('./models/supervillain')

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
})

mongoose.connect(process.env.DB_URL, {family: 4})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('connected', () => console.log('Connected to DB'))

//define the superhero and supervillain graphql schema objects
const SuperHeroType = new GraphQLObjectType({
    name: 'SuperHero',
    description: 'This represents a comic book super hero',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        debut: { type: dateScalar },
        secretIdentity: { type: GraphQLString },
        archNemesis: { 
            type: SuperVillainType, 
            resolve: async (obj) => {
                return await Supervillain.findById(obj.id)
            }
        }
    })
})

const SuperVillainType = new GraphQLObjectType({
    name: 'SuperVillain',
    description: 'This represents a comic book super villain',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        debut: { type: dateScalar },
        archNemesis: { 
            type: SuperHeroType, 
            resolve: async (superVillain) => {
                return await Superhero.findById(superVillain)
            }
        }
    })
})

//define a query object that contains all the queries
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'The root query',
    fields: () => ({
        superHero: {
            type: SuperHeroType, 
            description: 'A super hero',
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
                return await Superhero.findById(args.id);
            }
        },
        superHeroes: {
            type: new GraphQLList(SuperHeroType),
            description: 'All the superheroes',
            resolve: async () => await Superhero.find()
        },
        superVillain: {
            type: SuperVillainType, 
            description: 'A super villain',
            args: {
                id: { type: GraphQLID }
            },
            resolve: async (parent, args) => {
                return await Supervillain.findById(args.id);
            }
        },
        superVillains: {
            type: new GraphQLList(SuperVillainType),
            description: 'All the supervillains',
            resolve: async () => await Supervillain.find()
        },
    })
})

//define a graphql object that contains the query object and mutation object

//define a mutation object that contains all the mutations

const superSchema = new GraphQLSchema({
    query: RootQueryType
  })


app.use('/graphql', graphqlHTTP({
    schema: superSchema,
    graphiql: true
})) //set up single endpoint to use graphQL interface

app.listen(5001, () => console.log('Server started'))



