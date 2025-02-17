import { GenericAbortSignal } from 'axios';

import env from 'env';
import apiService from 'services/apiService';

export type Response = {
  communityFund: string | null;
  individualRewards: string;
  leftover: string | null;
  matchedRewards: string | null;
  operationalCost: string;
  patronsRewards: string | null;
  ppf: string | null;
  stakingProceeds: string;
  totalEffectiveDeposit: string;
  totalRewards: string;
  totalWithdrawals: string | null;
};

export async function apiGetEpochInfo(
  epoch: number,
  signal?: GenericAbortSignal,
): Promise<Response> {
  return apiService
    .get(`${env.serverEndpoint}epochs/info/${epoch}`, { signal })
    .then(({ data }) => data);
}
