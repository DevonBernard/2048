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
    address = request.json['address']

    if address in accounts:
        account = accounts[address]
        return jsonify({'success':True, 'result': {'highScore': account['highScore']}}), 200

    payload = {
        'email': f'demo+{address}@test.com',
        'password': 'BadPassw0rd!',
        'persistLogin': True
    }
    headers = _create_header(tenant_auth_token)

    resp = requests.post(f'{target}/users/{tenant}/create', json=payload, headers=headers)
    resp_json = resp.json()

    if resp_json['success']:
        token = resp_json['result']['token']
        accounts[address] = {'token': token,'depositAddress':'', 'highScore': 0}
        with open('accounts.json', 'w') as accounts_file:
            json.dump(accounts, accounts_file)
        return jsonify({'success':True, 'result': {'highScore': 0}}), 200

    return jsonify({'success': False, 'error': 'Failed to login'}), 422

# Get NFTs in a user's wallet
@app.route('/users/nfts', methods=['GET'])
def get_user_nfts():
    address = request.args.get('address')

    if address not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422

    user_nft_resp = requests.get(f'{target}/nft/balances', headers=_create_header(accounts[address]['token']))
    user_nft_resp_json = user_nft_resp.json()

    return user_nft_resp_json

# Send an NFT to a user's wallet
@app.route('/nfts/award', methods=['POST'])
def award_nft():
    address = request.json['address']
    name = request.json['name']

    if address not in accounts:
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
        'blue': '2048blue'
    }
    if name not in promo_names:
        return jsonify({'success': False, 'error': 'Invalid NFT name'}), 422
    tenant_mint_resp = requests.post(f'{target}/promos/{promo_names[name]}', headers=_create_header(tenant_auth_token))
    tenant_mint_resp_json = tenant_mint_resp.json()
    if 'success' not in tenant_mint_resp_json or not tenant_mint_resp_json['success']:
        return jsonify({'success': False, 'error': 'Application failed to mint NFT'}), 422
    tenant_nft = tenant_mint_resp_json['result']['redeemed']
    
    # Transfer tenant NFT to user
    transfer_payload = {
        "coin": "SOL",
        "nftId": str(tenant_nft['id']),
        "method": "sol",
        "address": accounts[address]['depositAddress']
    }
    transfer_nft_resp = requests.post(f'{target}/wallet/withdrawals', json=transfer_payload, headers=_create_header(tenant_auth_token))
    transfer_nft_resp_json = transfer_nft_resp.json()

    if 'success' in transfer_nft_resp_json:
        return jsonify({'success': True, 'result': tenant_nft}), 200

    return jsonify({'success': False, 'error': 'Failed to award NFT to user'}), 422

def _create_header(token):
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer %s' % token
    }

if __name__ == '__main__':
    accounts_file = open('accounts.json', "r")
    accounts = json.loads(accounts_file.read())
    app.run(port=5002, debug=True)
