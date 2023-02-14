// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : '52.45.171.205',
//     port: 3306,
//     user     : 'root',
//     password : 'db@dm1n',
//     database : 'fetch39',
//     charset  : 'utf8mb4',
//     multipleStatements: true
//   }
//  });


// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : '52.45.171.205',
//     port: 3306,
//     user     : 'root',
//     password : 'db@dm1n',
//     database : 'fetch39test',
//     charset  : 'utf8mb4',
//     multipleStatements: true
//   }
// });

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '172.31.20.177',
    port: 3306,
    user     : 'fetch39',
    password : 'Opt!dev_$%^_!@#',
    database : 'fetch39',
    charset  : 'utf8mb4',
    multipleStatements: true
  }
});

// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : 'localhost',
//     port: 3306,
//     user     : 'root',
//     password : 'root',
//     database : 'fetch39',
//     charset  : 'utf8mb4',
//     multipleStatements: true
//   }
// });

const Bookshelf = require('bookshelf')(knex);
const cascadeDelete = require('bookshelf-cascade-delete');


Bookshelf.plugin(['registry', 'visibility', 'virtuals', 'pagination', cascadeDelete]);

exports.Bookshelf = Bookshelf;
