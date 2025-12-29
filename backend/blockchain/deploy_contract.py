import os
import json
from pathlib import Path
from dotenv import load_dotenv
import solcx
from solcx import compile_source, install_solc
from web3 import Web3

load_dotenv()

# Ensure Solidity compiler version
install_solc('0.8.19')

# Load contract source
contract_path = Path(__file__).parent.parent.parent / 'blockchain' / 'contracts' / 'PollutionRegistry.sol'
with open(contract_path, 'r') as f:
    contract_source = f.read()

# Compile contract
solcx.set_solc_version('0.8.19')
compiled_sol = compile_source(contract_source, output_values=['abi', 'bin'])
contract_id, contract_interface = compiled_sol.popitem()
abi = contract_interface['abi']
bytecode = contract_interface['bin']

# Save ABI and bytecode for later use
output_dir = Path(__file__).parent
with open(output_dir / 'PollutionRegistry_abi.json', 'w') as f:
    json.dump(abi, f)
with open(output_dir / 'PollutionRegistry_bytecode.txt', 'w') as f:
    f.write(bytecode)

# Connect to blockchain
rpc_url = os.getenv('BLOCKCHAIN_RPC_URL') or os.getenv('WEB3_PROVIDER_URL')
private_key = os.getenv('BLOCKCHAIN_PRIVATE_KEY') or os.getenv('DEPLOYER_PRIVATE_KEY') or os.getenv('PRIVATE_KEY')
if not rpc_url or not private_key:
    raise EnvironmentError('Blockchain RPC URL and Private Key must be set in .env (BLOCKCHAIN_RPC_URL/WEB3_PROVIDER_URL and BLOCKCHAIN_PRIVATE_KEY/DEPLOYER_PRIVATE_KEY)')

w3 = Web3(Web3.HTTPProvider(rpc_url))
account = w3.eth.account.from_key(private_key)

# Deploy contract
PollutionRegistry = w3.eth.contract(abi=abi, bytecode=bytecode)
nonce = w3.eth.get_transaction_count(account.address)
transaction = PollutionRegistry.constructor().buildTransaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 3000000,
    'gasPrice': w3.toWei('5', 'gwei')
})

signed_txn = account.sign_transaction(transaction)
tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
print(f'Deploying contract... tx hash: {tx_hash.hex()}')
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = receipt.contractAddress
print(f'Contract deployed at address: {contract_address}')

# Save contract address to .env (append or update)
env_path = Path(__file__).parent.parent / '.env'
with open(env_path, 'a') as f:
    f.write(f"\nCONTRACT_ADDRESS={contract_address}\n")

print('Deployment complete. CONTRACT_ADDRESS added to .env')
