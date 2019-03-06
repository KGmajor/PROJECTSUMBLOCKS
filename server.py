from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session, jsonify, url_for)
from flask_debugtoolbar import DebugToolbarExtension

import requests
from datetime import datetime
from collections import defaultdict
from apicalls import *
from model import *
from helpers import *


app = Flask(__name__)

app.secret_key = "COOLSECRETKEY"


app.jinja_env.undefined = StrictUndefined



@app.route('/')
def index():
    """Homepage."""
    session.clear()
    session['logged_in']= False
    mains = btc_eth_toUSD()
    
    return render_template("homepage.html", mains=mains)

@app.route('/profile_wallets.json', methods=['GET'])
def user_wallets():
    user_id = session['userid']
    

    get_user_wallets = Wallet.query.filter_by(user_id = user_id).all()
    
    users_wallets = []
    user_wallet_totals = run_my_wallets(get_user_wallets)
    
    for wallet in get_user_wallets:
        alias = wallet.wallet_alias
        wallet = wallet.wallet_address

        users_wallets.append([wallet, alias])



    return jsonify(user_wallet_totals=user_wallet_totals, users_wallets=users_wallets)

@app.route('/wallet-processing.json', methods=['GET'])
def wall_processing_json():
    # """Handling the wallet address input"""
    address = request.args.get('wallet_id') # TODO persist the wallet address for the user. 
    
    
    session[address] = 1
    session.modified = True

    mains = btc_eth_toUSD()

    all_rates = defaultdict(lambda : 0)
    
    if address[0] == '0':
        eth_coins = erc20_address_call(address)
        rates = erc20_value_search(eth_coins)

        


        return jsonify(
            wallets=[address],
            eth_coins=eth_coins,
            rates=rates,
            mains=mains)
    else:
        btc_coins = btc_address_call(address)
        eth_coins = {}
        return jsonify(
            wallets=[address],
            btc_coins=btc_coins,
            eth_coins=eth_coins,
            mains=mains)



@app.route('/wallet-page/<wallet_address>')
def render_wallet_info(wallet_address):

    holdAddress = {}
    holdAddress[wallet_address] = 1
    sendAddress = jsonify(holdAddress)
    
    return render_template("wallet-page.html", wallet_address=wallet_address)

@app.route('/remove-wallet/<wallet_address>')
def remove_wallet(wallet_address):
    user_id = session['userid']
    to_remove = wallet_address
    remove_wallet = Wallet.query.filter(wallet_address == to_remove, user_id == user_id).first()
    print(remove_wallet)
    
    db.session.delete(remove_wallet)
    db.session.commit()

    print("******REMOVE******"+ wallet_address)
    
    return redirect('/profile-page')

@app.route('/add-user')
def add_a_user():

    return render_template("add-user.html")

@app.route('/add-user-processing', methods=['POST'])
def adding_user():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    
    
    if (User.query.filter_by(email = email).all()):
        print("User AlreaDY exists")
        flash('User already exists, please log in')
        return redirect('/login-form')
    else:
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        userID = new_user.user_id
        session['userid'] = userID
        session['logged_in']= True
        session.modified = True
        print('AWESOME **********')
        return redirect('/profile-page/')

@app.route('/profile-page/')
def render_user_profile():
    user_id = session['userid']
    user = User.query.get(user_id)
    username = user.username
    email = user.email

    get_user_wallets = Wallet.query.filter_by(user_id = user_id).all()
    
    user_wallet_totals = run_my_wallets(get_user_wallets)
    
    
    return render_template("profile-page.html", username=username, email=email)

@app.route('/save-wallet', methods=['POST'])
def save_wallet():
    wallet_address = request.form.get('wallet_id')
    
    wallet_alias = request.form.get('alias')
    

    if wallet_alias == '':
        wallet_alias = None
    user_id = session['userid']

    new_wallet = Wallet(user_id=user_id, wallet_address=wallet_address, wallet_alias=wallet_alias)
    db.session.add(new_wallet)
    db.session.commit()

    return redirect('/profile-page')

@app.route('/login-form')
def show_login_form():
    return render_template('login-form.html')

@app.route('/login-form', methods=['POST'])
def log_user_in():
    email = request.form.get('email')
    password = request.form.get('password')
    usersMatchList = User.query.filter_by(email = email).all()
    
    if (usersMatchList):
        if(password == usersMatchList[0].password):
            flash('You were successfully logged in')
            user_id = usersMatchList[0].user_id
            users_wallets = Wallet.query.filter(Wallet.user_id == user_id).all()
            session['userid'] = user_id
            session['logged_in'] = True
            session.modified = True


            return redirect('/profile-page/')
        else:
            flash('WRONG PASSWORD!!', 'error')
            return render_template("login-form.html")
            

    else:
        print('LOGIN FAILED!!!')
        flash('This user does not exist. Please sign-up.', 'error')
        return redirect('/add-user')

@app.route('/logout', methods=['GET'])
def log_user_out():
    session['logged_in'] = False
    flash('You were successfully logged out.')
    return redirect('/')

if __name__ == "__main__":
    
    app.debug = True
    
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')