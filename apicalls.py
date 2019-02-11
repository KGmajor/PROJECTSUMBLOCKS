import requests
from decimal import Decimal
from datetime import datetime

def apiCall(address):
    address = str(address)
    url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"

    unique_tokens = {}

    transactions_in = {}
    transactions_out = {}
    
    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    print(address)
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
            if tx_to in transactions_in:
                # transactions_in.append((token_symbol, value))
                transactions_in[token_symbol] += value
            else:
                transactions_in[token_symbol] = value
        else:
            if tx_to in transactions_out:
                # transactions_out.append((token_symbol, value))
                transactions_out[token_symbol] += (value * -1)
            else:
                transactions_out[token_symbol] = (value * -1)
    
    print(transactions_in, transactions_out)

    


def valueApiCall(unique_tokens):
        
        url2 = "http://api.binance.com/api/v3/ticker/price"
        response2 = requests.get(url2)
        valuecall = response2.json()
        callresults = valuecall.get("symbol")
        # for ticker, title in unique_tokens:

        valueApiCall(unique_tokens)
        return unique_tokens, callresults







