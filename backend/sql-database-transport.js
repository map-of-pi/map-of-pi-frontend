const sql = require('mssql');
const TransportStream = require('winston-transport');

// custom Transport for Winston logging
module.exports = class SQLDatabaseTransport extends TransportStream {
    constructor(options) {
        super(options);
        this.pool = options.pool;
    }

    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        try {
            // extract log data from from object accordingly
            const { timestamp, level, message } = info;

            // insert log messages into the database
            await this.pool.request()
                .input('id', sql.VarChar, timestamp)
                .input('logLevel', sql.VarChar, level)
                .input('logMessage', sql.NVarChar, message)
                .query('INSERT INTO dbo.Server_Side_Logs (id, logLevel, logMessage) VALUES (@id, @logLevel, @logMessage)');
        } catch (error) {
            console.error('Failed to write logging records into SQL Database:', error);
        }

        if (callback) {
            callback();
        }
    }
}
