import mongoose from 'mongoose';

import Item from './item.js';

const dbUrl = 'mongodb://localhost';

const connectDb = () => {
    return mongoose.connect(dbUrl);
};

const models = { Item };

export { connectDb };

export default models;