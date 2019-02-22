
const enteredWallets = []
let runningUSDSum = 0;
let runningBTCSum = 0;
let runningEURSum = 0;

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
}

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
          // $.get('/wallets?wallet_id=' + walletId + '?alias=' + alias);
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
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD,BTC,EUR', function(data){
        console.log(data.USD);
        currencyExchange(coinName, coinCount, data);
        }); 
      });
    }

    function handleBTCCoins (btcCoins) {
      Object.entries(btcCoins).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR', function(data){
        console.log(data.USD);
        runningBTCSum += coinCount;
        let eurRate = data.EUR;
        let coinEURSum = coinCount * eurRate;
        runningEURSum += coinEURSum;
        currencyExchange(coinName, coinCount, data);
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
    

  function currencyExchange (coinName, coinCount, data) {
    if (data.USD != null){
          let usdRate = data.USD;
          let coinUSDSum = coinCount * usdRate;
          runningUSDSum += coinUSDSum;
    };
    if (data.BTC != null && coinName != 'BTC'){
      let btcRate = data.BTC;
      let coinBTCSum = coinCount * btcRate;
      runningBTCSum += coinBTCSum;
    };
    if (data.EUR != null){
      let eurRate = data.EUR;
      let coinEURSum = coinCount * eurRate;
      runningEURSum += coinEURSum;
    };
    console.log(runningUSDSum);
    console.log(runningBTCSum);
    console.log(runningEURSum);
    loadSums();
  };

  function loadSums () {
    document.getElementById("USD-SUM").innerHTML = runningUSDSum.numberFormat(2);
    document.getElementById("BTC-SUM").innerHTML = runningBTCSum.numberFormat(8);
    document.getElementById("EUR-SUM").innerHTML = runningEURSum.numberFormat(2);
}

  handleFormSubmission();
  
  
