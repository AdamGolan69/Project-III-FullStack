const mysql = require("mysql");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "vk",
    timezone: 'UTC'
});
connection.connect(err => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Connected to VK");
});
function execute(sql) {
    return new Promise((res, rej) => {
        connection.query(sql, (err, result) => {
            if (err) {
                rej(err);
                return;
            }
            res(result);
        });
    });
}
module.exports = { execute };