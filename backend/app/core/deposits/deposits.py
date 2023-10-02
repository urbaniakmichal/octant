from _decimal import Decimal
from typing import Tuple, List

from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.core.common import UserDeposit
from app.core.deposits import weighted_average_strategy, min_value_strategy
from app.core.deposits.events import SimulatedEventsGenerator
from app.core.deposits.weighted_deposits import (
    WeightedDeposit,
    get_user_weighted_deposits,
)
from app.core.epochs.details import EpochDetails


def calculate_locked_ratio(total_effective_deposit: int, glm_supply: int) -> Decimal:
    return Decimal(total_effective_deposit) / Decimal(glm_supply)


def get_users_deposits(epoch: int) -> Tuple[List[UserDeposit], int]:
    if epoch == 1:
        return weighted_average_strategy.get_user_deposits(
            epoch
        )  # only applicable for epoch 1
    else:
        return min_value_strategy.get_user_deposits(epoch)


def get_estimated_effective_deposit(start: int, end: int, user_address: str) -> int:
    return weighted_average_strategy.get_estimated_effective_deposit(
        start, end, user_address
    )


def estimate_effective_deposit(deposits: List[WeightedDeposit]) -> int:
    return weighted_average_strategy.calculate_effective_deposit(deposits)


def estimate_locked_ratio(
    epoch: EpochDetails, amount: int, lock_duration: int
) -> Decimal:
    events_generator = SimulatedEventsGenerator(
        epoch.start_sec, epoch.end_sec, lock_duration, amount, epoch.remaining_sec
    )
    deposits = get_user_weighted_deposits(events_generator)
    effective_deposit = estimate_effective_deposit(deposits)
    return calculate_locked_ratio(effective_deposit, GLM_TOTAL_SUPPLY_WEI)


def get_estimated_total_effective_deposit(epoch: int) -> int:
    _, total = get_users_deposits(epoch)
    return total
