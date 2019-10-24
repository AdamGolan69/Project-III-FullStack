const dal = require ('../dal/dal');
async function getUserNames(){
    const sql = `select userName as user from users`;
    return await dal.execute(sql);
}
async function getOneUser(user){
    const sql = `select userID as id, userType as type, firstName, lastName, userName as user, password as pass, if(userConnected = 1, "true", "false") as connected, userSock as socket from users where userName = '${user}'`;
    return await dal.execute(sql);
}
async function updateUser(user){
    const sql = `update users set userConnected = ${JSON.parse(user.connected)} where userName = '${user.user}'`;
    return await dal.execute(sql);
}
async function addUser(user){
    const sql = `insert into users(userType, firstName, lastName, userName, password, userConnected) values('user', '${user.firstName}', '${user.lastName}', '${user.user}', '${user.pass}', ${user.connected})`;
    const info = await dal.execute(sql);
    user.id = info.insertId;
    return user;
}
async function socketUpdateUser(user){
    const sql = `update users set userSock = '${user.socket}' where userName = '${user.user}'`;
    return await dal.execute(sql);
}
async function socketDisconnectUser(socket){
    const sql = `update users set userConnected = false, userSock = '' where userSock = '${socket}'`;
    return await dal.execute(sql);
}
module.exports = {
    getUserNames,
    getOneUser,
    updateUser,
    addUser,
    socketUpdateUser,
    socketDisconnectUser
}