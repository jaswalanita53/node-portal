const { dbConnect } = require("../../common/dbConnect");

exports.getAutomatedReports = async () => {
    try {
        const connection = await dbConnect();
        const generatedReports = await connection.db.collection("automatedReport").find().toArray();
        const status = generatedReports.length > 0;
        const response = { status, data: generatedReports };
        return response;
    } catch (error) {
        const response = { status: false, data: error };
        return response;
    }
};