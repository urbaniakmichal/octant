from dataclasses import dataclass
from typing import List, Dict

from dataclass_wizard import JSONWizard

from app import database, exceptions
from app.contracts.proposals import proposals
from app.core.epochs import has_pending_epoch_snapshot
from app.core.user import get_budget
from app.crypto.eip712 import recover_address, build_allocations_eip712_data


@dataclass(frozen=True)
class Allocation(JSONWizard):
    proposal_address: str
    amount: int


@dataclass(frozen=True)
class AllocationRequest:
    payload: Dict
    signature: str
    override_existing_allocations: bool


def add_allocations_to_db(
    epoch: int,
    user_address: str,
    allocations: List[Allocation],
    delete_existing_user_epoch_allocations: bool,
):
    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    if delete_existing_user_epoch_allocations:
        database.allocations.soft_delete_all_by_epoch_and_user_id(epoch, user.id)

    database.allocations.add_all(epoch, user.id, allocations)


def recover_user_address(request: AllocationRequest) -> str:
    eip712_data = build_allocations_eip712_data(request.payload)
    return recover_address(eip712_data, request.signature)


def deserialize_payload(payload) -> List[Allocation]:
    return [
        Allocation.from_dict(allocation_data)
        for allocation_data in payload["allocations"]
    ]


def verify_allocations(epoch: int, user_address: str, allocations: List[Allocation]):
    if epoch == 0:
        raise exceptions.NotInDecisionWindow

    if not has_pending_epoch_snapshot(epoch):
        raise exceptions.MissingSnapshot

    # Check if the list of proposal addresses is a subset of
    # proposal addresses in the Proposals contract
    proposal_addresses = [a.proposal_address for a in allocations]
    valid_proposals = proposals.get_proposal_addresses(epoch)
    invalid_proposals = list(set(proposal_addresses) - set(valid_proposals))

    if invalid_proposals:
        raise exceptions.InvalidProposals(invalid_proposals)

    # Check if any allocation address has been duplicated in the payload
    [proposal_addresses.remove(p) for p in set(proposal_addresses)]

    if proposal_addresses:
        raise exceptions.DuplicatedProposals(proposal_addresses)

    # Check if user address is not in one of the allocations
    for allocation in allocations:
        if allocation.proposal_address == user_address:
            raise exceptions.ProposalAllocateToItself

    # Check if user didn't exceed his budget
    user_budget = get_budget(user_address, epoch)
    proposals_sum = sum([a.amount for a in allocations])

    if proposals_sum > user_budget:
        raise exceptions.RewardsBudgetExceeded
