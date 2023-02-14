import CarrierManager from '../managers/carrier.manager';

module.exports = {  
    carrierCreate: carrierCreate,
    getCarrier: getCarrier,
    editCarrier: editCarrier,
    getSenderDetail: getSenderDetail,
    requestSender: requestSender,
    getAllCarrier: getAllCarrier,
    carrierStatus: carrierStatus,
    carrierAccept: carrierAccept,
    pickupLocation: pickupLocation
};


function carrierCreate(req, res, next) {    
  CarrierManager.carrierCreate(req,function(err, data) {
    handler(err, data, res, next)
});
}

function getCarrier(req, res, next) {    
  CarrierManager.getCarrier(req,function(err, data) {
    handler(err, data, res, next)
});
}

function editCarrier(req, res, next) {    
  CarrierManager.editCarrier(req,function(err, data) {
    handler(err, data, res, next)
});
}

function getSenderDetail(req, res, next) {    
  CarrierManager.getSenderDetail(req,function(err, data) {
    handler(err, data, res, next)
});
}

function requestSender(req, res, next) {    
  CarrierManager.requestSender(req,function(err, data) {
    handler(err, data, res, next)
});
}


function getAllCarrier(req, res, next) {    
  CarrierManager.getAllCarrier(req,function(err, data) {
    handler(err, data, res, next)
});
}

function carrierStatus(req, res, next) {    
  CarrierManager.carrierStatus(req,function(err, data) {
    handler(err, data, res, next)
});
}

function carrierAccept(req, res, next) {    
  CarrierManager.carrierAccept(req,function(err, data) {
    handler(err, data, res, next)
});
}

function pickupLocation(req, res, next) {    
  CarrierManager.pickupLocation(req,function(err, data) {
    handler(err, data, res, next)
});
}


function handler(err, data, res, next){
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    res.status(data.code).json({data: data.data});
  }
  