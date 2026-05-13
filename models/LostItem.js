// This file is used by Subteam1 to create the LostItem model for MongoDB using Mongoose
import mongoose from 'mongoose';
const lostItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category:{
        type: String,
        required: true,
        enum: ['Electronics', 'Accessories', 'Bags & Backpacks', 'Documents', 'Keys', 
            'Clothing', 'Books', 'Sports Equipment', 'Jewelry', 'Other']
    },

    color:{
        type: String
    },

    distinctiveMarks:{
        type: String
    },

    lastSeenLocation:{
        type: String,
        required: true
    },

    dateLost:{
        type: Date,
        required: true
    },

    images:{
        type: [String],
        validate: [arr => arr.length <= 5, 'Maximum of 5 images are allowed.']
    },

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        // To match the name in the schema "User"
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
});

const LostItem = mongoose.model('LostItem', lostItemSchema);
export default LostItem;