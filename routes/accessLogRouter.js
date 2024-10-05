const express = require("express")
// const Office = require("../models/office")
const { MongoClient } = require('mongodb');
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/access_logs", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const access_logs = database.collection('access_logs');

        const page = parseInt(request.query.page) || 1;  // Current page, default to 1
        const limit = parseInt(request.query.limit) || 20;  // Number of items per page, default to 10
        const skip = (page - 1) * limit;


        const accessList = await access_logs.find()
            .skip(skip)  // Skip items based on the page
            .limit(limit)  // Limit the number of items per page
            .toArray();


        const totalAccess = await access_logs.countDocuments();
        // Return the list of companies as JSON
        response.json({
            data: accessList,
            currentPage: page,
            totalPages: Math.ceil(totalAccess / limit),
            totalLog: totalAccess,
            limit: limit
        });

    }catch(error){
        console.error('Error connecting to MongoDB:', error);
        response.status(500).json({ message: 'Error connecting to database' });
    }
    finally {
        // await client.close();
    }
})

router.get("/api/empty_offices/", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const offices = database.collection('offices');

        const post = await offices.find({status: false}).toArray()

        response.json({
            data: post,
        });

    }catch(error){
        response.status(500).send(error)
    }
})


module.exports = router
