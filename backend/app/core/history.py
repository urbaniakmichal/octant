import datetime
from dataclasses import dataclass
from enum import StrEnum
from typing import List

from app.database import allocations

from app.infrastructure.qraphql.locks import get_locks_by_address
from app.infrastructure.qraphql.unlocks import get_unlocks_by_address


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"


@dataclass(frozen=True)
class LockItem:
    type: OpType
    amount: int
    timestamp: int  # Should be in microseconds


@dataclass(frozen=True)
class AllocationItem:
    address: str
    epoch: int
    amount: int
    timestamp: int  # Should be in microseconds


def get_locks(user_address: str, from_timestamp_us: int) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.LOCK, amount=int(r["amount"]), timestamp=int(r["timestamp"])
        )
        for r in get_locks_by_address(user_address)
        if int(r["timestamp"]) >= from_timestamp_us
    ]


def get_unlocks(user_address: str, from_timestamp_us: int) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.UNLOCK, amount=int(r["amount"]), timestamp=int(r["timestamp"])
        )
        for r in get_unlocks_by_address(user_address)
        if int(r["timestamp"]) >= from_timestamp_us
    ]


def get_allocations(user_address: str, from_timestamp_us: int):
    return [
        AllocationItem(
            address=r.proposal_address,
            epoch=r.epoch,
            amount=r.amount,
            timestamp=_datetime_to_microseconds(r.created_at),
        )
        for r in allocations.get_all_by_user(user_address)
        if _datetime_to_microseconds(r.created_at) >= from_timestamp_us
    ]


def _datetime_to_microseconds(date: datetime.datetime) -> int:
    return int(date.timestamp() * 10**6)
