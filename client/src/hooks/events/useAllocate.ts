import { useSignTypedData } from 'wagmi';

import { WebsocketEmitEvent } from 'types/websocketEvents';
import { AllocationValues } from 'views/AllocationView/types';

const websocketService = () => import('services/websocketService');

type UseAllocateProps = {
  onSuccess: () => void;
};

type UseAllocate = { emit: (allocations: AllocationValues) => void; isLoading: boolean };

const domain = {
  chainId: 11155111,
  name: 'Octant',
  version: '1.0.0',
};

const types = {
  Allocation: [
    { name: 'proposalAddress', type: 'string' },
    { name: 'amount', type: 'uint256' },
  ],
  AllocationPayload: [{ name: 'allocations', type: 'Allocation[]' }],
};

export default function useAllocate({ onSuccess }: UseAllocateProps): UseAllocate {
  const { signTypedData, isLoading } = useSignTypedData({
    domain,
    message: {
      value: 'Octant Allocation',
    },
    onSuccess: async (data, variables) => {
      websocketService().then(socket => {
        socket.default.emit(
          WebsocketEmitEvent.allocate,
          JSON.stringify({
            // @ts-expect-error TODO solve types issue.
            payload: variables.value,
            signature: data.substring(2),
          }),
        );
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    primaryType: 'AllocationPayload',
    types,
  });

  const allocate = (allocations: AllocationValues) => {
    const allocationsMapped = allocations.map(({ address, value }) => ({
      amount: BigInt(value.toHexString()),
      proposalAddress: address,
    }));

    const message = {
      allocations: allocationsMapped,
    };

    signTypedData({
      message,
      primaryType: 'Allocation',
      types,
    });
  };

  return { emit: allocate, isLoading };
}
