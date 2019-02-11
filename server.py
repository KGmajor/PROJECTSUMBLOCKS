from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session)
from flask_debugtoolbar import DebugToolbarExtension
import requests
from datetime import datetime

app = Flask(__name__)

app.secret_key = "COOLSECRETKEY"

app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage."""
    return render_template("homepage.html")

@app.route('/wallet-processing', methods=['GET'])
    # """Handling the wallet address input"""
def apiCall():

    address = "0xbDd7e376B30D48af9ae89B26662328c7cfD1f5C9"
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"
    unique_tokens = {}
    response = requests.get(url)
 
    address_content = response.json()
    results = address_content.get("result")

    for transaction in results:
        hash = transaction.get("hash")
        tx_from = transaction.get("from")
        tx_to = transaction.get("to")
        value = transaction.get("value")
        token_name = transaction.get("tokenName")
        token_symbol = transaction.get("tokenSymbol")
        confirmations = transaction.get("confirmations")
        epc_time = int(transaction.get("timeStamp"))
        date = datetime.utcfromtimestamp(epc_time)
        unique_tokens[token_symbol] = token_name
        print(token_name)
    print(unique_tokens)

    def valueApiCall(unique_tokens):
        
        url2 = "http://api.binance.com/api/v3/ticker/price"
        response2 = requests.get(url2)
        valuecall = response2.json()
        callresults = valuecall.get("symbol")
        # for ticker, title in unique_tokens:


        return render_template("results.html", results=results, callresults=callresults)




if __name__ == "__main__":
    app.debug = True
    
    app.jinja_env.auto_reload = app.debug

    DebugToolbarExtension(app)

    app.run(port=4000, host='0.0.0.0')