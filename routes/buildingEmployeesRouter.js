const express = require("express")
const { MongoClient } = require('mongodb');
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/building_employees/", async(request, response)=> {
    try{
        await client.connect();

        const database = client.db('office_management');
        const building_employees = database.collection('building_employees');

        const page = parseInt(request.query.page) || 1;  // Current page, default to 1
        const limit = parseInt(request.query.limit) || 10;  // Number of items per page, default to 10
        const skip = (page - 1) * limit;

        const post = await building_employees.find()
            .skip(skip)  // Skip items based on the page
            .limit(limit)  // Limit the number of items per page
            .toArray();


        const total_be = await building_employees.countDocuments();
        // Return the list of companies as JSON
        response.json({
            data: post,
            currentPage: page,
            totalPages: Math.ceil(total_be / limit),
            totalCompanies: total_be,
            limit: limit
        });

    }catch(error){
        response.status(500).send(error)
    }
})

router.put("/api/building_employees/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const building_employees = database.collection('building_employees');

        const { name, identity_number,birth_date, address, phone_number, base_salary, revenue } = request.body

        const result = await building_employees.updateOne(
            { employee_id: Number(request.params.id) },
            {
                $set: {
                    name: name,
                    identity_number: identity_number,
                    birth_date: birth_date,
                    address: address,
                    phone_number: phone_number,
                    base_salary: base_salary,
                    revenue: revenue
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

router.delete("/api/building_employees/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const building_employees = database.collection('building_employees');

        const result = await building_employees.deleteOne({employee_id : Number(request.params.id)})
        if (result.deletedCount === 1) {
            response.status(200).send("Deleted successfully!")
        } else {
            response.status(404).send("Service not found")
        }
    }catch(error){
        response.status(500).send(error)
    }
})

router.post("/api/building_employees", async(request, response)=> {

    try{
        await client.connect();
        const database = client.db('office_management');
        const building_employees = database.collection('building_employees');
        const counters = database.collection('counters');

        const result = await counters.findOneAndUpdate(
            { id: "building_employee" },
            { $inc: { value: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        const post = await building_employees.insertOne({...request.body, employee_id: result.value})

        response.status(200).send(post)
    }catch(error){
        response.status(500).send(error)
    }
})

module.exports = router
