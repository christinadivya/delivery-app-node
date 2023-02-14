import PostManager from '../managers/post.manager';

module.exports = {  
   asSender: asSender,
   asCarrier: asCarrier,
   asReceiver: asReceiver,
   senderRequest: senderRequest,
   carrierRequest: carrierRequest,
   detailView: detailView,
   filterSenderRequest: filterSenderRequest,
   invite: invite,
   contactUs: contactUs
  };
  
  
function asSender(req, res, next) {    
    PostManager.asSender(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function asCarrier(req, res, next) {    
    PostManager.asCarrier(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function asReceiver(req, res, next) {    
    PostManager.asReceiver(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function senderRequest(req, res, next) {    
    PostManager.senderRequest(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function carrierRequest(req, res, next) {    
    PostManager.carrierRequest(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function detailView(req, res, next) {    
    PostManager.detailView(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function filterSenderRequest(req, res, next) {    
  PostManager.filterSenderRequest(req,function(err, data) {
      handler(err, data, res, next)
  });
  }

function invite(req, res, next) {    
    PostManager.invite(req,function(err, data) {
        handler(err, data, res, next)
    });
}

function contactUs(req, res, next) {    
    PostManager.contactUs(req,function(err, data) {
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
  