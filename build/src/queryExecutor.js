"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryExecutor = void 0;
const tedious_1 = require("tedious");
const apiConfig_json_1 = __importDefault(require("../apiConfig.json"));
class QueryExecutor {
    constructor() {
        // Create connection to database
        this.config = {
            authentication: {
                options: {
                    userName: apiConfig_json_1.default.sql.username,
                    password: apiConfig_json_1.default.sql.password
                },
                type: "default"
            },
            server: apiConfig_json_1.default.sql.server,
            options: {
                database: apiConfig_json_1.default.sql.database,
                encrypt: true
            }
        };
        this.connection = new tedious_1.Connection(this.config);
    }
    // Attempt to connect and execute queries if connection goes through
    onConnection(query) {
        this.connection.on("connect", (err) => {
            if (err) {
                console.log('here');
                console.error(err.message);
            }
            else {
                this.queryDatabase(query);
            }
        });
    }
    queryDatabase(query) {
        // Read all rows from table
        const request = new tedious_1.Request(query, (err, rowCount) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log(`${rowCount} row(s) returned`);
            }
        });
        request.on("row", (columns) => {
            columns.forEach((column) => {
                console.log("%s\t%s", column.metadata.colName, column.value);
            });
        });
        this.connection.execSql(request);
    }
}
exports.QueryExecutor = QueryExecutor;
