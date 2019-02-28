from apicalls import *

def run_my_wallets(my_wallets):
    wallet_totals = []
    wallet_addresses = []
    for wallet in my_wallets:
        
        wallet = wallet.wallet_address
        wallet_addresses.append(wallet)
        if wallet[0] == '0':
            result = erc20_address_call(wallet)
            wallet_totals.append(result)
        else:
            result = btc_address_call(wallet)
            wallet_totals.append(result)

    return wallet_totals



