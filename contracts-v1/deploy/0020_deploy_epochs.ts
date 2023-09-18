import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH_ADDRESS, DECISION_WINDOW, EPOCH_DURATION, EPOCHS_START } from '../env';
import { AUTH, EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp } from '../helpers/misc-utils';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const authAddress = AUTH_ADDRESS || (await ethers.getContract(AUTH)).address;

  const now = await getLatestBlockTimestamp();
  let decisionWindow = DECISION_WINDOW;
  let epochDuration = EPOCH_DURATION;

  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    decisionWindow = 120;
    epochDuration = 300;
  }
  const start = EPOCHS_START || now;

  // eslint-disable-next-line no-console
  console.log(`start=${start}`);

  await deploy(EPOCHS, {
    args: [start, epochDuration, decisionWindow, authAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epoch2', 'epochs', 'local', 'test', 'testnet'];
