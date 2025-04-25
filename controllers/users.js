import express from 'express'
import User from '../models/User.js'
import BookReview from '../models/BookReview.js'
import BookClub from '../models/BookClub.js'
import isLoggedIn from '../middleware/isLoggedIn.js'

const router = express.Router()

router.get('/profile', isLoggedIn, async (req, res, next) => {
    try {
      const userId = req.session.user._id
  
      const user = await User.findById(userId).populate('bookClub')
  
      const userReviews = await BookReview.find({ reviewer: userId })
  
      const clubReviews = await BookReview.find({ 
        bookClub: user.bookClub._id, 
        reviewer: { $ne: userId } 
      }).populate('reviewer')
  
      return res.render('users/profile.ejs', {
        user,
        userReviews,
        clubReviews // 
      })
    } catch (error) {
      return next(error)
    }
  })

router.post('/invite', isLoggedIn, async (req, res, next) => {
    try {
        const userId = req.session.user._id
        const newClubId = req.body.clubId?.trim()

        const bookClub = await BookClub.findById(newClubId)
        if (!bookClub) {
            const user = await User.findById(userId).populate('bookClub')
            const userReviews = await BookReview.find({ reviewer: userId })

            return res.status(400).render('users/profile.ejs', {
                user,
                userReviews,
                errorMessage: 'Invalid Book Club ID. Please try again.'
            })
        }

        // Get the user and their current club
        const user = await User.findById(userId)
        const oldClubId = user.bookClub

        // Move user to new club
        user.bookClub = newClubId
        await user.save()

        req.session.user.bookClub = newClubId

        // Add user to new club if not already a member
        if (!bookClub.members.includes(userId)) {
            bookClub.members.push(userId)
            await bookClub.save()
        }

        // Optional: Remove from old club members
        if (oldClubId && oldClubId.toString() !== newClubId) {
            await BookClub.findByIdAndUpdate(oldClubId, {
                $pull: { members: userId }
            })
        }

        return res.redirect('/profile')
    } catch (error) {
        return next(error)
    }
})

export default router