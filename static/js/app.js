
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
      doughChart.data.datasets[0].data.push(coinCount);
      currencyExchange(coinName, coinCount, data);
      doughChart.update();
      }); 
    }
    
    function handleWallets (wallets) {
      if (wallets.length === 0) return;
      doughChart.data.labels.push(wallets);
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
      doughChart.data.datasets[0].data.push(coinBTCSum);
      doughChart.update();
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

  function addChartData(chart, wallets, dataIN, dataOut) {
    barChartData.labels.push(wallets);
    barChartData.datasets[0].data.push(dataIN);
    barChartData.datasets[1].data.push(dataOut);
    chart.update();
  }

var ctx = document.getElementById('doughnut-chart').getContext('2d');
var doughChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          label: "Amount in BTC",
          backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
          data: []
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Wallets in my Portfolio'
      }
    }
});     
handleFormSubmission();
getInstantRates();

  
  
  
