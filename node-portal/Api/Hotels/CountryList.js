const { dbConnect } = require("../../common/dbConnect")
let status, data

exports.getCountries = async (request) => {
    try {
        const connection = await dbConnect()
        const aggregationToGetCountryNames = [
          {
            $project: {
              name: 1,
            },
          },
        ];
        // let countries = await connection.db.collection("countries").find().toArray()
        let countries = await connection.db
          .collection("countries")
          .aggregate(aggregationToGetCountryNames)
          .toArray();
          // console.log(countries,"countries")
        countries.length > 0 ? status = true : status = false
        status == true ? data = countries : data = countries
        await connection.client.close()
    } catch (error) {
        status = false
        data = error
    }
    let response = { status, data }
    return response
}
