import DirectionalManager from '../managers/directional_content.manager';

module.exports = {
 create: create,
 get: get,
 edit: edit,
 deleteContent: deleteContent
};

function create(req, res, next) {    
    DirectionalManager.create(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function get(req, res, next) {    
    DirectionalManager.get(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function edit(req, res, next) {    
    DirectionalManager.edit(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function deleteContent(req, res, next) {    
    DirectionalManager.deleteContent(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function handler(err, data, res, next){
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    res.status(data.code).json({data: data.data});
  }