import LocationManager from '../managers/location.manager';

module.exports = {
  location: location,
  getLocation: getLocation
  
};

function location(req, res, next) {    
  LocationManager.location(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}


function getLocation(req, res, next) {    
  LocationManager.getLocation(req,function(err, data) {
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