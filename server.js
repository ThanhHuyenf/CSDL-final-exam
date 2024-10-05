const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const companyRouter = require('./routes/companyRouter');
const officeRouter = require('./routes/officeRouter')
const employeeRouter = require('./routes/employees');
const serviceRouter = require('./routes/serviceRouter');
const buildingEmployeesRouter = require('./routes/buildingEmployeesRouter');
const accessLogRouter = require('./routes/accessLogRouter');

dotenv.config();
// connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(companyRouter)
app.use(officeRouter)
app.use(employeeRouter);
app.use(serviceRouter)
app.use(buildingEmployeesRouter)
app.use(accessLogRouter)

app.get('/', function(red, res){
    res.send("Server is working!");
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
