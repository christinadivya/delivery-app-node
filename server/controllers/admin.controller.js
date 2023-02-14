import AdminManager from '../managers/admin.manager';

module.exports = {
 viewUsers: viewUsers,
 createUsers: createUsers,
 activateUsers: activateUsers,
 deleteUser: deleteUser,
 editUser: editUser,
 verifyUser: verifyUser,
 getUser: getUser,
 viewReport: viewReport,
 reviewReport: reviewReport,
 viewShipment: viewShipment,
 label: label,
 getShipment: getShipment,
 createCommission: createCommission,
 getCommission: getCommission,
 editCommission: editCommission,
 announcement: announcement,
 viewReject: viewReject,
 notifyStatus: notifyStatus,
 getDetail: getDetail,
 changePassword: changePassword,
 count: count,
 updateStatus: updateStatus,
 getProfile: getProfile,
 editProfile: editProfile,
 editTransaction: editTransaction,
 getTransaction: getTransaction,
 containerDetails: containerDetails
};

function viewUsers(req, res, next) {    
    AdminManager.viewUsers(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function count(req, res, next) {    
    AdminManager.count(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function containerDetails(req, res, next) {    
    AdminManager.containerDetails(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function notifyStatus(req, res, next) {    
    AdminManager.notifyStatus(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function updateStatus(req, res, next) {    
    AdminManager.updateStatus(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function changePassword(req, res, next) {    
    AdminManager.changePassword(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function getDetail(req, res, next) {    
    AdminManager.getDetail(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function viewReject(req, res, next) {    
    AdminManager.viewReject(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function createUsers(req, res, next) {    
    AdminManager.createUsers(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function activateUsers(req, res, next) {    
    AdminManager.activateUsers(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function deleteUser(req, res, next) {    
    AdminManager.deleteUser(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function editUser(req, res, next) {    
    AdminManager.editUser(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function verifyUser(req, res, next) {    
    AdminManager.verifyUser(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function getUser(req, res, next) {    
    AdminManager.getUser(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function viewReport(req, res, next) {    
    AdminManager.viewReport(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function reviewReport(req, res, next) {    
    AdminManager.reviewReport(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function viewShipment(req, res, next) {    
    AdminManager.viewShipment(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function getShipment(req, res, next) {    
    AdminManager.getShipment(req, function(err, data) {
        handler(err, data, res, next)
    });
}


function label(req, res, next) {    
    AdminManager.label(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function createCommission(req, res, next) {    
    AdminManager.createCommission(req, function(err, data) {
        handler(err, data, res, next)
    });
}


function getCommission(req, res, next) {    
    AdminManager.getCommission(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function editCommission(req, res, next) {    
    AdminManager.editCommission(req, function(err, data) {
        handler(err, data, res, next)
    });
}


function announcement(req, res, next) {    
    AdminManager.announcement(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function editProfile(req, res, next) {    
    AdminManager.editProfile(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function getProfile(req, res, next) {    
    AdminManager.getProfile(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function getTransaction(req, res, next) {    
    AdminManager.getTransaction(req, function(err, data) {
        handler(err, data, res, next)
    });
}
function editTransaction(req, res, next) {    
    AdminManager.editTransaction(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function handler(err, data, res, next) {
    console.log(err)
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
}