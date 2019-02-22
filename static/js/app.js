
const enteredWallets = []
let runningSum = 0;

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
          $.get('/wallets?wallet_id=' + walletId + '?alias=' + alias);
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
    const btcCoins = results.btc_coins;
    const mains = results.mains;

    handleWallets(wallets);
    
    if (wallets[0][0] === '0') {
    handleETHCoins(ethCoins);
  }
      else {
      handleBTCCoins(btcCoins);
    }

    function handleETHCoins (ethCoins) {
      if (ethCoins.length === 0) return;
      Object.entries(ethCoins).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD', function(data){
        console.log(data.USD);
        if (data.USD != null){
          let usdRate = data.USD;
          let coinSum = coinCount * usdRate;
          runningSum += coinSum;
          const coinListEl = document.getElementById('coins_list');
          const li = document.createElement('li');
          li.textContent = [coinName+' $'+coinSum.toFixed(2)];
          coinListEl.appendChild(li);
          }
        }); 
      });
    }

    function handleBTCCoins (btcCoins) {
      Object.entries(btcCoins).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD', function(data){
        console.log(data.USD);
        if (data.USD != null){
          let usdRate = data.USD;
          let coinSum = coinCount * usdRate;
          runningSum += coinSum;
          const coinListEl = document.getElementById('coins_list');
          const li = document.createElement('li');
          li.textContent = [coinName+' $'+coinSum.toFixed(2)];
          coinListEl.appendChild(li);
          }
        }); 
      });
    }
    
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
    function runTotals (runningSum) {
      const runningSumEl = document.getElementById('running_sum');
      const li = document.createElement('li');
      li.textContent = runningSum;
      runningSumEl.appendChild(li);
    };

  handleFormSubmission();
  runTotals (runningSum);
  
