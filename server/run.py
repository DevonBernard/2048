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
        return jsonify({'success':True}), 200

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
        accounts[address] = {'token': token,'depositAddress':''}
        with open('accounts.json', 'w') as accounts_file:
            json.dump(accounts, accounts_file)
        return jsonify({'success':True}), 200

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

    if address not in accounts:
        return jsonify({'success':False, 'error': 'Account not found'}), 422

    # Load available tenant NFTs
    tenant_nft_resp = requests.get(f'{target}/nft/balances', headers=_create_header(tenant_auth_token))
    tenant_nft_resp_json = tenant_nft_resp.json()
    tenant_nft = None
    if 'success' in tenant_nft_resp_json:
        tenant_nft = tenant_nft_resp_json['result'][0]
    
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
        return jsonify({'success': True}), 200

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