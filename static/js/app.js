
  function handleFormSubmission () {
    $('#wallet_add').on('submit', (evt) => {
      evt.preventDefault();
      // console.log('Event cancelled');

      let walletId = document.getElementById("wallet_id").value;
      let alias = document.getElementById("alias").value;
      // console.log(walletId);
    
      $.get('/wallet-processing.json?wallet_id=' + walletId, (response) => {
        const results = response;
        console.log("Results", results);
        handleJsonResponse(results);

        const resultsTable = document.getElementById('results_table');
        resultsTable.classList.remove("d-none");
        document.getElementById('wallet_id').value='';
      });
    });
  }
  function handleJsonResponse (results) {
    // for (let [key, value] of Object.entries(results)) {
    //   console.log(key, value);
    //   for (let [innerKey, innerValue] of Object.entries(value)){
    //     console.log(innerKey, innerValue)
    //     $('#show-results').html('please work ' + innerKey + innerValue)
    //   };
    // };
    const wallets = results.wallets;
    if (wallets.length === 0) return;
    const walletListEl = document.getElementById('wallet_list');
    wallets.forEach((walletAddress) => {
      // construct a <li> node
      const li = document.createElement('li');
      // Set the text content
      li.textContent = walletAddress;
      // append it to walletListEl
      walletListEl.appendChild(li);
    });
  }

  handleFormSubmission();
