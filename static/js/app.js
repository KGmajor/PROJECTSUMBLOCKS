
const enteredWallets = []

  function handleFormSubmission () {
    $('#wallet_add').on('submit', (evt) => {
      evt.preventDefault();
      
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
    const ethCoins = results.eth_coins;
    const coinsToConvert = results.eth_coins;
    const rates = results.rates;

    handleCoins(ethCoins);
    handleWallets(wallets);
    handleConversion(coinsToConvert, rates)
    
    function handleCoins (ethCoins) {
      if (ethCoins.length === 0) return;
      const coinListEl = document.getElementById('coins_list');
      Object.keys(ethCoins).forEach((coin) => {
        const li = document.createElement('li');
        li.textContent = coin;
        coinListEl.appendChild(li);
      });
    }

    function handleConversion (coinsToConvert, rates) {
      if (coinsToConvert.length === 0) return;
      const conversionEl = document.getElementById('wallet_conversion');
      Object.entries(coinsToConvert).forEach(entry => {
        let coinPair = (entry[0] + "ETH");
        let coinCount = entry[1]
        Object.entries(rates).forEach(values => {
          let pair = values[0];
          let rate = values[1];

          if (coinPair === pair) {
            let converted = coinCount * rate

            const li = document.createElement('li');
            li.textContent = [coinPair+' '+converted];
            conversionEl.appendChild(li);
          };
        });
      });
    };

    function handleWallets (wallets) {
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
    };
  }

  handleFormSubmission();
