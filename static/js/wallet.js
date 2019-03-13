


function getWalletInfo () {
  var x = location.pathname;
  walletAddress = x.slice(13,);
  console.log(walletAddress);
  $.getJSON('http://api.etherscan.io/api?module=account&action=txlist&address='+walletAddress+'&startblock=0&endblock=99999999&sort=asc&apikey=UM3G7VEXIW7YR1EC5D1UCRWF9MUF9EJFF6',
    function(data) {
      console.log(data)
    });
  }

getWalletInfo();