
const enteredWallets = []
var runningUSDSum = 0;
var runningBTCSum = 0;
var runningEURSum = 0;
var btcRate = 0;

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
      sessionStorage.setItem(walletId, alias);

      if (enteredWallets.includes(walletId) === true) {
        const errorMessage = document.getElementById('error_alert');
        errorMessage.classList.remove("d-none");
        document.getElementById('wallet_id').value=''
        document.getElementById('alias').value='';
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
            document.getElementById('alias').value='';
          });
        };
    })
  }

  function getInstantRates () {
  $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR',
    function(data) {
      btcRate = data.USD;
      document.getElementById("BTC-rate").innerHTML = btcRate.numberFormat(2);
    });
  }
  
  function handleJsonResponse (results) {
    const wallets = results.wallets;
    const ethCoins = results.eth_coins.eth_coins;
    const btcCoins = results.btc_coins;
    
    handleWallets(wallets);
    
    if (wallets[0][0] === '0') {
    handleETHCoins(ethCoins);
  }
      else {
      handleBTCCoins(btcCoins, wallets);
    }

    function handleETHCoins (ethCoins, ethIn, ethOut) {
      if (ethCoins.length === 0) return;
      Object.entries(ethCoins).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD,BTC,EUR', function(data){
        currencyExchange(coinName, coinCount, data);
      }); 
    });
  }

    function handleBTCCoins (btcCoins, wallet) {
      let btcWallet = wallet;
      let coinName = 'BTC';
      let coinCount = btcCoins.BTC;

      $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR', function(data){
      runningBTCSum += coinCount;
      currencyExchange(coinName, coinCount, data);
      }); 
    }
    
    function handleWallets (wallets) {
      if (wallets.length === 0) return;
      const walletListEl = document.getElementById('wallet_list');
      wallets.forEach((walletAddress) => {
        
        const li = document.createElement('li');

        if (sessionStorage.getItem(walletAddress) != '') {
          enteredAlias = sessionStorage.getItem(walletAddress);
          li.innerHTML = "<a href='/wallet-page/"+walletAddress+"''>" + enteredAlias + "</a>"
          walletListEl.appendChild(li);
      } else {
          li.innerHTML = "<a href='/wallet-page/"+walletAddress+"''>" + walletAddress + "</a>"
          walletListEl.appendChild(li);
        }
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
    loadSums(runningUSDSum, runningBTCSum, runningEURSum);
  };

   function refreshExchange (coinName, coinCount, data) {
    document.getElementById("indicator").classList.remove("fa-angle-up");
    document.getElementById("indicator").classList.remove("fa-angle-down");
    document.getElementById("indicator2").classList.remove("fa-angle-up");
    document.getElementById("indicator2").classList.remove("fa-angle-down");
    document.getElementById("indicator3").classList.remove("fa-angle-down");
    document.getElementById("indicator3").classList.remove("fa-angle-up");

    let usdRate = data.USD;
    console.log(runningUSDSum)
    
    let updatedUSDSum = coinCount * usdRate;
    evalIndicator(runningUSDSum, updatedUSDSum);
    
    runningUSDSum = updatedUSDSum;
    
    let eurRate = data.EUR;
    let updatedEURSum = coinCount * eurRate;
    runningEURSum = updatedEURSum;
    loadSums(updatedUSDSum, runningBTCSum, runningEURSum);
  };

  function loadSums (runningUSDSum, runningBTCSum, runningEURSum) {
    document.getElementById("USD-SUM").innerHTML = runningUSDSum.numberFormat(2);
    document.getElementById("BTC-SUM").innerHTML = runningBTCSum.numberFormat(8);
    document.getElementById("EUR-SUM").innerHTML = runningEURSum.numberFormat(2);
    refreshChart(runningUSDSum);
  }

  function refreshRates () {
    $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR',
      function(data) {
        btcRate = data.USD;
        document.getElementById("BTC-rate").innerHTML = btcRate.numberFormat(2);
        console.log(data)
        let coinName = 'BTC'
        refreshExchange(coinName, runningBTCSum, data)

        console.log('refreshing rates!')
        console.log(runningBTCSum)
    });
  }
  setInterval(refreshRates, 30000);

  function evalIndicator (oldRate, runningUSDSum) {
    if (oldRate < runningUSDSum) {
      document.getElementById("indicator").className += (" fa-angle-up");
      document.getElementById("indicator2").className += (" fa-angle-up");
      document.getElementById("indicator3").className += (" fa-angle-up");
    } 
    else {
      document.getElementById("indicator").className += (" fa-angle-down");
      document.getElementById("indicator2").className += (" fa-angle-down");
      document.getElementById("indicator3").className += (" fa-angle-down");
    }
  }
function refreshChart(runningUSDSum) {
  let now = new Date();
  let nowTime = now.toLocaleTimeString();
  myChart.data.labels.push(nowTime);
  myChart.data.datasets[0].data.push(runningUSDSum);
  myChart.update();
}

var ctx = document.getElementById('myChart').getContext("2d")
var myChart = new Chart(ctx, {
  type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: "Value",
          borderColor: "#80b6f4",
          pointBorderColor: "#80b6f4",
          pointBackgroundColor: "#80b6f4",
          pointHoverBackgroundColor: "#80b6f4",
          pointHoverBorderColor: "#80b6f4",
          pointBorderWidth: 10,
          pointHoverRadius: 10,
          pointHoverBorderWidth: 1,
          pointRadius: 3,
          fill: false,
          borderWidth: 4,
          data: []
        }
      ]
    }
  });

handleFormSubmission();
getInstantRates();

  
  
  
