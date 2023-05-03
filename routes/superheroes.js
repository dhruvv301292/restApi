const express = require('express')
const router = express.Router()
const Superhero = require('../models/superhero')

// router.use(getSuperHeroByName) - this would make all routes use the getSuperHeroByName middleware

//Get all superheroes

router.get('/', paginatedResults(Superhero), (req, res) => {
    res.json(res.paginatedResults)
  })
  
function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        if (endIndex < await model.countDocuments().exec()) {
        results.next = {
            page: page + 1,
            limit: limit
        }
        }
        
        if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
        }
        try {
            results.results = await model.find().limit(limit).skip(startIndex).exec()
            res.paginatedResults = results
        next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

//Get a specific superhero
router.get('/:name', getSuperHeroByName, (req, res) => {    
    res.json(res.superHero)
})


//Create a superhero entry
router.post('/', async (req, res) => {
    // new Superhero and superhero.save() can be combined into 'await User.create()'
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

// all request sharing the same route can also be chained using router.route

/*
The code below is the same as declaring individual routes for delete and patch as above

router
    .route('/:id')
    .delete(getSuperHeroById, async (req, res) => {
        try {
            await res.superHero.deleteOne()
            res.json({message: 'Delete Successful'})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    })
    .patch(getSuperHeroById, async (req, res) => {
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
*/

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