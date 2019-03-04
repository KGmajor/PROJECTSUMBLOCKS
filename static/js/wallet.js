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