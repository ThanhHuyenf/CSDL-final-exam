const express = require("express")
const Company = require("../models/company")
const { MongoClient, ObjectId } = require('mongodb');
const {params} = require("nodemon");
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/services", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const services = database.collection('services');

        const page = parseInt(request.query.page) || 1;  // Current page, default to 1
        const limit = parseInt(request.query.limit) || 10;  // Number of items per page, default to 10
        const skip = (page - 1) * limit;


        const serviceList = await services.find()
            .skip(skip)  // Skip items based on the page
            .limit(limit)  // Limit the number of items per page
            .toArray();


        const totalService = await services.countDocuments();
        // Return the list of companies as JSON
        response.json({
            data: serviceList,
            currentPage: page,
            totalPages: Math.ceil(totalService / limit),
            totalCompanies: totalService,
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


router.put("/api/service/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const services = database.collection('services');

        console.log(request)
        const { service_name, service_type, base_price } = request.body

        const result = await services.updateOne(
            { '_id': new ObjectId(request.params.id) },
            {
                $set: {
                    service_name: service_name,
                    base_price: base_price
                }
            }
        )

        if (result.modifiedCount === 1) {
            response.status(200).json({ message: 'Success' });
        } else {
            response.status(404).json({ message: 'Service not found or no changes made' });
        }

    }catch(error){
        response.status(500).send(error)
    }
})

router.delete("/api/service/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const services = database.collection('services');

        const result = await services.deleteOne({'_id' : new ObjectId(request.params.id)})
        if (result.deletedCount === 1) {
            response.status(200).send("Deleted successfully!")
        } else {
            response.status(404).send("Service not found")
        }
    }catch(error){
        response.status(500).send(error)
    }
})

router.post("/api/service", async(request, response)=> {

    try{
        await client.connect();
        const database = client.db('office_management');
        const services = database.collection('services');
        const counters = database.collection('counters');

        console.log("request.body", request.body)
        const result = await counters.findOneAndUpdate(
            { id: "service_id" },
            { $inc: { value: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        const post = await services.insertOne({...request.body, service_id: result.value})

        response.status(200).send(post)
    }catch(error){
        response.status(500).send(error)
    }
})

router.get('/api/usage_service/:id', async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const service_usage = database.collection('service_usage');

        console.log("request.params.id", request.params.id)

        const serviceList = await service_usage.find({company_id: request.params.id}).toArray();


        console.log("serviceList", serviceList)
        response.json({
            data: serviceList,
        });

    }catch(error){
        response.status(500).send(error)
    }
})

router.post('/api/usage_service', async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const service_usage = database.collection('service_usage');

        console.log("request.body", request.body)

        const post = await service_usage.updateOne(
            {
                company_id: request.body.company_id, // Điều kiện để tìm đúng công ty
                billing_month: request.body.billing_month              // Điều kiện lọc theo tháng
            },
            {
                $push: {
                    services: {
                        $each: request.body.services
                    }
                }
            }
        )

        response.status(200).send(post)
    }catch(error){
        response.status(500).send(error)
    }
})

router.post('/api/usage_service/init', async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const service_usage = database.collection('service_usage');

        console.log("request.body", request.body)

        const post = await service_usage.insertOne(request.body)

        response.status(200).send(post)
    }catch(error){
        response.status(500).send(error)
    }
})

router.post('/api/usage_service/delete/:id', async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const service_usage = database.collection('service_usage');

        console.log("request.body", request.body)

        const post = await service_usage.deleteOne({'_id': new ObjectId(request.params.id)})

        response.status(200).send(post)
    }catch(error){
        response.status(500).send(error)
    }
})

module.exports = router


