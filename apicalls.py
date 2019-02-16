import requests
from decimal import Decimal
from datetime import datetime
from collections import defaultdict



unique_tokens = defaultdict(lambda : 0)
eth_token_totals = defaultdict(lambda : 0)
btc_token_totals = defaultdict(lambda : 0)
conversion_rates = defaultdict(lambda : 0)

WOW_TOTAL = []

def erc20_api_call(address):
    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"

    
    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    print(address, "**************************************************")
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

        unique_tokens[token_symbol] = token_name
        
        if tx_to == address.lower():
            eth_token_totals[token_symbol] += value
        else:
            eth_token_totals[token_symbol] += (value * -1)
            


def btc_api_call(address):
    address = str(address)
    url = "https://api.blockcypher.com/v1/btc/main/addrs/" + address +"/full?limit=50?unspentOnly=true&includeScript=true"

    response = requests.get(url)
    btc_content = response.json()

    received = btc_content.get("total_received")
    sent = btc_content.get("total_sent")
    balance = int(btc_content.get("balance"))
    unconfirmed_tx = btc_content.get("unconfirmed_n_tx")

    unique_tokens['BTC'] = 'Bitcoin'

    btc_token_totals['BTC'] += balance
    


def valueApiCall(unique_tokens):
        
        url2 = "http://api.binance.com/api/v3/ticker/price"
        response2 = requests.get(url2)
        rate_list = response2.json()
        
        for symbol, name in unique_tokens.items():
            symbol_search_eth = symbol.upper() + 'ETH'
            symbol_search_btc = symbol.upper() + 'USD'
            for rate in rate_list:
                exchange_coin = rate['symbol']
                exchange_rate = rate['price']
                
                if exchange_coin == symbol_search_eth or exchange_coin == symbol_search_btc:
                    conversion_rates[exchange_coin] = exchange_rate

                else:
                    pass








