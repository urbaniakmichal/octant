from datetime import datetime
from enum import StrEnum
from typing import Optional

from app.extensions import db
from app.infrastructure.database.models import MultisigSignatures
from app.modules.multisig_signatures.dto import SignatureOpType


class SigStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"


def get_last_pending_signature(
    user_address: str, op_type: SignatureOpType, dt: Optional[datetime] = None
) -> MultisigSignatures | None:
    last_signature = MultisigSignatures.query.filter_by(
        address=user_address, type=op_type, status=SigStatus.PENDING
    ).order_by(MultisigSignatures.created_at.desc())

    if dt is not None:
        last_signature.filter(MultisigSignatures.created_at <= dt)

    return last_signature.first()


def save_signature(
    user_address: str,
    op_type: SignatureOpType,
    message: str,
    msg_hash: str,
    status: SigStatus = SigStatus.PENDING,
):
    signature = MultisigSignatures(
        address=user_address,
        type=op_type,
        message=message,
        hash=msg_hash,
        status=status,
    )
    db.session.add(signature)
