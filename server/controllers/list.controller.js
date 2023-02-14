import ListManager from '../managers/list.manager';

module.exports = {  
  weightDetails: weightDetails,
  containerDetails: containerDetails,
  statusDetails: statusDetails,
  termsCondition: termsCondition,
  roles: roles,
  feedbackList: feedbackList,
  faqList: faqList,
  aboutUs: aboutUs,
  rejectList: rejectList,
  countryCode: countryCode ,
  notificationType: notificationType,
  DirectionalContent: DirectionalContent,
  rejectListALL: rejectListALL
};


function weightDetails(req, res, next) {    
  ListManager.weightDetails(req,function(err, data) {
    handler(err, data, res, next)
});
}

function containerDetails(req, res, next) {    
    ListManager.containerDetails(req,function(err, data) {
        handler(err, data, res, next)
    });
}

function statusDetails(req, res, next) {    
  ListManager.statusDetails(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function termsCondition(req, res, next) {    
  ListManager.termsCondition(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function roles(req, res, next) {    
  ListManager.roles(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function feedbackList(req, res, next) {    
  ListManager.feedbackList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function rejectList(req, res, next) {    
  ListManager.rejectList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function rejectListALL(req, res, next) {    
  ListManager.rejectListALL(req,function(err, data) {
    handler(err, data, res, next)
});
}

function faqList(req, res, next) {    
  ListManager.faqList(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function aboutUs(req, res, next) {    
  ListManager.aboutUs(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function notificationType(req, res, next) {    
  ListManager.notificationType(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function countryCode(req, res, next) {    
  ListManager.countryCode(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function DirectionalContent(req, res, next) {    
  ListManager.DirectionalContent(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function handler(err, data, res, next){
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    res.status(data.code).json({data: data.data});
  }
  