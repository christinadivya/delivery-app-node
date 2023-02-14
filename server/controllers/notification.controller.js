import NotificationManager from '../managers/notification.manager';

module.exports = {
  notifyStatus: notifyStatus,
  updateStatus: updateStatus,
  getDetail: getDetail,
  count: count,
  lastestNotification: lastestNotification
};

function notifyStatus(req, res, next) {    
  NotificationManager.notifyStatus(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}

function lastestNotification(req, res, next) {    
  NotificationManager.lastestNotification(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}

function updateStatus(req, res, next) {    
  NotificationManager.updateStatus(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}

function getDetail(req, res, next) {    
  NotificationManager.getDetail(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}

function count(req, res, next) {    
  NotificationManager.count(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}


function handler(err, data, res, next) {
    console.log(data)
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
  }