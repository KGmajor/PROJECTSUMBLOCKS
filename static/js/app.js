
const enteredWallets = []
let runningUSDSum = 0;
let runningBTCSum = 0;
let runningEURSum = 0;
let runningCoinSum = new Object();



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
        
        currencyExchange(coinName, coinCount, data);
        addChartData(doughnutChart, coinName, coinCount);
        
        if (coinName in runningCoinSum) {
          runningCoinSum[coinName] += coinCount;
        } else {
          runningCoinSum[coinName] = coinCount;
        }
        console.log(runningCoinSum);
      }); 
    });
  }

    function handleBTCCoins (btcCoins) {
      Object.entries(btcCoins).forEach(entry => {
        let coinName = entry[0];
        let coinCount = entry[1];
        $.getJSON('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,EUR', function(data){
        runningBTCSum += coinCount;
        let eurRate = data.EUR;
        currencyExchange(coinName, coinCount, data);
        }); 
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


  function addChartData(chart, label, data) {
    if (label in chart.data.labels) {
      chart.data.datasets.forEach((dataset) => {
        dataset.data += data;
      });
    }
    else {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
  };
    console.log(chart, label, data);
    chart.update();
  }

  var ctx = document.getElementById('coinsCanvas').getContext('2d');
  var doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [
      ],
      datasets: [{
          data: [],
          backgroundColor: [
              "#7FFFD4",
              "#228B22",
              "#0000FF",
              "#2E8BF7",
              "#483D8B",
              "#00FF7F",
              "#7CFC00",
              "#00FF00",
              "#32CD32",
              "#98FB98",
              "#90EE90",
              "#00FA9A",
          ],
          borderColor: "black",
          borderWidth: 2
      }]
    },
    options: chartOptions
  });

  var chartOptions = {
    rotation: -Math.PI,
    cutoutPercentage: 30,
    circumference: Math.PI,
    legend: {
      position: 'left'
    },
    animation: {
      animateRotate: false,
      animateScale: false
    }
  };

    function profileWallets () {
    const profileWalletsEl = document.getElementById("profile-wallets");
    Object.keys(sessionStorage).forEach(function(key){
      const li = document.createElement('li');

        if (sessionStorage.getItem(key) != '') {
          li.textContent = sessionStorage.getItem(key);
          profileWalletsEl.appendChild(li);
          profileWalletsEl.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-success" data-cmd="keep" id="'+ key +'">Keep</button><button type="button" class="btn btn-danger" data-cmd="delete" id="'+ key +'">Delete</button>');
        } else {
          li.textContent = key;
          profileWalletsEl.appendChild(li);
          profileWalletsEl.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-success" data-cmd="keep" id="'+ key +'">Keep</button><button type="button" class="btn btn-danger" data-cmd="delete" id="'+ key +'">Delete</button>');
        }
      });
    }
  function runSavedWallets() {
    $('#wallet_run').on('click', (evt) => {
        $.get('/profile_wallets.json', (response) => {
              const results = response;
              handleETHCoins (results);
        });
      })
    }

  runSavedWallets();
  profileWallets();
  

  handleFormSubmission();

  
  
  
