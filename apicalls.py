import requests
from decimal import Decimal
from datetime import datetime
from collections import defaultdict
import os

ETHERSCAN_KEY = os.environ["ETHERSCAN_KEY"]

def erc20_address_call(address):
    """API call to etherscan for an ethereum wallet
        and returns the total positive count of remaining erc-20 coins 
        in the wallet"""

    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=" + ETHERSCAN_KEY
    eth_token_totals = defaultdict(lambda : 0)
    positive_count_eth = defaultdict(lambda : 0)
    transactions_in = defaultdict(lambda : 0)
    transactions_out = defaultdict(lambda : 0)
    client_response = defaultdict(lambda : 0)
    
    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    # print(address, "**************************************************")
    for transaction in result:
        hash = transaction.get("hash")
        tx_from = transaction.get("from")
        tx_to = transaction.get("to")
        value = int(transaction.get("value"))
        decimals = int(transaction.get("tokenDecimal"))
        token_name = transaction.get("tokenName")
        token_symbol = transaction.get("tokenSymbol")
        confirmations = transaction.get("confirmations")
        epc_time = int(transaction.get("timeStamp"))
        date = datetime.utcfromtimestamp(epc_time)

        real_value = value * 10 ** (decimals * -1)
        
        
        if tx_to == address.lower():
            eth_token_totals[token_symbol] += real_value
            transactions_in[token_symbol] += real_value
        else:
            eth_token_totals[token_symbol] += (real_value * -1)
            transactions_out[token_symbol] += (real_value * -1)

    for k, v in eth_token_totals.items():
        if v >= 0:
            positive_count_eth[k] += v
    client_response['eth_coins'] = positive_count_eth
    client_response['tx_in'] = transactions_in
    client_response['tx_out'] = transactions_out
    print('*************', positive_count_eth)
    
    return client_response
            


def btc_address_call(address):
    """API call to blockchain.info for bitcoin wallets
        returns the total amount of remaining bitcoin, if positive"""
    
    address = str(address)
    url = "https://blockchain.info/rawaddr/" + address 
    btc_token_totals = defaultdict(lambda : 0)
    
    response = requests.get(url)
    btc_balance = response.json()

    balance = btc_balance.get("final_balance")
    total_received = btc_balance.get("total_received")
    total_sent = btc_balance.get("total_sent")
    
    btc_decimal = int(balance) * 10 **(-8)
    received = int(total_received) * 10 **(-8)
    sent = int(total_sent) * 10 **(-8)
    

    btc_token_totals['BTC'] += float(btc_decimal)
    btc_token_totals['tx_in'] = received
    btc_token_totals['tx_out'] = sent

    return btc_token_totals
    

def erc20_value_search(coins):
        """An API call to Binance for coin converstion rates"""
        url2 = "http://api.binance.com/api/v3/ticker/price"
        response2 = requests.get(url2)
        rate_list = response2.json()
        pair_conversions = defaultdict(lambda : 0)

        for coin in coins:
                for rate in rate_list:
                    exchange_coin = rate['symbol']
                    exchange_price = rate['price']
                    if coin + 'ETH' == exchange_coin:
                        pair_conversions[exchange_coin] = exchange_price
                    else:
                        pass
        
        return pair_conversions

def btc_eth_toUSD():
    """An API call to cryptocompare.com for BTC and ETH conversions to USD"""
    url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD"
    response = requests.get(url)
    btceth_usd = response.json()

    return btceth_usd









