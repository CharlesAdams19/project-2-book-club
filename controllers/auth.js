import express from 'express'
import User from '../models/User.js'
import BookReview from '../models/BookReview.js'
import BookClub from '../models/BookClub.js'
import isLoggedOut from '../middleware/isLoggedOut.js'
import bcrypt from 'bcrypt'
const router = express.Router()

// routes 

// register form page 

router.get('/auth/register', isLoggedOut, (req, res) => {

    try {
        return res.render('auth/register.ejs', {
            errorMessage: ''
        })
    } catch (error) {
        return res.status(500).send('Server Error')

    }
})

// login  form page 

router.get('/auth/login', isLoggedOut, (req, res) => {
    try {
        return res.render('auth/login.ejs', {
            errorMessage: ''
        })

    } catch (error) {
        return res.status(500).send('Server Error')
    }
})

// create a user 

router.post('/auth/register', isLoggedOut, async (req, res) => {
    try {
        console.log(req.body, "is this working")
        const bookclubId = req.body.clubId?.trim()
        const newClubName = req.body.newClubName?.trim()

        let bookclub

        if (bookclubId) {
            bookclub = await BookClub.findById(bookclubId)

            if (!bookclub) {
                return res.status(400).render('auth/register.ejs', {
                    errorMessage: 'Invalid Book Club ID. Please check and try again.'

                })
            }
        } else if (newClubName) {
            bookclub = await BookClub.create({
                name: newClubName,
                members: [],
                createdBy: null
            })
        
        } else {
    // 3. No ID and no name provided, fallback default
    bookclub = await BookClub.create({
        name: `${req.body.name}'s Book Club`,
        members: [],
        createdBy: null
    });
}
    // hash password 
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: hashedPassword,
    bookClub: bookclub._id
})

bookclub.members.push(newUser._id)

if (!bookclubId) {
    bookclub.createdBy = newUser._id
}
await bookclub.save()

return res.redirect('/auth/login')
    } catch (error) {

    return res.status(400).render('auth/register.ejs', {
        errorMessage: error.message
    })
}
})

// user login

router.post('/auth/login', isLoggedOut, async (req, res) => {
    try {
        console.log(req.body.email)
        // match users email in the database with an email matching the req.body.email ( email from the form)

        const foundUser = await User.findOne({ email: req.body.email })

        // if user not found , render form with error message 
        if (!foundUser) {
            console.log('User was not found')
            return res.status(401).render('auth/login.ejs', {
                errorMessage: "Unauthorised"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, foundUser.password)
        if (!isPasswordCorrect) {
            return res.status(401).render('auth/login.ejs', {
                errorMessage: "Invalid credentials"
            })
        }

        req.session.user = {
            email: foundUser.email,
            _id: foundUser._id,
            bookClub: foundUser.bookClub,
            name: foundUser.name
        }

        req.session.save(() => {
            return res.redirect('/profile')
        })

    } catch (error) {
        console.error(error);
        return res.status(500).render('auth/login.ejs', {
            errorMessage: 'Something went wrong'
        })
    }
})

// login the user by adding the details from the form to the req.session 





// Log out user
router.get('/auth/log-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
})

export default router