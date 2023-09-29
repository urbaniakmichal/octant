import { Root, QueryKeys } from './types';

export const ROOTS: Root = {
  cryptoValues: 'cryptoValues',
  depositAt: 'depositAt',
  proposalDonors: 'proposalDonors',
  proposalsContract: 'proposalsContract',
  proposalsIpfsResults: 'proposalsIpfsResults',
  userHistoricAllocations: 'userHistoricAllocations',
  userTOS: 'userTOS',
};

export const QUERY_KEYS: QueryKeys = {
  blockNumber: ['blockNumber'],
  cryptoValues: fiatCurrency => [ROOTS.cryptoValues, fiatCurrency],
  currentEpoch: ['currentEpoch'],
  currentEpochEnd: ['currentEpochEnd'],
  currentEpochProps: ['currentEpochProps'],
  depositAtGivenEpoch: epochNumber => [ROOTS.depositAt, epochNumber.toString()],
  depositsValue: ['depositsValue'],
  glmClaimCheck: ['glmClaimCheck'],
  history: ['history'],
  individualProposalRewards: ['individualProposalRewards'],
  individualReward: ['individualReward'],
  isDecisionWindowOpen: ['isDecisionWindowOpen'],
  lockedSummaryLatest: ['lockedSummaryLatest'],
  matchedProposalRewards: ['matchedProposalRewards'],
  proposalDonors: proposalAddress => [ROOTS.proposalDonors, proposalAddress],
  proposalRewardsThreshold: ['proposalRewardsThreshold'],
  proposalsAllIpfs: ['proposalsAllIpfs'],
  proposalsCid: ['proposalsCid'],
  proposalsContract: epochNumber => [ROOTS.proposalsContract, epochNumber.toString()],
  proposalsIpfsResults: proposalAddress => [ROOTS.proposalsIpfsResults, proposalAddress],
  unlocks: ['unlocks'],
  userAllocations: ['userAllocations'],
  userHistoricAllocations: userAddress => [ROOTS.userHistoricAllocations, userAddress],
  userTOS: userAddress => [ROOTS.userTOS, userAddress],
  withdrawableUserEth: ['withdrawableUserEth'],
};
