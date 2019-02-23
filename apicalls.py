import requests
from decimal import Decimal
from datetime import datetime
from collections import defaultdict
import os

CRYPTOCOMPARE_KEY = os.environ["CRYPTOCOMPARE_KEY"]
ETHERSCAN_KEY = os.environ["ETHERSCAN_KEY"]

def erc20_address_call(address):
    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=" + ETHERSCAN_KEY
    eth_token_totals = defaultdict(lambda : 0)
    positive_count_eth = defaultdict(lambda : 0)
    
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
        else:
            eth_token_totals[token_symbol] += (real_value * -1)

    for k, v in eth_token_totals.items():
        if v >= 0:
            positive_count_eth[k] += v

    print(eth_token_totals)
    return positive_count_eth
            


def btc_address_call(address):
    address = str(address)
    url = "https://blockchain.info/q/addressbalance/" + address 
    btc_token_totals = defaultdict(lambda : 0)
    response = requests.get(url)
    btc_balance = response.json()
    
    btc_decimal = int(btc_balance) * 10 **(-8)
    

    btc_token_totals['BTC'] += float(btc_decimal)
    print(btc_token_totals)
    return btc_token_totals
    

def erc20_value_search(coins):
        
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

    url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD"
    response = requests.get(url)
    btceth_usd = response.json()

    return btceth_usd









