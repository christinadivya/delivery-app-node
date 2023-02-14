import FeedbackManager from '../managers/feedback.manager';

module.exports = {
  create: create,
  createReport: createReport
};

function create(req, res, next) {    
    FeedbackManager.create(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}


function createReport(req, res, next) {    
  FeedbackManager.createReport(req,function(err, data) {
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