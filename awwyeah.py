import requests
from decimal import Decimal
from datetime import datetime
 
address = "0xa72a6CA7638Db6229bc7420AF05B41f9eC7eD289"
url = "http://api.etherscan.io/api?module=account&action=tokentx&address=" + address + \
      "&startblock=0&endblock=999999999&sort=asc&apikey=F8955887E7AK464IWN8QEM35RE16YR4X4A"

response = requests.get(url)
 
address_content = response.json()
result = address_content.get("result")


amount_out = []
amount_in = []
unique_tokens = {}
 
for n, transaction in enumerate(result):
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
print(unique_tokens)
    

#     print("Time: ", date)
#     print("Transaction ID: ", n)
#     print("hash: ", hash)
#     print("from: ", tx_from)
#     print("to: ", tx_to)
#     print("value: ", value)
#     print("confirmations: ", confirmations)
#     print("token name: ", token_name)
#     print("token symbol: ", token_symbol)
#     print("\n")
#     # eth_value = Decimal(value) / Decimal("1000000000000000000")
#     # print(normalize(eth_value))
#     if str(tx_from) == address:
#         amount_out.append(value)
#     else:
#         amount_in.append(int(value))



# print(sum(amount_out))
# print(round(sum(amount_in), 8))




 
