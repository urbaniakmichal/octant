import { BigNumber } from 'ethers';

export default interface AllocationItemProps {
  className?: string;
  id: BigNumber;
  isSelected: boolean;
  name: string;
  onChange: (id: number, value: number) => void;
  onSelectItem: (id: number) => void;
  percentage?: number;
  totalValueOfAllocations?: string;
  value?: number;
}
