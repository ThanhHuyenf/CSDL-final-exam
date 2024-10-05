const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema({
    office_id: {
        type: String
    },
    office_number: {
        type: String
    },
    square: {
        type: Number
    },
    status: {
        type: Boolean
    }
});

const OfficeModel = mongoose.model('companies', officeSchema);
module.exports = OfficeModel;