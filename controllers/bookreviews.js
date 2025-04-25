import mongoose from 'mongoose'
import express from 'express'
import User from '../models/User.js'
import BookReview from '../models/BookReview.js'
import BookClub from '../models/BookClub.js'
import isLoggedIn from '../middleware/isLoggedIn.js'
import isReviewer from '../middleware/isReviewer.js'

const router = express.Router()

// ! Routes that render a web page

// Index - get all reviews

router.get('/bookreviews', async (req, res, next) => {
    try {
        const allBookreviews = await BookReview.find()
        return res.render('bookreviews/index.ejs', {
            bookReviews: allBookreviews
        })
    } catch (error) {
        return next(error)
    }

})


// New - display the form that allows users to submit a create request 
router.get('/bookreviews/new', isLoggedIn, (req, res) => {
    try {
        return res.render('bookreviews/new.ejs', {
        })
    } catch (error) {
        console.log(error)
    }
})


// Edit - Displays the form that allows us to submit an UPDATE request
router.get('/bookreviews/:bookreviewId/edit', isLoggedIn, isReviewer, async (req, res, next) => {
    try {
        const { bookreviewId } = req.params
        if (!mongoose.isValidObjectId(bookreviewId))
            return next()

        const bookreview = await BookReview.findById(bookreviewId)

        if (!bookreview)
            return next()

        return res.render('bookreviews/edit.ejs', {
            bookreview

        })
    } catch (error) {
        return next(error)
    }
})

// Show - displays a single article
router.get('/bookreviews/:bookreviewId', async (req, res, next) => {
    try {
        const { bookreviewId } = req.params
        if (!mongoose.isValidObjectId(bookreviewId))
            return next()

        const bookreview = await BookReview.findById(bookreviewId).populate('reviewer')
        if (!bookreview) return next()

        return res.render('bookreviews/show.ejs', {
            bookreview
        })
    } catch (error) {
        return next(error)

    }
})

// Update - update an existing article

router.put('/bookreviews/:bookreviewId', isLoggedIn, isReviewer, async (req, res, next) => {
    try {
        const { bookreviewId } = req.params

        if (!mongoose.isValidObjectId(bookreviewId))
            return next();
        const bookreview = await BookReview.findById(bookreviewId)
        if (!bookreview) return next()

        await BookReview.findByIdAndUpdate(bookreviewId, req.body)

        return res.redirect(`/bookreviews/${bookreviewId}`);
    } catch (error) {
        console.log(error.message)
        return res.render('bookreviews/edit.ejs', {
            bookreview: req.body,
            errorMessage: error.message

        })
    }
})

// Delete - delete an existing article

router.delete('/bookreviews/:bookreviewId', isLoggedIn, isReviewer, async (req, res, next) => {
    try {
        const { bookreviewId } = req.params
        if (!mongoose.isValidObjectId(bookreviewId))
            return next()

        await BookReview.findByIdAndDelete(bookreviewId)
        return res.redirect('/bookreviews')
    } catch (error) {

    }

})

// ! Routes that DO NOT render a web page
// Create - create a new bookreview
router.post('/bookreviews', isLoggedIn, async (req, res) => {
    try {
        const userId = req.session.user._id

        const user = await User.findById(userId)

        req.body.reviewer = req.session.user._id
        req.body.bookClub = req.session.user.bookClub

        const newBookReview = await BookReview.create(req.body)
        return res.redirect(`/bookreviews/${newBookReview._id}`)
    } catch (error) {
        console.log(error.message)
        return res.render('bookreviews/new.ejs', {
            errorMessage: error.message
        })
    }
})




export default router