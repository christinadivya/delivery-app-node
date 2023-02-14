
import Schema from '../../config/mysql.js';
import Request from '../models/request.model';

const Rated =Schema.Bookshelf.Model.extend({
    tableName: 'rated',
    hasTimestamps: true,

    request_id: function() {
        return this.belongsTo('Requset','request_id');

    }
})

module.exports = Schema.Bookshelf.model('Rated', Rated);
