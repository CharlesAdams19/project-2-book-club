import mongoose, { Schema } from 'mongoose'


// BookReview Schema (parent document)
const BookReviewSchema = new mongoose.Schema ({
    bookName:{type: String, required: true}, 
    reviewText:{type: String, required: true}, 
    tags: [String],
    reviewer:{ type: Schema.Types.ObjectId, ref: 'User'},
    bookClub:{type: Schema.Types.ObjectId, ref: 'BookClub', required: true },
    // comments: [commentSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User'}]
}, {
    timestamps:true
    })

const BookReview = mongoose.model('BookReview', BookReviewSchema)
export default BookReview 