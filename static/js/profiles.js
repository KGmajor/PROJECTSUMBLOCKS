"use strict";
const enteredWallets = []
let runningUSDSum = 0;
let runningBTCSum = 0;
let runningEURSum = 0;
let runningCoinSum = new Object();
let chartUSDData = [];

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
}

function runSavedWallets() {
  $.get('/profile_wallets.json', (response) => {
        const results = response;
        console.log(results.users_wallets);
        handleSavedWallets(results.users_wallets);
        Object.entries(response.user_wallet_totals).forEach(entry => {
          if (entry[1][0] !== 'BTC') {
            handleETHCoins(entry[1]);
        }
          else {
            handleBTCCoins(entry[1]);
        }
      });
    })
  }

  function handleETHCoins (ethCoins) {
    if (ethCoins.length === 0) return;
    Object.entries(ethCoins).forEach(entry => {
      let coinName = entry[0];
      let coinCount = entry[1];
      $.getJSON('https://min-api.cryptocompare.com/data/price?fsym='+ coinName +'&tsyms=USD,BTC,EUR', function(data){
      
      currencyExchange(coinName, coinCount, data);
      // addChartData(doughnutChart, coinName, coinCount);
      
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
  
  function handleSavedWallets (wallets) {
    if (wallets.length === 0) return;
    const profileWalletListEl = document.getElementById('saved-wallets');
    wallets.forEach((walletAddress) => {
      enteredWallets.push(walletAddress[0]);
      const li = document.createElement('li');
      if (walletAddress[1] !== null) {
        li.innerHTML = "<a href='/wallet-page/"+walletAddress[1]+"''>" + walletAddress[1] + "</a>";
        profileWalletListEl.appendChild(li);
        profileWalletListEl.insertAdjacentHTML('beforeend', '<i class="fas fa-info-circle" title="'+ walletAddress[0] +'"></i>');
      } else {
        li.innerHTML = "<a href='/wallet-page/"+walletAddress[0]+"''>" + walletAddress[0] + "</a>";;
        profileWalletListEl.appendChild(li);
      }
    });
  };

  

function currencyExchange (coinName, coinCount, data) {
  if (data.USD != null){
        let usdRate = data.USD;
        let coinUSDSum = coinCount * usdRate;
        runningUSDSum += coinUSDSum;
        let usdData = coinUSDSum.numberFormat(2);
        chartUSDData.push(usdData);
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
  document.getElementById("USD-SUM-PROFILE").innerHTML = runningUSDSum.numberFormat(2);
  document.getElementById("BTC-SUM-PROFILE").innerHTML = runningBTCSum.numberFormat(8);
  document.getElementById("EUR-SUM-PROFILE").innerHTML = runningEURSum.numberFormat(2);
}

