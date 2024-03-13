from typing import List, Tuple, Dict, Optional

from app.context.epoch_state import EpochState
from app.context.manager import epoch_context, state_context
from app.exceptions import (
    NotImplementedForGivenEpochState,
    InvalidEpoch,
    NotInDecisionWindow,
)
from app.modules.dto import (
    AccountFundsDTO,
    ProposalDonationDTO,
    UserAllocationRequestPayload,
    UserAllocationPayload,
    AllocationItem,
)
from app.modules.registry import get_services
from app.modules.user.allocations.service.pending import PendingUserAllocations
from app.modules.user.allocations.service.history import UserAllocationsHistory


def get_user_next_nonce(user_address: str) -> int:
    service: UserAllocationsHistory = get_services(
        EpochState.CURRENT
    ).user_allocations_history_service
    return service.get_next_user_nonce(user_address)


def get_all_allocations(epoch_num: int) -> List[ProposalDonationDTO]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_allocations_service
    return service.get_all_allocations(context)


def get_last_user_allocation(
    user_address: str, epoch_num: int
) -> Tuple[List[AccountFundsDTO], Optional[bool]]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_allocations_service
    return service.get_last_user_allocation(context, user_address)


def get_donors(epoch_num: int) -> List[str]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_allocations_service
    return service.get_all_donors_addresses(context)


def allocate(payload: Dict, **kwargs):
    context = state_context(EpochState.PENDING)
    service: PendingUserAllocations = get_services(
        context.epoch_state
    ).user_allocations_service

    allocation_request = _deserialize_payload(payload)
    service.allocate(context, allocation_request, **kwargs)


def simulate_allocation(
    payload: Dict, user_address: str
) -> Tuple[float, int, List[Dict[str, int]]]:
    context = state_context(EpochState.PENDING)
    service: PendingUserAllocations = get_services(
        context.epoch_state
    ).user_allocations_service
    user_allocations = _deserialize_items(payload)
    leverage, threshold, projects_rewards = service.simulate_allocation(
        context, user_allocations, user_address
    )

    matched = [{"address": p.address, "value": p.matched} for p in projects_rewards]

    return leverage, threshold, matched


def revoke_previous_allocation(user_address: str):
    context = None

    try:
        context = state_context(EpochState.PENDING)
    except InvalidEpoch:
        raise NotInDecisionWindow

    service: PendingUserAllocations = get_services(
        context.epoch_state
    ).user_allocations_service
    service.revoke_previous_allocation(context, user_address)


def _deserialize_payload(payload: Dict) -> UserAllocationRequestPayload:
    allocation_items = _deserialize_items(payload.payload)
    nonce = int(payload.payload["nonce"])
    signature = payload.signature

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocation_items, nonce), signature=signature
    )


def _deserialize_items(payload: Dict) -> List[AllocationItem]:
    print(payload["allocations"])
    return [
        AllocationItem(
            proposal_address=allocation_data["proposalAddress"],
            amount=int(allocation_data["amount"]),
        )
        for allocation_data in payload["allocations"]
    ]
