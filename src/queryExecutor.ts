import { Connection, Request } from "tedious";
import apiConfig from '../apiConfig.json';

export class QueryExecutor {
    // Create connection to database
    config = {
        authentication: {
            options: {
                userName: apiConfig.sql.username,
                password: apiConfig.sql.password
            },
            type: "default"
        },
        server: apiConfig.sql.server,
        options: {
            database: apiConfig.sql.database,
            encrypt: true
        }
    };

    connection = new Connection(this.config);

    
    constructor() { }

    // Attempt to connect and execute queries if connection goes through
    onConnection(query: string) {
        this.connection.on("connect", (err: any) => {
            if (err) {
                console.log('here')
                console.error(err.message);
            } else {
                this.queryDatabase(query);
            }
        });
    }

    queryDatabase(query: string) {
        // Read all rows from table
        const request = new Request(query,
            (err: any, rowCount: any) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log(`${rowCount} row(s) returned`);
                }
            }
        );

        request.on("row", (columns: any) => {
            columns.forEach((column: any) => {
                console.log("%s\t%s", column.metadata.colName, column.value);
            });
        });
        this.connection.execSql(request);
    }
}