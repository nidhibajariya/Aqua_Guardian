import json
import os
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3
from .web3_client import w3, account, BLOCKCHAIN_AVAILABLE

load_dotenv()

contract = None

# Initialize contract if blockchain is available
if BLOCKCHAIN_AVAILABLE:
    try:
        # Load compiled contract ABI and bytecode
        CONTRACT_ABI_PATH = Path(__file__).parent / "PollutionRegistry_abi.json"
        
        if CONTRACT_ABI_PATH.is_file():
            with open(CONTRACT_ABI_PATH) as f:
                contract_abi = json.load(f)

            # Load contract address from env
            CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
            if CONTRACT_ADDRESS:
                # Create contract instance
                contract = w3.eth.contract(address=Web3.toChecksumAddress(CONTRACT_ADDRESS), abi=contract_abi)
            else:
                print("WARNING: CONTRACT_ADDRESS not set in environment. Blockchain features disabled.")
                BLOCKCHAIN_AVAILABLE = False
        else:
            print("WARNING: Contract ABI file not found. Blockchain features disabled.")
            BLOCKCHAIN_AVAILABLE = False
    except Exception as e:
        print(f"WARNING: Failed to initialize contract: {e}")
        BLOCKCHAIN_AVAILABLE = False

def log_report(report_hash: str, report_id: str, ai_decision: str, reviewer_decision: str, location_hash: str) -> tuple:
    """Send a transaction to log a new pollution report with metadata.
    Returns the newly created report numerical ID and tx hash.
    """
    if not BLOCKCHAIN_AVAILABLE or not contract:
        print(f"MOCK: Blockchain unavailable.")
        print(f"MOCK: Logging Report Metadata to Audit Trail:")
        print(f"  - Report Hash: {report_hash}")
        print(f"  - Report UUID: {report_id}")
        print(f"  - AI Decision: {ai_decision}")
        print(f"  - Reviewer Decision: {reviewer_decision}")
        print(f"  - Location Hash: {location_hash}")
        return 0, "0x_mock_tx_hash"

    try:
        if not report_hash.startswith('0x'):
            raise ValueError('report_hash must be a hex string starting with 0x')
        if not location_hash.startswith('0x'):
            raise ValueError('location_hash must be a hex string starting with 0x')
            
        txn = contract.functions.logReport(
            Web3.toBytes(hexstr=report_hash),
            report_id,
            ai_decision,
            reviewer_decision,
            Web3.toBytes(hexstr=location_hash)
        ).buildTransaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 500000, # Increased gas for more state variables
            'gasPrice': w3.toWei('5', 'gwei')
        })
        signed_txn = account.sign_transaction(txn)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        # The contract returns the ID in the ReportLogged event
        logs = contract.events.ReportLogged().processReceipt(receipt)
        if not logs:
            raise RuntimeError('No ReportLogged event found')
        return logs[0]['args']['id'], tx_hash.hex()
    except Exception as e:
        print(f"ERROR: log_report failed: {e}")
        raise e

def verify_report(report_id: int) -> None:
    """Verify a report by its ID."""
    if not BLOCKCHAIN_AVAILABLE or not contract:
        print(f"MOCK: Blockchain unavailable. Mock verifying report: {report_id}")
        return

    txn = contract.functions.verifyReport(report_id).buildTransaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 150000,
        'gasPrice': w3.toWei('5', 'gwei')
    })
    signed_txn = account.sign_transaction(txn)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return

def get_report(report_id: int):
    """Read‑only call to fetch report details."""
    if not BLOCKCHAIN_AVAILABLE or not contract:
        return {"id": report_id, "mock": True, "details": "Blockchain unavailable"}

    return contract.functions.getReport(report_id).call()

def report_exists(report_hash: str):
    """Check if a report hash already exists on‑chain."""
    if not BLOCKCHAIN_AVAILABLE or not contract:
        return False, 0

    return contract.functions.reportHashExists(Web3.toBytes(hexstr=report_hash)).call()
