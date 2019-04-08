import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    volume: {
        type: Number
    }
});

const Item = mongoose.model('Message', itemSchema);

export default Item;