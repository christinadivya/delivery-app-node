import ShipmentManager from '../managers/shipment.manager';

module.exports = {  
    senderShipment: senderShipment,
    getShipment: getShipment,
    getAllShipment: getAllShipment,
    editShipment: editShipment,
    updatePackage: updatePackage,
    addPackage: addPackage,
    deletePackage: deletePackage,
    pickupLocation: pickupLocation,
    requestCarrier: requestCarrier,
    senderAccept: senderAccept,
    uploadDocument: uploadDocument,
    uploadImage: uploadImage

};


function senderShipment(req, res, next) {    
  ShipmentManager.senderShipment(req,function(err, data) {
    handler(err, data, res, next)
});
}

function uploadDocument(req, res, next) {    
  ShipmentManager.uploadDocument(req,function(err, data) {
    handler(err, data, res, next)
});
}

function uploadImage(req, res, next) {    
  ShipmentManager.uploadImage(req,function(err, data) {
    handler(err, data, res, next)
});
}

function getShipment(req, res, next) {    
  ShipmentManager.getShipment(req,function(err, data) {
    handler(err, data, res, next)
});
}

function getAllShipment(req, res, next) {    
  ShipmentManager.getAllShipment(req,function(err, data) {
    handler(err, data, res, next)
});
}


function editShipment(req, res, next) {    
  ShipmentManager.editShipment(req,function(err, data) {
    handler(err, data, res, next)
});
}

function updatePackage(req, res, next) {    
  ShipmentManager.updatePackage(req,function(err, data) {
    handler(err, data, res, next)
});
}

function addPackage(req, res, next) {    
  ShipmentManager.addPackage(req,function(err, data) {
    handler(err, data, res, next)
});
}

function deletePackage(req, res, next) {    
  ShipmentManager.deletePackage(req,function(err, data) {
    handler(err, data, res, next)
});
}

function pickupLocation(req, res, next) {    
  ShipmentManager.pickupLocation(req,function(err, data) {
    handler(err, data, res, next)
});
}

function requestCarrier(req, res, next) {    
  ShipmentManager.requestCarrier(req,function(err, data) {
    handler(err, data, res, next)
});
}

function senderAccept(req, res, next) {    
  ShipmentManager.senderAccept(req,function(err, data) {
    handler(err, data, res, next)
});
}





function handler(err, data, res, next){
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    res.status(data.code).json({data: data.data});
  }
  