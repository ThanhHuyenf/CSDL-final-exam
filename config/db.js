const mongoose = require('mongoose');

const mongoURI =  'mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const connectDB = async () => {
    mongoose.connect(mongoURI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch((err) => console.error('Failed to connect to MongoDB Atlas', err));

};

module.exports = connectDB;
