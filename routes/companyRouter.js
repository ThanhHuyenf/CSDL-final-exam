const express = require("express")
const Company = require("../models/company")
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/companies", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const companies = database.collection('companies');
        const offices = database.collection('offices');


        const page = parseInt(request.query.page) || 1;  // Current page, default to 1
        const limit = parseInt(request.query.limit) || 10;  // Number of items per page, default to 10
        const skip = (page - 1) * limit;


        const companyList = await offices.aggregate([
            {
                $match: { status: true }  // Filter offices where status is true
            },
            {
                $lookup: {
                    from: "companies",
                    localField: "office_id",
                    foreignField: "building_info.office_id",
                    as: "company"
                }
            },
            {
                $unwind: "$company"  // Unwind the joined company array
            },
            {
                $project: {
                    office_number: 1,
                    square: 1,
                    company: 1  // Only project the company name along with office details
                }
            }
        ])
            .skip(skip)  // Skip items based on the page
            .limit(limit)  // Limit the number of items per page
            .toArray();


        const totalCompanies = await companies.countDocuments();
        // Return the list of companies as JSON
        response.json({
            data: companyList,
            currentPage: page,
            totalPages: Math.ceil(totalCompanies / limit),
            totalCompanies: totalCompanies,
            limit: limit
        });

    }catch(error){
        console.error('Error connecting to MongoDB:', error);
        response.status(500).json({ message: 'Error connecting to database' });
    }
    finally {
    }
})


router.get("/api/company/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const companies = database.collection('companies');

        const post = await companies.findOne({'_id': new ObjectId(request.params.id)})

        console.log("post", post)

        response.send({
            ...post,
            rent: post.building_info.office_area * post.building_info.price_per_m2,
        })
    }catch(error){
        response.status(500).send(error)
    }
})

router.post("/api/company", async(request, response)=> {

    try{
        await client.connect();
        const database = client.db('office_management');
        const companies = database.collection('companies');
        const counters = database.collection('counters');
        const offices = database.collection('offices');

        const result = await counters.findOneAndUpdate(
            { id: "company_id" },
            { $inc: { value: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        const findOffice = await offices.findOne({office_number: request.body.office_number})
        if(!findOffice){
            response.status(400).json({
                message: "Office not found",
                status: 400
            })
        }else{
            if(findOffice.status){
                response.status(400).json({
                    message: "Office is not empty",
                    status: 400
                })
            } else{
                console.log("findOffice", findOffice)
                const data = {
                    company_id: result.value,
                    name: request.body.name,
                    tax_code: request.body.tax_code,
                    charter_capital: request.body.charter_capital,
                    industry: request.body.industry,
                    representative: request.body.representative,
                    phone_number: request.body.phone_number,
                    employee_count: 0,
                    building_info: {
                        office_id: findOffice.office_id,
                        price_per_m2: request.body.price_per_m2,
                        start_date: request.body.start_date ,
                        end_date: request.body.end_date,
                        office_area: findOffice.square
                    }
                }
                const post = await companies.insertOne(data)

                if(post){
                    await offices.updateOne({office_id: findOffice.office_id}, {$set: {status: true}})
                    response.status(200).send(post)
                }
            }
        }
    }catch(error){
        response.status(500).send(error)
    }
})

router.delete("/api/company/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const companies = database.collection('companies');
        const offices = database.collection('offices');

        const company = await companies.findOne({'_id' : new ObjectId(request.params.id)})

        const result = await companies.deleteOne({'_id' : new ObjectId(request.params.id)})
        if (result.deletedCount === 1) {
            await offices.updateOne({office_id: company.building_info.office_id}, {$set: {status: false}})
            response.status(200).send("Deleted successfully!")
        } else {
            response.status(404).send("Company not found")
        }
    }catch(error){
        response.status(500).send(error)
    }
})

module.exports = router

