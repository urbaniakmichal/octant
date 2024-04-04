from eth_account.messages import defunct_hash_message

from app.extensions import w3
from app.infrastructure.contracts import abi
from app.infrastructure.contracts.gnosis_safe import GnosisSafe


def is_valid_signature(address: str, msg_hash: str, signature: str) -> bool:
    contract = GnosisSafe(
        w3=w3, contract=w3.eth.contract(address=address, abi=abi.GNOSIS_SAFE)
    )
    return contract.is_valid_signature(msg_hash, signature)


def get_message_hash(address: str, message: str) -> str:
    contract = GnosisSafe(
        w3=w3, contract=w3.eth.contract(address=address, abi=abi.GNOSIS_SAFE)
    )
    # TODO adjust it for structured data EIP-712 OCT-1530
    msg_hash = defunct_hash_message(text=message)
    return f"0x{contract.get_message_hash(msg_hash).hex()}"
