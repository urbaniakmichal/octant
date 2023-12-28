from decimal import Decimal

MNEMONIC = "test test test test test test test test test test test junk"
MOCKED_PENDING_EPOCH_NO = 1
MOCKED_FINALIZED_EPOCH_NO = 1
MOCKED_CURRENT_EPOCH_NO = 2
ETH_PROCEEDS = 402_410958904_110000000
TOTAL_ED = 100022700_000000000_099999994
USER1_ED = 1500_000055377_000000000
USER2_ED = 5500_000000000_000000000
USER3_ED = 2000_000000000_000000000
USER1_BUDGET = 1526868_989237987
USER2_BUDGET = 5598519_420519815
USER3_BUDGET = 2035825_243825387
USER_MOCKED_BUDGET = 10 * 10**18 * 10**18

LOCKED_RATIO = Decimal("0.100022700000000000099999994")
TOTAL_REWARDS = 321_928767123_288031232
ALL_INDIVIDUAL_REWARDS = 101_814368807_786782825
MATCHED_REWARDS = TOTAL_REWARDS - ALL_INDIVIDUAL_REWARDS

USER1_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
USER2_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
USER3_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

DEPLOYER_PRIV = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ALICE = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
ALICE_ADDRESS = USER1_ADDRESS
BOB = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
BOB_ADDRESS = USER2_ADDRESS
CAROL = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
CAROL_ADDRESS = USER3_ADDRESS
