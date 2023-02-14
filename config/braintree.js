var braintree = require('braintree');

const gateway = braintree.connect({
    environment: braintree.Environment['Sandbox'],
    merchantId: '4fxzv39cxc3dvvcf',
    publicKey: '5x9mszzyy4yg8k9d',
    privateKey: '76b74fb3c4cc72fd89b3b4c536502df8'
  });
  
//   gateway.merchantAccount.all(function (err, merchantAccounts) {
//     merchantAccounts.forEach(function (merchantAccount) {
//       console.log(merchantAccount.currencyIsoCode);
//     });

// gateway.customer.create({
//     firstName: "Christina",
//     lastName: "Divya",
//     email: "p.christinadivya@gmail.com",
//     phone: "312.555.1234",
//     fax: "614.555.5678",

//   }, function (err, result) {
//     console.log(result.success);
//     // true
//     console.log(result.customer.id);
//     // e.g. 494019
//   });

//   gateway.customer.find("862644031", function(err, customer) {
//       console.log(customer.paymentMethods);
// })
module.exports.paymentModel = function(data, callback) {
    console.log("data");
//   gateway.transaction.sale({
//         amount: data.amount,
//         paymentMethodNonce: data.method,
//         options: {
//           submitForSettlement: true
//         }
//       }, function (err, result) {
//           console.log(result);
//       });

merchantAccountParams = {
    individual: {
      firstName: "Divya",
      lastName: "",
      email: "christinadivyaphilips@gmail.com",
      phone: "5553334444",
      dateOfBirth: "1981-11-19",
      ssn: "456-45-4567",
      address: {
        streetAddress: "111 Main St",
        locality: "Chicago",
        region: "IL",
        postalCode: "60622"
      }
    },
    business: {
      legalName: "Braintree testing",
      dbaName: "Braintree",
      taxId: "98-7654321",
      address: {
        streetAddress: "111 Main St",
        locality: "Chicago",
        region: "IL",
        postalCode: "60622"
      }
    },
    funding: {
      descriptor: "Market Place",
      destination: "HDFC",
      email: "p.christinadivya@gmal.com",
      mobilePhone: "5555555555",
      accountNumber: "1123581321",
      routingNumber: "071101307"
    },
    tosAccepted: true,
    masterMerchantAccountId: "braintree",
    id: "Braintree"
  };
  
  gateway.merchantAccount.create(merchantAccountParams, function (err, result) {
      console.log(result)
  });
//   gateway.paymentMethod.create({
//     customerId: "12345",
//     paymentMethodNonce: nonceFromTheClient
//   }, function (err, result) { });
 }  