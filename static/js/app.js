
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
  
  function getHistoricalRates() {
    let now = new Date();
    getRateMonthAgo(now);
    getRateYearAgo(now);
    getRate5YearsAgo(now);

    function getRateMonthAgo (now) {
      let day = now.getUTCMonth();
      let month = now.getUTCMonth() - 1;
      let year = now.getUTCFullYear();
      if (month < 10){
        month = '0' + month;
      } 
      if (day < 10){
        day = '0' + day;
      }

      let date = `${year}-${month}-${day}`;
      $.get('https://api.coindesk.com/v1/bpi/historical/close.json?start='+date+'&end=' + date, function(data){
        let monthResults = data;
        let monthRate = monthResults.slice(21, 28);

        let monthConversion = parseInt(monthRate) * runningBTCSum;
        document.getElementById("one-month-rate").innerHTML = monthConversion.numberFormat(2);
        console.log("Results 1 month", monthResults);  
    });
  }

    function getRateYearAgo (now) {
      let day = now.getUTCMonth();
      let month = now.getUTCMonth();
      let year = now.getUTCFullYear() -1;
      if (month < 10){
        month = '0' + month;
      } 
      if (day < 10){
        day = '0' + day;
      }

      let date = `${year}-${month}-${day}`;
      $.get('https://api.coindesk.com/v1/bpi/historical/close.json?start='+date+'&end=' + date, function(data){
        let yearResults = data;
        let yearRate = yearResults.slice(21, 28);

        let yearConversion = parseInt(yearRate) * runningBTCSum;
        document.getElementById("one-year-rate").innerHTML = yearConversion.numberFormat(2);
        
        console.log("Results 1 year", yearResults);  
    });

  }
    function getRate5YearsAgo (now) {
      let day = now.getUTCMonth();
      let month = now.getUTCMonth();
      let year = now.getUTCFullYear() - 5;
      if (month < 10){
        month = '0' + month;
      } 
      if (day < 10){
        day = '0' + day;
      }

      let date = `${year}-${month}-${day}`;
      $.get('https://api.coindesk.com/v1/bpi/historical/close.json?start='+date+'&end=' + date, function(data){
        let fiveYResults = data;
        let fiveYRate = fiveYResults.slice(21, 28);

        let fiveYConversion = parseInt(fiveYRate) * runningBTCSum;
        document.getElementById("five-year-rate").innerHTML = fiveYConversion.numberFormat(2);
        
        console.log("Results 5 year", fiveYResults);  
    });
  }
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
          li.innerHTML = "<a class='list-group-item' href='/wallet-page/"+walletAddress+"''>" + enteredAlias + "</a>"
          walletListEl.appendChild(li);
      } else {
          li.innerHTML = "<a class='list-group-item' href='/wallet-page/"+walletAddress+"''>" + walletAddress + "</a>"
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
    getHistoricalRates();
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

  let formatSum = runningUSDSum.toFixed(2);
  myChart.data.datasets[0].data.push(formatSum);
  myChart.update();
}



let ctx = document.getElementById("myChart").getContext('2d');

var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
gradientStroke.addColorStop(0, "#C55774");
gradientStroke.addColorStop(1, "#170C14");

var gradientBkgrd = ctx.createLinearGradient(0, 100, 0, 400);
gradientBkgrd.addColorStop(.5, "white");

let draw = Chart.controllers.line.prototype.draw;
Chart.controllers.line = Chart.controllers.line.extend({
    draw: function() {
        draw.apply(this, arguments);
        let ctx = this.chart.chart.ctx;
        let _stroke = ctx.stroke;
        ctx.stroke = function() {
            ctx.save();
            //ctx.shadowColor = 'rgba(244,94,132,0.8)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            _stroke.apply(this, arguments)
            ctx.restore();
        }
    }
});




var myChart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: [],
        datasets: [{
            label: "Value in USD",
            backgroundColor: gradientBkgrd,
            borderColor: gradientStroke,
            data: [],
            pointBorderColor: "rgba(255,255,255,0)",
            pointBackgroundColor: "#170C14",
            pointBorderWidth: 4,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 4,
            pointRadius: 4,
            borderWidth: 5,
            pointHitRadius: 16,
        }]
    },

    // Configuration options go here
    options: {
      tooltips: {
        backgroundColor:'#fff',
        displayColors:false,
           titleFontColor: '#000',
        bodyFontColor: '#000'
        
        },      
      legend: {
            display: false
      },
        scales: {
            xAxes: [{
                gridLines: {
                    display:false
                }
            }],
            yAxes: [{
                ticks: {
                    maxTicksLimit: 11,
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' +(value.numberFormat(2));
                    }
                }
            }],
        }
    }
});

handleFormSubmission();
getInstantRates();

  
  
  
