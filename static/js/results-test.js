"use strict";

// function handleAddressSubmission() {
//   $('#initial-wallet').on('submit', (evt) => {
//     evt.preventDefault();

//     const formInputs = {
//       'address': $('#wallet_id').val(),
//       'alias': $('#alias').val()
//     };

//     $.post('/wallet_processing', formInputs, (results) => {
//       alert(results);
//       getWalletInfo();
//     });
//   });
// }



function getWalletInfo() {
$.get('/active', (results) => {
const walletJSON = results;
console.log('working')

$('#testing-results').html(walletJSON);
});
}


// handleAddressSubmission();

