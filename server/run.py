from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests
import base64
import json

tenant=''
target=''
tenant_auth_token = ''
accounts = {}

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Login or create account for user
@app.route('/auth', methods=['POST'])
def auth_account():
    address = request.json['address'] if 'address' in request.json else False
    username = request.json['username'] if 'username' in request.json else False
    account_id = address or username

    payload = {
        'email': _account_id_to_email(account_id),
        'password': 'BadPassw0rd!',
        'persistLogin': True
    }
    headers = _create_header(tenant_auth_token)

    auth_action = "create" if account_id not in accounts else "login"

    resp = requests.post(f'{target}/users/{tenant}/{auth_action}', json=payload, headers=headers)
    resp_json = resp.json()
    print(resp_json)

    if resp_json['success']:
        token = resp_json['result']['token']
        if account_id not in accounts:
            accounts[account_id] = {'token': token,'depositAddress':'', 'highScore': 0}
        else:
            accounts[account_id]['token'] = token
        with open('accounts.json', 'w') as accounts_file:
                json.dump(accounts, accounts_file)
        return jsonify({'success':True, 'result': {'highScore': accounts[account_id]['highScore'], 'accountId': account_id}}), 200

    return jsonify({'success': False, 'error': 'Failed to login'}), 422

# Get NFTs in a user's wallet
@app.route('/users/nfts', methods=['GET'])
def get_user_nfts():
    account_id = request.args.get('accountId')

    if account_id not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422
    user_nft_resp = requests.get(f'{target}/nft/balances', headers=_create_header(accounts[account_id]['token']))
    print(user_nft_resp.text)
    user_nft_resp_json = user_nft_resp.json()

    return user_nft_resp_json

# Send an NFT to a user's wallet
@app.route('/nfts/award', methods=['POST'])
def award_nft():
    account_id = request.json['accountId']
    name = request.json['name']

    if account_id not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422

    # (Option 1) Load available tenant NFTs
    # tenant_nft_resp = requests.get(f'{target}/nft/balances', headers=_create_header(tenant_auth_token))
    # tenant_nft_resp_json = tenant_nft_resp.json()
    # tenant_nft = None
    # if 'success' in tenant_nft_resp_json:
    #     tenant_nft = tenant_nft_resp_json['result'][0]

    # (Option 2) Mint NFT to tenant
    promo_names = {
        'red': '2048red',
        'green': '2048green',
        'blue': '2048blue',

        'runes': '2048runes',
        'invisible': '2048invisible',
    }
    if name not in promo_names:
        return jsonify({'success': False, 'error': 'Invalid NFT name'}), 422
    tenant_mint_resp = requests.post(f'{target}/promos/{promo_names[name]}', headers=_create_header(tenant_auth_token))
    tenant_mint_resp_json = tenant_mint_resp.json()
    print(tenant_mint_resp_json)
    if 'success' not in tenant_mint_resp_json or not tenant_mint_resp_json['success']:
        return jsonify({'success': False, 'error': 'Application failed to mint NFT'}), 422
    tenant_nft = tenant_mint_resp_json['result']['redeemed']
    
    # Transfer tenant NFT to user
    transfer_payload = {
        "coin": "SOL",
        "nftId": str(tenant_nft['id']),
        "method": "sol",
        "address": accounts[account_id]['depositAddress']
    }
    transfer_nft_resp = requests.post(f'{target}/wallet/withdrawals', json=transfer_payload, headers=_create_header(tenant_auth_token))
    transfer_nft_resp_json = transfer_nft_resp.json()

    if 'success' in transfer_nft_resp_json:
        return jsonify({'success': True, 'result': tenant_nft}), 200

    return jsonify({'success': False, 'error': 'Failed to award NFT to user'}), 422

@app.route('/fungibles/award', methods=['POST'])
def award_fungible():
    account_id = request.json['accountId']
    amount = request.json['amount']

    if account_id not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422

    transfer_payload =     {
        "email": _account_id_to_email(account_id),
        "coin": "TILE",
        "size": amount,
        "reason": "Tile Award"
    }
    # print(f'{target}/users/{tenant}/transfer/from')
    transfer_fungible_resp = requests.post(f'{target}/users/{tenant}/transfer/from', json=transfer_payload, headers=_create_header(tenant_auth_token))
    transfer_fungible_resp_json = transfer_fungible_resp.json()
    print(transfer_fungible_resp_json)

    return transfer_fungible_resp_json

# Get Fungibles in a user's wallet
@app.route('/users/fungibles', methods=['GET'])
def get_user_fungibles():
    account_id = request.args.get('accountId')

    if account_id not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422
    user_fungible_resp = requests.get(f'{target}/wallet/balances', headers=_create_header(accounts[account_id]['token']))
    print(user_fungible_resp.text)
    user_fungible_resp_json = user_fungible_resp.json()

    return user_fungible_resp_json

# Login or create account for user
@app.route('/highscores', methods=['POST'])
def update_highscore():
    account_id = request.json['accountId']
    highscore = request.json['highScore']

    if account_id in accounts:
        account = accounts[account_id]
        if highscore > account['highScore']:
            account['highScore'] = highscore
            with open('accounts.json', 'w') as accounts_file:
                json.dump(accounts, accounts_file)
        return jsonify({'success':True, 'result': {'highScore': account['highScore']}}), 200

    return jsonify({'success':False, 'error': 'Account not found'}), 200

def _create_header(token):
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer %s' % token
    }

def _account_id_to_email(account_id):
    return f'demo+{account_id}@test.com'

if __name__ == '__main__':
    accounts_file = open('accounts.json', "r")
    accounts = json.loads(accounts_file.read())
    app.run(port=5002, debug=True)
