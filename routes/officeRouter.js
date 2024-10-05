const express = require("express")
// const Office = require("../models/office")
const { MongoClient } = require('mongodb');
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/offices", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const offices = database.collection('offices');

        const page = parseInt(request.query.page) || 1;  // Current page, default to 1
        const limit = parseInt(request.query.limit) || 20;  // Number of items per page, default to 10
        const skip = (page - 1) * limit;


        const officeList = await offices.aggregate([
            {
                $lookup: {
                    from: "companies",
                    localField: "office_id",
                    foreignField: "building_info.office_id",
                    as: "company"
                }
            },
            {
                $addFields: {
                    company: {
                        $cond: {
                            if: { $eq: ["$status", true] },  // If status is true, include company info
                            then: { $arrayElemAt: ["$company", 0] },  // Get the first matched company info
                            else: {}  // If status is false, return an empty object
                        }
                    }
                }
            },
            {
                $project: {
                    office_number: 1,
                    square: 1,
                    status: 1,
                    company: {
                        name: 1,
                        tax_code: 1,
                        charter_capital: 1,
                        industry: 1,
                        representative: 1,
                        phone_number: 1,
                        building_info: 1
                    }  // Include only relevant company fields
                }
            }
        ])
            .skip(skip)  // Skip items based on the page
            .limit(limit)  // Limit the number of items per page
            .toArray();


        const totalOffice = await offices.countDocuments();
        // Return the list of companies as JSON
        response.json({
            data: officeList,
            currentPage: page,
            totalPages: Math.ceil(totalOffice / limit),
            totalOffice: totalOffice,
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
