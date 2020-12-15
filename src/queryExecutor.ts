const sql = require('mssql')

export const sqlQuery = async (queryString: string) => {
        await sql.connect('mssql://User:User123@User/AbcBank')
        const result = await sql.query(queryString);
        console.log(result)
        return result;
}