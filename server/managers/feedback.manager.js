import Schema from '../../../config/mysql.js';
import User from '../models/user.model';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Request from '../models/request.model';
import Rating from '../../server/models/ratings.model';
import Rated from '../../server/models/rated.model';
import FeedbackReport from '../../server/models/feedback_reports.model';
import Notifications from '../../server/models/notifications.model';
import pick from 'lodash.pick';
import async from 'async';



function create(req, callback) { 
    let setQuery;
    req.body.report_from = req.user.id;
    console.log(req.body.report_from)
    if(req.body.flag == 1 ) {
        req.body.sender_id = 1;    
    } else if(req.body.flag == 2 ) {
        req.body.carrier_id = 1;    
    }else if(req.body.flag == 3 ) {
        req.body.receiver_id = 1;
    }  
    async.waterfall([
        function(done){
            let rated_params = pick(req.body, ['request_id','report_from', 'sender_id', 'carrier_id', 'receiver_id'])  
            Rated.where({ request_id: req.body.request_id, report_from: req.user.id }).fetch().then((rated) => {
            console.log("^^", rated)
           if(rated != null) {
                rated.save(rated_params, { patch: true }).then((update) => {
                console.log("Updated Rated");
                done();
            })
           }
            else {
                Rated.forge(rated_params).save().then((rated) => {
                console.log("%%%", rated)
                console.log("Newly Rated");
                done();
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        }
   
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
              
}],function(err,done) {
    let ratings_params = pick(req.body, ['report_from', 'report_to', 'request_id', 'promptness', 'adherence_to_dates',
              'user_behaviour', 'parcel_contents_as_sent', 'comments'])
            Rating.forge(ratings_params).save().then ((report) => {
                if(report){ 
                    setQuery = `CALL rate(`+report.attributes.id+`)`
                    setQuery = setQuery.toString();     
                    console.log(setQuery);            
                    Schema.Bookshelf.knex.raw([setQuery]).then((response) => { 
                    var jsonString = JSON.stringify(response[0][0]);
                    var finalObject = JSON.parse(jsonString);
                    console.log(finalObject[0].average)
                    report.save({ average: finalObject[0].average }).then ((averageUpdated) =>{
                        setQuery = `SELECT round(Avg(average)) as average from ratings where report_to = `+report.attributes.report_to;
                        setQuery = setQuery.toString();     
                        console.log(setQuery);            
                        Schema.Bookshelf.knex.raw([setQuery]).then((response) => { 
                        var jsonString = JSON.stringify(response[0][0]);
                        var finalObject = JSON.parse(jsonString);
                        console.log(finalObject)
                        User.where({ id: req.body.report_to }).save({ ratings: finalObject.average }, { patch: true }).then ((userRating) => {
                            console.log(userRating)
                       })
                    })
                    })
               
                    })
                 callback(null, { code: responseCode.ok,  data: report  })
                }
                else{
                  callback({ message: e, code: responseCode.badRequest }, null)
                  
                }          
    })
})
   
}


function createReport (req,callback) {
        req.body.report_from = req.user.id;
        FeedbackReport.forge(req.body).save().then ((feedback) => {
            if(feedback){
                FeedbackReport.where({ id: feedback.attributes.id }).fetchAll({ withRelated: ['report_to','feedback'] }).then ((feedbacks) => {
                    Notifications.forge({ message: "User has been sent a report", to_user_id: config.config.admin_id, user_id: req.user_id, notification_type: 15, feedback_id: feedback.attributes.id }).save()
                    .then((notification) => {
                        console.log('Admin Notifications saved');
                  }).catch(e => console.log(e))
                    callback(null, { code: responseCode.ok,  data: feedbacks  })
                }) 
            }
    })   
}

export default { create, createReport }