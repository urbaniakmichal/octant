import cx from 'classnames';
import {
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import React, { FC, Fragment, memo, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import AllocationItemRewards from 'components/Allocation/AllocationItemRewards';
import AllocationItemSkeleton from 'components/Allocation/AllocationItemSkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import Img from 'components/ui/Img';
import InputText from 'components/ui/InputText';
import Svg from 'components/ui/Svg';
import env from 'env';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import { bin } from 'svg/misc';
import { comma, floatNumberWithUpTo18DecimalPlaces } from 'utils/regExp';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isError,
  isThereAnyError,
  isLoadingError,
  name,
  onChange,
  onRemoveAllocationElement,
  profileImageSmall,
  value,
  setAddressesWithError,
  rewardsProps,
}) => {
  const { ipfsGateway } = env;
  const { isConnected } = useAccount();
  const { data: individualReward } = useIndividualReward();
  const { data: currentEpoch } = useCurrentEpoch();
  const { isFetching: isFetchingRewardsThreshold } = useProposalRewardsThreshold();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { isDesktop } = useMediaQuery();
  const [ref, animate] = useAnimate();
  const removeButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [localValue, setLocalValue] = useState<AllocationItemProps['value']>('');
  const [constraints, setConstraints] = useState([0, 0]);
  const [startX, setStartX] = useState(0);
  const x = useMotionValue(0);

  const removeButtonScaleTransform = useTransform(x, [constraints[1], constraints[0]], [0.8, 1]);

  const isEpoch1 = currentEpoch === 1;
  const isLoading = currentEpoch === undefined || isFetchingRewardsThreshold;

  const _onChange = (newValue: string) => {
    const valueComma = newValue.replace(comma, '.');
    if (valueComma && !floatNumberWithUpTo18DecimalPlaces.test(valueComma)) {
      return;
    }

    setLocalValue(valueComma);

    if (!isError) {
      onChange({ address, value: valueComma }, true);
    }
  };

  useEffect(() => {
    if (isError || !isDecisionWindowOpen) {
      return;
    }
    setLocalValue(value);
  }, [value, isDecisionWindowOpen, isError]);

  useMotionValueEvent(x, 'change', latest => {
    if (latest < constraints[0]) {
      x.set(constraints[0]);
    }

    if (latest > constraints[1]) {
      x.set(constraints[1]);
    }
  });

  useEffect(() => {
    if (!ref.current || !removeButtonRef.current || isLoading) {
      return;
    }
    const removeButtonLeftPadding = 16;
    const itemHeight = ref.current.getBoundingClientRect().height;

    setConstraints([(itemHeight + removeButtonLeftPadding) * -1, 0]);
  }, [ref, removeButtonRef, isDesktop, isLoading]);

  useEffect(() => {
    if (isError) {
      const timeout = setTimeout(() => {
        if (!inputRef?.current) {
          return;
        }
        onChange({ address, value: '0' }, true);
        setAddressesWithError(addressesWithError =>
          addressesWithError.filter(addressWithError => addressWithError !== address),
        );
        setLocalValue(value);

        // Trick to make inputRef.current.select() work.
        setTimeout(() => {
          if (!inputRef?.current) {
            return;
          }
          inputRef.current.select();
        }, 0);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isError, inputRef, localValue]);

  return (
    <motion.div
      className={cx(styles.root, className)}
      exit={{ opacity: 0, scale: 0.8 }}
      layout
      transition={{ duration: 0.1, ease: 'easeOut' }}
    >
      <motion.div
        ref={removeButtonRef}
        className={styles.removeButton}
        onClick={onRemoveAllocationElement}
        style={{ scale: removeButtonScaleTransform }}
      >
        <Svg img={bin} size={isDesktop ? [2.4, 2.2] : [2, 1.8]} />
      </motion.div>
      <motion.div
        ref={ref}
        drag="x"
        dragConstraints={{ left: constraints[0], right: constraints[1] }}
        dragElastic={false}
        dragMomentum={false}
        onDragEnd={e => {
          if (e.type === 'pointercancel') {
            /**
             * Prevents horizontal scroll to be fired when user scrolls the view vertically
             * on mobile devices.
             *
             * Without that whenever user holds the view on the AllocationItem and wants to drag
             * the view vertically AllocationItem drags itself horizontally, exposing removeButton.
             */
            return;
          }
          animate(
            ref.current,
            // @ts-expect-error e is wrongly typed, doesn't see x property.
            { x: e.x < startX ? constraints[0] : constraints[1] },
            { duration: 0.2 },
          );
        }}
        // @ts-expect-error e is wrongly typed, doesn't see x property.
        onDragStart={e => setStartX(e.x)}
        style={{ x }}
      >
        <BoxRounded
          childrenWrapperClassName={cx(
            styles.boxRoundedChildren,
            !isError && isThereAnyError && styles.isThereAnyError,
          )}
          className={styles.box}
          hasPadding={false}
        >
          {(isLoading || isLoadingError) && <AllocationItemSkeleton />}
          {!isLoading && !isLoadingError && (
            <Fragment>
              <div className={styles.projectData}>
                <Img
                  className={styles.image}
                  dataTest="ProposalItem__imageProfile"
                  src={`${ipfsGateway}${profileImageSmall}`}
                />
                <div className={styles.nameAndRewards}>
                  <div className={styles.name}>{name}</div>
                  <AllocationItemRewards
                    address={address}
                    isError={isError}
                    value={value}
                    {...rewardsProps}
                  />
                </div>
              </div>
              <InputText
                ref={inputRef}
                className={cx(styles.input, isEpoch1 && styles.isEpoch1, isError && styles.isError)}
                error={isError}
                isDisabled={
                  !isConnected ||
                  individualReward?.isZero() ||
                  !isDecisionWindowOpen ||
                  isThereAnyError
                }
                onChange={event => _onChange(event.target.value)}
                placeholder="0.000"
                shouldAutoFocusAndSelect={false}
                suffix="ETH"
                textAlign="right"
                value={localValue}
                variant="allocation"
              />
            </Fragment>
          )}
        </BoxRounded>
      </motion.div>
    </motion.div>
  );
};

export default memo(AllocationItem);
