from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash, session, jsonify)
from flask_debugtoolbar import DebugToolbarExtension
from flask_user import current_user, login_required, roles_required, UserManager, UserMixin

import requests
from datetime import datetime
from collections import defaultdict
from apicalls import *
from model import *


app = Flask(__name__)

app.secret_key = "COOLSECRETKEY"


app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """Homepage."""
    
    return render_template("homepage.html")


@app.route('/wallet-processing.json', methods=['GET'])
def wall_processing_json():
    # """Handling the wallet address input"""
    address = request.args.get('wallet_id') # TODO persist the wallet address for the user. 
    print(address)
    
    session[address] = 1
    session.modified = True
    all_rates = defaultdict(lambda : 0)
    
    if address[0] == '0':
        eth_coins = erc20_api_call(address)
        rates = erc20_value_search(eth_coins)

        return jsonify(
            wallets=[address],
            eth_coins=eth_coins,
            rates=rates)
    else:
        btc_coins = btc_api_call(address)
        return jsonify(
            wallets=[address],
            btc_coins=btc_coins)



@app.route('/results')
def add_more_wallets():
    return render_template("results.html")

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
        return redirect(f'/profile-page/{userID}')

@app.route('/profile-page/<user_id>')
def render_user_profile(user_id):
    user = User.query.get(user_id)
    username = user.username
    email = user.email
    
    return render_template("profile-page.html", username=username, email=email)

@app.route('/login-form')
def show_login_form():
    return render_template('login-form.html')

@app.route('/login-form', methods=['POST'])
def log_user_in():
    email = request.form.get('email')
    password = request.form.get('password')
    usersMatchList = User.query.filter_by(email = email).all()
    print(usersMatchList)
    if (usersMatchList):
        if(password == usersMatchList[0].password):
            flash('You were successfully logged in')
            user_id = usersMatchList[0].user_id
            session['userid'] = user_id
            session['logged_in'] = True
            session.modified = True
            return redirect(f'/profile-page/{user_id}')
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