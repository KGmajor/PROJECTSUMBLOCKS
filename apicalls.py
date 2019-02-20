import requests
from decimal import Decimal
from datetime import datetime
from collections import defaultdict


def erc20_api_call(address):
    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"
    eth_token_totals = defaultdict(lambda : 0)
    
    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    # print(address, "**************************************************")
    for transaction in result:
        hash = transaction.get("hash")
        tx_from = transaction.get("from")
        tx_to = transaction.get("to")
        value = int(transaction.get("value"))
        token_name = transaction.get("tokenName")
        token_symbol = transaction.get("tokenSymbol")
        confirmations = transaction.get("confirmations")
        epc_time = int(transaction.get("timeStamp"))
        date = datetime.utcfromtimestamp(epc_time)

        
        if tx_to == address.lower():
            eth_token_totals[token_symbol] += value
        else:
            eth_token_totals[token_symbol] += (value * -1)

    return eth_token_totals
            


def btc_api_call(address):
    address = str(address)
    url = "https://api.blockcypher.com/v1/btc/main/addrs/" + address +"/full?limit=50?unspentOnly=true&includeScript=true"
    btc_token_totals = defaultdict(lambda : 0)
    response = requests.get(url)
    btc_content = response.json()

    received = btc_content.get("total_received")
    sent = btc_content.get("total_sent")
    balance = int(btc_content.get("balance"))
    unconfirmed_tx = btc_content.get("unconfirmed_n_tx")

    btc_token_totals['BTC'] += balance

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





