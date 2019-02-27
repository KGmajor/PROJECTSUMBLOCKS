from apicalls import *

def run_my_wallets(my_wallets):
    wallet_totals = []
    for wallet in my_wallets:
        print(wallet)
        wallet = wallet.wallet_address
        print(wallet)
        try:
            eth_coins = erc20_address_call(wallet)
            wallet_totals.append(eth_coins)
        except:
            btc_coins = btc_address_call(wallet)
            wallet_totals.append(btc_coins)

    return wallet_totals

