import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from 'api/queryKeys';
import useContractProposals from 'hooks/contracts/useContractProposals';

export default function useProposalsCid(): UseQueryResult<string> {
  const contractProposals = useContractProposals();

  return useQuery(QUERY_KEYS.proposalsCid, () => contractProposals?.methods.cid().call(), {
    enabled: !!contractProposals,
  });
}
