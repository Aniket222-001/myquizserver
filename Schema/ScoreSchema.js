const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
    owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    percentage:Number,
    total_que:Number,
    wrong_que: Number,
    correct_que: Number,
    category: String,
    difficulty: String,
    type: String
})

const Score = mongoose.model('Scorecard',ScoreSchema)

module.exports = Score