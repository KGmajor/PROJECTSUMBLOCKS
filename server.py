from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session)
from flask_debugtoolbar import DebugToolbarExtension
import requests
from datetime import datetime
from apicalls import *

app = Flask(__name__)

app.secret_key = "COOLSECRETKEY"

app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage."""
    session.clear()
    unique_tokens.clear()
    eth_token_totals.clear()
    btc_token_totals.clear()
    conversion_rates.clear()
    return render_template("homepage.html")

@app.route('/wallet-processing', methods=['GET'])
def wall_processing():
    # """Handling the wallet address input"""
    address = request.args.get('wallet_id')
    session['in_session'] = True
    session[address] = 1
    if address[0] == '0':
        erc20_api_call(address)
    else:
        btc_api_call(address)
    
    valueApiCall(unique_tokens)
    flash("Wallet " + address + " was added, please add another or hit finished.")
    return render_template("results.html", unique_tokens=unique_tokens, eth_token_totals=eth_token_totals, btc_token_totals=btc_token_totals, conversion_rates=conversion_rates)

    

if __name__ == "__main__":
    app.debug = True
    
    app.jinja_env.auto_reload = app.debug

    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')