import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

# Load RPC URL and private key from environment variables
RPC_URL = os.getenv('BLOCKCHAIN_RPC_URL') or os.getenv('WEB3_PROVIDER_URL')
PRIVATE_KEY = os.getenv('BLOCKCHAIN_PRIVATE_KEY') or os.getenv('DEPLOYER_PRIVATE_KEY') or os.getenv('PRIVATE_KEY')

w3 = None
account = None
BLOCKCHAIN_AVAILABLE = False

try:
    if RPC_URL and PRIVATE_KEY:
        # Initialize Web3 instance
        w3_temp = Web3(Web3.HTTPProvider(RPC_URL))
        
        # Check connection - support both v5 and v6
        is_connected = False
        if hasattr(w3_temp, 'is_connected'):
            is_connected = w3_temp.is_connected()
        elif hasattr(w3_temp, 'isConnected'):
            is_connected = w3_temp.isConnected()
            
        if is_connected:
            w3 = w3_temp
            # Account object for signing transactions
            account = w3.eth.account.from_key(PRIVATE_KEY)
            BLOCKCHAIN_AVAILABLE = True
        else:
            print(f"WARNING: Unable to connect to blockchain at {RPC_URL}")
    else:
         print("WARNING: Blockchain credentials not found in environment (BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY). Blockchain features disabled.")
except Exception as e:
    print(f"WARNING: Blockchain initialization failed: {e}")
    BLOCKCHAIN_AVAILABLE = False
