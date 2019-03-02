
const enteredWallets = []
const btcCoinsTotals =[]
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
            let reRun = results;
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
  
  function handleJsonResponse (results) {
    const wallets = results.wallets;
    // let ethCoins = results.eth_coins.eth_coins;
    const btcCoins = results.btc_coins;
    // const ethIn = results.eth_coins.tx_in;
    // const ethOut = results.eth_coins.tx_out;
    
    handleWallets(wallets);
    
    if (wallets[0][0] === '0') {
    handleETHCoins(ethCoins, ethIn, ethOut);
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
      Object.entries(ethIn).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD,BTC,EUR', function(data){
        
        let ethInValue = coinCount * data.USD;
      }); 
    });
      Object.entries(ethOut).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD,BTC,EUR', function(data){
        
        let ethOutValue = coinCount * data.USD;
      }); 
    });
  }

    function handleBTCCoins (btcCoins, wallet) {
      let btcWallet = wallet;
      let coinName = 'BTC';
      let coinCount = btcCoins.BTC;
      let btcIn = btcCoins.tx_in;
      let btcOut = btcCoins.tx_out;
      

      $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR', function(data){
      runningBTCSum += coinCount;
      let amountIN = btcIn * data.USD;
      let amountOUT = btcOut * data.USD;

      addChartData(walletChart, btcWallet, amountIN.numberFormat(2), amountOUT.numberFormat(2));
      currencyExchange(coinName, coinCount, data);
      }); 
    }
    
    function handleWallets (wallets) {
      if (wallets.length === 0) return;
      const walletListEl = document.getElementById('wallet_list');
      wallets.forEach((walletAddress) => {
        
        const li = document.createElement('li');

        if (sessionStorage.getItem(walletAddress) != '') {
        li.textContent = sessionStorage.getItem(walletAddress);
        walletListEl.appendChild(li);
      } else {
        li.textContent = walletAddress;
        walletListEl.appendChild(li);
      }
        // append it to walletListEl
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
      btcCoinsTotals.pop();
      btcCoinsTotals.push(coinBTCSum);
    };
    if (data.EUR != null){
      let eurRate = data.EUR;
      let coinEURSum = coinCount * eurRate;
      runningEURSum += coinEURSum;
    };
    loadSums();
  };

  function loadSums () {
    document.getElementById("USD-SUM").innerHTML = runningUSDSum.numberFormat(2);
    document.getElementById("BTC-SUM").innerHTML = runningBTCSum.numberFormat(8);
    document.getElementById("EUR-SUM").innerHTML = runningEURSum.numberFormat(2);
  }


  function addChartData(chart, wallets, dataIN, dataOut) {
    barChartData.labels.push(wallets);
    barChartData.datasets[0].data.push(dataIN);
    barChartData.datasets[1].data.push(dataOut);
    chart.update();
  }
     


  var barChartData = {
  labels: [],
  datasets: [{
    label: 'Money In',
    backgroundColor: '#1f77b4',
    data: [
    ]
  }, {
    label: 'Money Out',
    backgroundColor: '#ff7f0e',
    data: [
    ]
  }]
};


var ctx = document.getElementById('canvas').getContext('2d');
var walletChart = new Chart(ctx, {
  type: 'bar',
  data: barChartData,
  options: {
    title: {
      display: true,
      text: 'Chart.js Bar Chart - Stacked'
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    responsive: true,
    scales: {
      xAxes: [{
        stacked: true,
      }],
      yAxes: [{
        stacked: true
      }]
    }
  }
});


    
  

  handleFormSubmission();
  // addChartData(doughnutChart, enteredWallets, btcCoinsTotals);
  
  
  
  
