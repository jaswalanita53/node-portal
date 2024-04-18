const { dbConnect } = require("../../common/dbConnect");

exports.getAllProperties = async () => {
    try {
        const connection = await dbConnect();
        const properties = await connection.db.collection("propertyDetails").find().toArray();
        const status = properties.length > 0;
        const data = status ? properties.map(value => ({ id: value._id, propertyName: value.propertyName })) : properties;
        return { status, data };
    } catch (error) {
        return { status: false, data: error.message };
    }
};