const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true
    },
    roomTypeId: {
        type: String,
        required: true
    },
    roomNumber: {
        type: Number,
        required: true,
        unique:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Maintenance = mongoose.model('maintenance', maintenanceSchema);

module.exports = Maintenance;