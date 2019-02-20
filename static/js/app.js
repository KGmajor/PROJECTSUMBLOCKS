
const enteredWallets = []

  function handleFormSubmission () {
    $('#wallet_add').on('submit', (evt) => {
      evt.preventDefault();
      // console.log('Event cancelled');
      // const enteredWallets = []
      let walletId = document.getElementById("wallet_id").value;
      let alias = document.getElementById("alias").value;

      if (enteredWallets.includes(walletId) === true) {
        const errorMessage = document.getElementById('error_alert');
        errorMessage.classList.remove("d-none");
        document.getElementById('wallet_id').value='';
      }
        else {
          enteredWallets.push(walletId);
          const errorMessage = document.getElementById('error_alert');
          errorMessage.classList.add("d-none");
          $.get('/wallet-processing.json?wallet_id=' + walletId, (response) => {
            const results = response;
            console.log("Results", results);
            handleJsonResponse(results);

            const resultsTable = document.getElementById('wallets_table');
            resultsTable.classList.remove("d-none");
            document.getElementById('wallet_id').value='';
          });
        };
    })
  }
  function handleJsonResponse (results) {
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
