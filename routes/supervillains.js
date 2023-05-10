const express = require('express')
const router = express.Router()
const Supervillain = require('../models/supervillain')

// router.use(getSuperHeroByName) - this would make all routes use the getSuperHeroByName middleware

//Get all supervillains

router.get('/', paginatedResults(Supervillain), (req, res) => {
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
router.get('/:name', getSuperVillainByName, (req, res) => {    
    res.json(res.superVillain)
})


//Create a superhero entry
router.post('/', async (req, res) => {
    // new superVillain and superVillain.save() can be combined into 'await User.create()'
    const superVillain = new Supervillain({
        name: req.body.name,
        debut: req.body.debut
    })
    try {
        const newSuperVillain = await superVillain.save()
        res.status(201).json(newSuperVillain)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }    
})

// update a superhero entry
router.patch('/:id', getSuperVillainById, async (req, res) => {
    if (req.body.name != null) {
        res.superVillain.name = req.body.name
    }
    if (req.body.debut != null) {
        res.superVillain.debut = req.body.debut
    }
    if (req.body.enemy != null) {
        res.superVillain.archNemesis = req.body.enemy
    }
    try {
        const updatedSuperVillain = await res.superVillain.save()
        res.json(updatedSuperVillain)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})


//delete a superVillain
router.delete('/:id', getSuperVillainById, async (req, res) => {
    try {
        await res.superVillain.deleteOne()
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

//middleware to fetch a superVillain by name since many of the routes are using this
async function getSuperVillainByName(req, res, next) {
    let superVillain = undefined
    try {
        superVillain = await Supervillain.find({"name": req.params.name}).populate("archNemesis")
        if (superVillain == null) {
            return res.status(404).json({messsage: "Cannot find superVillain with name: " + req.params.name})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    res.superVillain = superVillain
    next()
}

//middleware to fetch a superVillain by id since many of the routes are using this
async function getSuperVillainById(req, res, next) {
    let superVillain;
    try {
        superVillain = await Supervillain.findById(req.params.id)
        if (superVillain == null) {
            return res.status(404).json({messsage: "Cannot find superVillain with id: " + req.params.id})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    res.superVillain = superVillain
    next()
}

module.exports = router