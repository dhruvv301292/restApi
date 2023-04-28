const express = require('express')
const router = express.Router()
const Superhero = require('../models/superhero')

//Get all superheroes
router.get('/', async (req, res) => {    
    try {
        const superheroes = await Superhero.find()
        res.json(superheroes)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get a specific superhero
router.get('/:name', getSuperHeroByName, (req, res) => {    
    res.json(res.superHero)
})


//Create a superhero entry
router.post('/', async (req, res) => {
    const superhero = new Superhero({
        name: req.body.name,
        debut: req.body.debut,
        secretIdentity: req.body.secretIdentity
    })
    try {
        const newSuperhero = await superhero.save()
        res.status(201).json(newSuperhero)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }    
})

//update a superhero entry
router.patch('/:id', getSuperHeroById, async (req, res) => {
    if (req.body.name != null) {
        res.superHero.name = req.body.name
    }
    if (req.body.debut != null) {
        res.superHero.debut = req.body.debut
    }
    if (req.body.secretIdentity != null) {
        res.superHero.secretIdentity = req.body.secretIdentity
    }
    try {
        const updatedSuperHero = await res.superHero.save()
        res.json(updatedSuperHero)
    } catch (error) {
        res.status(400),json({message: error.message})
    }
})


//delete a superhero
router.delete('/:id', getSuperHeroById, async (req, res) => {
    try {
        await res.superHero.deleteOne()
        res.json({message: 'Delete Successful'})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//middleware to fetch a superhero by name since many of the routes are using this
async function getSuperHeroByName(req, res, next) {
    let superHero = undefined
    try {
        superHero = await Superhero.find({"name": req.params.name})
        if (superHero == null) {
            return res.status(404).json({messsage: "Cannot find superhero with name: " + req.params.name})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    res.superHero = superHero
    next()
}

//middleware to fetch a superhero by id since many of the routes are using this
async function getSuperHeroById(req, res, next) {
    let superHero = undefined
    try {
        superHero = await Superhero.findById(req.params.id)
        if (superHero == null) {
            return res.status(404).json({messsage: "Cannot find superhero with id: " + req.params.id})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    res.superHero = superHero
    next()
}


module.exports = router