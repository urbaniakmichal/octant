import cx from 'classnames';
import { BigNumber } from 'ethers';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useDepositValue from 'hooks/queries/useDepositValue';
import getFormattedGlmValue from 'utils/getFormattedGlmValue';

import styles from './BudgetBox.module.scss';
import BudgetBoxProps from './types';

const BudgetBox: FC<BudgetBoxProps> = ({
  className,
  isWalletBalanceError,
  isCurrentlyLockedError,
}) => {
  const { data: availableFundsGlm } = useAvailableFundsGlm();
  const { data: depositsValue } = useDepositValue();

  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.budgetBox',
  });

  const currentlyLocked = useMemo(
    () => getFormattedGlmValue(depositsValue || BigNumber.from(0)).fullString,
    [depositsValue],
  );

  const walletBalance = getFormattedGlmValue(
    BigNumber.from(availableFundsGlm ? availableFundsGlm!.value : 0),
  ).fullString;

  return (
    <BoxRounded alignment="left" className={className} hasPadding={false} isGrey isVertical>
      <div className={styles.budgetRow}>
        <div className={styles.budgetLabel}>{t('currentlyLocked')}</div>
        <div className={cx(styles.budgetValue, isCurrentlyLockedError && styles.isError)}>
          {currentlyLocked}
        </div>
      </div>
      <div className={styles.budgetRow}>
        <div className={styles.budgetLabel}>{t('walletBalance')}</div>
        <div className={cx(styles.budgetValue, isWalletBalanceError && styles.isError)}>
          {walletBalance}
        </div>
      </div>
    </BoxRounded>
  );
};

export default BudgetBox;
