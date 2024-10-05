const express = require("express")
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router()

const client = new MongoClient("mongodb+srv://Admin123456:Admin123456@cluster0.o4ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
router.get("/api/employees/:companyId", async(request, response)=> {
    try{
        await client.connect();

        const database = client.db('office_management');
        const employees = database.collection('employees');
        const activeEmployeesCount = (await employees.find({
            company_id: request.params.companyId,
            $or: [
                { end_date: null },
                { end_date: "" },
                { $expr: { $gt: [ { $toDate: "$end_date" }, new Date() ] } }
            ]
        }).toArray())
            .length;

        const post = await employees.find({'company_id': request.params.companyId}).toArray()

        response.send({
            data: post,
            total: post.length,
            active_employee: activeEmployeesCount})
    }catch(error){
        response.status(500).send(error)
    }
})

router.post("/api/employees", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const employees = database.collection('employees');
        const counters = database.collection('counters');

        const { company_id, name, identity_card, birth_date, start_date, end_date, phone_number } = request.body

        const r = await counters.findOneAndUpdate(
            { id: "employee" },
            { $inc: { value: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        const result = await employees.insertOne({
            access_card: r.value,
            company_id: company_id,
            name: name,
            identity_card: identity_card,
            birth_date: birth_date,
            phone_number: phone_number,
            start_date: start_date,
            end_date: end_date
        })
        console.log("result", result)

        const post = await employees.insertOne(result)

        const company = await database.collection('companies').findOne({'_id': new ObjectId(company_id)})
        await database.collection('companies').updateOne(
            { '_id': new ObjectId(company_id) },
            { $set: { employee_count: company.employee_count + 1 } }
        )

        response.status(200).json({
            message: "Employee added successfully",
            data: result,
            status: 200
        })
    }catch(error){
        response.status(500).send(error)
    }
})

router.delete("/api/employees/:id", async(request, response)=> {
    try{
        await client.connect();
        const database = client.db('office_management');
        const employees = database.collection('employees');
        const companies = database.collection('companies');

        const employee = await employees.findOne({'_id': new ObjectId(request.params.id)})
        const company_id = employee.company_id

        const result = await employees.deleteOne({'_id' : new ObjectId(request.params.id)})
        if (result.deletedCount === 1) {
            response.status(200).send("Deleted successfully!")

            const company = await database.collection('companies').findOne({_id: new ObjectId(company_id)})
            await database.collection('companies').updateOne(
                { '_id': new ObjectId(company_id) },
                { $set: { employee_count: company.employee_count - 1 } }
            )

        } else {
            response.status(404).send("Employee not found")
        }
    }catch(error){
        response.status(500).send(error)
    }
})



module.exports = router
