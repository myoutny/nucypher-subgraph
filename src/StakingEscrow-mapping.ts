import { BigInt } from "@graphprotocol/graph-ts"
import {
  StakingEscrow,
  CommitmentMade,
  Deposited,
  Divided,
  Donated,
  Initialized,
  Locked,
  Merged,
  Minted,
  OwnershipTransferred,
  Prolonged,
  ReStakeLocked,
  ReStakeSet,
  Slashed,
  SnapshotSet,
  StateVerified,
  UpgradeFinished,
  WindDownSet,
  Withdrawn,
  WorkMeasurementSet,
  WorkerBonded
} from "../generated/StakingEscrow/StakingEscrow"
import { ExampleEntity } from "../generated/schema"


export function handleCommitmentMade(event: CommitmentMade): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.staker = event.params.staker
  entity.period = event.params.period

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.MAX_SUB_STAKES(...)
  // - contract.adjudicator(...)
  // - contract.balanceHistory(...)
  // - contract.currentMintingPeriod(...)
  // - contract.currentPeriodSupply(...)
  // - contract.findIndexOfPastDowntime(...)
  // - contract.firstPhaseMaxIssuance(...)
  // - contract.firstPhaseTotalSupply(...)
  // - contract.getActiveStakers(...)
  // - contract.getAllTokens(...)
  // - contract.getCompletedWork(...)
  // - contract.getCurrentPeriod(...)
  // - contract.getFlags(...)
  // - contract.getLastCommittedPeriod(...)
  // - contract.getLastPeriodOfSubStake(...)
  // - contract.getLockedTokens(...)
  // - contract.getPastDowntime(...)
  // - contract.getPastDowntimeLength(...)
  // - contract.getReservedReward(...)
  // - contract.getStakersLength(...)
  // - contract.getSubStakeInfo(...)
  // - contract.getSubStakesLength(...)
  // - contract.getWorkerFromStaker(...)
  // - contract.isOwner(...)
  // - contract.isReStakeLocked(...)
  // - contract.isTestContract(...)
  // - contract.isUpgrade(...)
  // - contract.lockDurationCoefficient1(...)
  // - contract.lockDurationCoefficient2(...)
  // - contract.lockedPerPeriod(...)
  // - contract.maxAllowableLockedTokens(...)
  // - contract.maximumRewardedPeriods(...)
  // - contract.minAllowableLockedTokens(...)
  // - contract.minLockedPeriods(...)
  // - contract.minWorkerPeriods(...)
  // - contract.mintingCoefficient(...)
  // - contract.owner(...)
  // - contract.policyManager(...)
  // - contract.previousPeriodSupply(...)
  // - contract.previousTarget(...)
  // - contract.secondsPerPeriod(...)
  // - contract.setWorkMeasurement(...)
  // - contract.stakerFromWorker(...)
  // - contract.stakerInfo(...)
  // - contract.stakers(...)
  // - contract.supportsHistory(...)
  // - contract.target(...)
  // - contract.token(...)
  // - contract.totalStakedAt(...)
  // - contract.totalStakedForAt(...)
  // - contract.totalSupply(...)
  // - contract.workLock(...)
}

export function handleDeposited(event: Deposited): void {}

export function handleDivided(event: Divided): void {}

export function handleDonated(event: Donated): void {}

export function handleInitialized(event: Initialized): void {}

export function handleLocked(event: Locked): void {}

export function handleMerged(event: Merged): void {}

export function handleMinted(event: Minted): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleProlonged(event: Prolonged): void {}

export function handleReStakeLocked(event: ReStakeLocked): void {}

export function handleReStakeSet(event: ReStakeSet): void {}

export function handleSlashed(event: Slashed): void {}

export function handleSnapshotSet(event: SnapshotSet): void {}

export function handleStateVerified(event: StateVerified): void {}

export function handleUpgradeFinished(event: UpgradeFinished): void {}

export function handleWindDownSet(event: WindDownSet): void {}

export function handleWithdrawn(event: Withdrawn): void {}

export function handleWorkMeasurementSet(event: WorkMeasurementSet): void {}

export function handleWorkerBonded(event: WorkerBonded): void {}
