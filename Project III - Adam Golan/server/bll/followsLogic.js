const dal = require ('../dal/dal');
async function getAllFollows(){
    const sql = `select userID as uID, vacID as vID from traceFollowers`;
    return await dal.execute(sql);
}
async function getDesignatedFollows(id){
    const sql = `select vacID as vID from traceFollowers where userID = ${id}`;
    return await dal.execute(sql);
}
async function adddFollow(follow){
    const sql = `insert into traceFollowers(userID, vacID) values(${follow.uID}, ${follow.vID})`;
    await dal.execute(sql);
}
async function deleteFollow(follow){
    const sql = `delete from traceFollowers where userID = ${follow.uID} and vacID = ${follow.vID}`;
    await dal.execute(sql);
}
async function deleteDesignatedFollows(id){
    const sql = `delete from traceFollowers where vacID = ${id}`;
    await dal.execute(sql);
}
module.exports={
    getAllFollows,
    getDesignatedFollows,
    adddFollow,
    deleteFollow,
    deleteDesignatedFollows
}