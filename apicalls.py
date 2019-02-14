import requests
from decimal import Decimal
from datetime import datetime



unique_tokens = {}
eth_token_totals = {}
btc_token_totals = {}
conversion_rates = {}

WOW_TOTAL = []

def erc20_api_call(address):
    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"

    
    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    print(address, result)
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
            if tx_to in token_totals:
                # transactions_in.append((token_symbol, value))
                token_totals[token_symbol] += value
            else:
                token_totals[token_symbol] = value
        else:
            if tx_to in token_totals:
                # transactions_out.append((token_symbol, value))
                token_totals[token_symbol] += (value * -1)
            else:
                token_totals[token_symbol] = (value * -1)


def btc_api_call(address):
    address = str(address)
    url = "https://api.blockcypher.com/v1/btc/main/addrs/" + address +"/full?limit=50?unspentOnly=true&includeScript=true"

    response = requests.get(url)
    btc_content = response.json()
    data = btc_content.get("data")

    for address_info in data:
        received = transaction.get("total_received")
        sent = transaction.get("total_sent")
        balance = int(transaction.get("balance"))
        unconfirmed_tx = transaction.get("unconfirmed_n_tx")

    unique_tokens['BTC'] = 'Bitcoin'

    if balance in btc_token_totals:
                btc_token_totals['btc'] += balance
            else:
                token_totals['btc'] = balance


def valueApiCall(unique_tokens):
        
        url2 = "http://api.binance.com/api/v3/ticker/price"
        response2 = requests.get(url2)
        rate_list = response2.json()
        
        for symbol, name in unique_tokens.items():
            symbol_search_eth = symbol.upper() + 'ETH'
            symbol_search_btc = symbol.upper() + 'BTC'
            for rate in rate_list:
                exchange_coin = rate['symbol']
                exchange_rate = rate['price']
                
                if exchange_coin == symbol_search_eth:
                    conversion_rates[exchange_coin] = exchange_rate

                else:
                    pass

# def calculate_currency_conversion(token_totals, conversion_rates):
#     # for dict in conversion_rates:
#     #     for coin, rate in dict.items():
#     #         if coin[:-3] == token_totals.keys():
#     #             total = float(rate) * float(amount)
#     #             WOW_TOTAL.append(total)
        
#     #         else:
#     #             pass
#     pass

# # print(WOW_TOTAL)
# apiCall('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
# valueApiCall(unique_tokens)
# calculate_currency_conversion(token_totals, conversion_rates)






