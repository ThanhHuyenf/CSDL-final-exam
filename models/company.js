const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    company_id: {
        type: String
    },
    name: {
        type: String
    },
    tax_code: {
        type: String
    },
    charter_capital: {
        type: String
    }, //Vốn điều lệ
    industry: {
        type: String
    },
    representative: {
        type: String
    }, //nguoi dai dien cong ty lam viec voi toa nha
    phone_number: {
        type: String
    },
    employee_count: {
        type: Number
    },
    buildingAddress: {
        floor: {
            type: String
        }, // Tầng
        officeNumber: {
            type: String
        }, // Số phòng
        office_area: {
            type: String
        },  // Diện tích mặt bằng
    },
});

const CompanyModel = mongoose.model('companies', companySchema);
module.exports = CompanyModel;