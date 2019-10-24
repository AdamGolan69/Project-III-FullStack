const dal = require('../dal/dal');
async function getAllVacations() {
    const sql = `select vacID as id, vacDest as destination, vacDesc as description, startDate as sDate, endDate as eDate, vacPrice as price from vacations`;
    return await dal.execute(sql);
}
async function addVacation(vacation) {
    const sql = `insert into vacations(vacDest, vacDesc, startDate, endDate, vacPrice) values('${vacation.destination}', '${vacation.description}', '${vacation.sDate}', '${vacation.eDate}', ${vacation.price})`;
    await dal.execute(sql);
}
async function updateVacation(vacation) {
    const sql = `update vacations set vacDest = '${vacation.destination}', vacDesc = '${vacation.description}', startDate = '${vacation.sDate}', endDate = '${vacation.eDate}', vacPrice = '${vacation.price}' where vacID = ${vacation.id}`;
    return await dal.execute(sql);
}
async function deleteVacation(id) {
    const sql = `delete from vacations where vacID = ${id}`;
    return await dal.execute(sql);
}
setInterval(async () => {
    const vacations = await getAllVacations();
    const pastDueDate = vacations.filter(v => {
        if (v.sDate.getFullYear() === new Date().getFullYear() || v.eDate.getFullYear() === new Date().getFullYear()) {
            if (v.sDate.getMonth() === new Date().getMonth() || v.eDate.getMonth() === new Date().getMonth()) {
                if (v.sDate.getDate() <= new Date().getDate() || v.eDate.getDate() <= new Date().getDate()) {
                    return v;    
                }
            }
        }
    })
    for(const item of pastDueDate){
        deleteVacation(item.id);
    }
}, 86400010);
module.exports = {
    getAllVacations,
    addVacation,
    updateVacation,
    deleteVacation
}