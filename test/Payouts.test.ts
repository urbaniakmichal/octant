import { FakeContract, smock } from '@defi-wonderland/smock';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { makeTestsEnv } from './helpers/make-tests-env';

import { PAYOUTS } from '../helpers/constants';
import { forwardEpochs } from '../helpers/epochs-utils';
import { Payouts, Rewards } from '../typechain-types';

makeTestsEnv(PAYOUTS, testEnv => {
  let rewards: FakeContract<Rewards>;
  let payouts: Payouts;
  let withdrawals: FakeContract;

  beforeEach(async () => {
    const {
      epochs,
      signers: { Alice },
    } = testEnv;
    rewards = await smock.fake<Rewards>('Rewards');
    withdrawals = await smock.fake('Withdrawals');
    const payoutsFactory = await ethers.getContractFactory(PAYOUTS);
    payouts = (await payoutsFactory.deploy(
      rewards.address,
      epochs.address,
      withdrawals.address,
    )) as Payouts;
    await Alice.sendTransaction({ to: withdrawals.address, value: parseEther('1') });
    rewards.claimableReward.returns(parseEther('1'));
    await forwardEpochs(epochs, 2);
  });

  it('check if rewards contract is called once', async () => {
    const {
      signers: { Alice },
    } = testEnv;
    await payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('0.3'));
    expect(rewards.claimableReward).calledOnce;
    rewards.claimableReward.atCall(0).calledWith(1, Alice.address);
  });

  it('check if rewards contract is called twice', async () => {
    const {
      signers: { Alice },
    } = testEnv;
    await payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('2.0'));
    expect(rewards.claimableReward).calledTwice;
    rewards.claimableReward.atCall(0).calledWith(1, Alice.address);
    rewards.claimableReward.atCall(1).calledWith(2, Alice.address);
  });

  it("can't register more than earned", async () => {
    const {
      signers: { Alice },
    } = testEnv;
    // user gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
    expect(
      payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('3.1')),
    ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');
  });

  it('payout stay permanent if registration is reverted', async () => {
    const {
      signers: { Alice },
    } = testEnv;
    await payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('0.3'));
    let alicePayout = await payouts.payouts(Alice.address);
    expect(alicePayout.total).eq(parseEther('0.3'));
    expect(alicePayout.checkpointEpoch).eq(0);

    // user gets 1 ETH claimable rewards, it's third epoch so max possible payout is 3 ETH
    expect(
      payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('2.8')),
    ).to.be.revertedWith('HN:Payouts/registering-withdrawal-of-unearned-funds');

    alicePayout = await payouts.payouts(Alice.address);
    expect(alicePayout.total).eq(parseEther('0.3'));
    expect(alicePayout.extra).eq(parseEther('0.3'));
  });

  it('multiple registrations add up; checkpoint grows; extra is taken into account', async () => {
    const {
      signers: { Alice },
    } = testEnv;
    await payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('0.3'));
    let alicePayout = await payouts.payouts(Alice.address);
    expect(alicePayout.total).eq(parseEther('0.3'));
    expect(alicePayout.extra).eq(parseEther('0.3'));

    await payouts.connect(withdrawals.wallet).registerPayout(Alice.address, parseEther('0.8'));
    alicePayout = await payouts.payouts(Alice.address);
    expect(alicePayout.total).eq(parseEther('1.1'));
    expect(alicePayout.extra).eq(parseEther('0.1'));
    expect(alicePayout.checkpointEpoch).eq(1);
  });
});
