import {BigInt} from "@graphprotocol/graph-ts"
import {
    CommitmentMade,
    Deposited,
    Divided,
    Locked,
    Merged,
    Migrated,
    Minted,
    ReStakeSet,
    Slashed,
    SnapshotSet,
    StakingEscrow,
    WindDownSet,
    Withdrawn,
    WorkerBonded
} from "../generated/StakingEscrow/StakingEscrow"
import {
    convertToDecimal,
    createPeriod,
    finalizePeriod,
    getOrCreateStaker,
    getOrCreateTransaction,
    getPeriodNumber,
    makeEventId,
    NULL_ADDRESS
} from "../utils/helpers";
import {
    CommitmentEvent,
    DepositedEvent,
    DividedEvent,
    LockedEvent,
    MergedEvent,
    MigratedEvent,
    MintedEvent,
    Period,
    ReStakeEvent,
    SlashedEvent,
    WindDownEvent,
    WithdrawEvent,
    WorkerBondedEvent
} from "../generated/schema";


export function handleLocked(event: Locked): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let contract = StakingEscrow.bind(event.address)
    let lockedEvent = new LockedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // base
    lockedEvent.transaction = event.transaction.hash.toHex()
    lockedEvent.timestamp = event.block.timestamp.toI32()
    lockedEvent.period = periodNumber.toString()
    lockedEvent.staker = staker.id

    // record
    lockedEvent.value = convertToDecimal(event.params.value)
    lockedEvent.firstPeriod = BigInt.fromI32(event.params.firstPeriod)
    lockedEvent.duration = BigInt.fromI32(event.params.periods)
    lockedEvent.save()

    // staker
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.save()

}

export function handleDivided(event: Divided): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let contract = StakingEscrow.bind(event.address)
    let dividedEvent = new DividedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    dividedEvent.transaction = event.transaction.hash.toHex()
    dividedEvent.timestamp = event.block.timestamp.toI32()
    dividedEvent.period = periodNumber.toString()
    dividedEvent.staker = staker.id

    // event record
    dividedEvent.oldValue = convertToDecimal(event.params.oldValue)
    dividedEvent.newValue = convertToDecimal(event.params.newValue)
    dividedEvent.lastPeriod = BigInt.fromI32(event.params.lastPeriod)
    dividedEvent.duration = BigInt.fromI32(event.params.periods)
    dividedEvent.save()

    // staker
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.save()
}

export function handleMerged(event: Merged): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let contract = StakingEscrow.bind(event.address)
    let mergedEvent = new MergedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    mergedEvent.transaction = event.transaction.hash.toHex()
    mergedEvent.timestamp = event.block.timestamp.toI32()
    mergedEvent.period = periodNumber.toString()
    mergedEvent.staker = staker.id

    // event record
    mergedEvent.value1 = convertToDecimal(event.params.value1)
    mergedEvent.value2 = convertToDecimal(event.params.value2)
    mergedEvent.lastPeriod = BigInt.fromI32(event.params.lastPeriod)
    mergedEvent.save()

    // staker
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.save()
}

export function handleCommitmentMade(event: CommitmentMade): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let currentPeriodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let commitmentEvent = new CommitmentEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    commitmentEvent.transaction = event.transaction.hash.toHex()
    commitmentEvent.timestamp = event.block.timestamp.toI32()
    commitmentEvent.period = currentPeriodNumber.toString()
    commitmentEvent.staker = staker.id

    // event record
    commitmentEvent.commitmentPeriod = BigInt.fromI32(event.params.period)
    commitmentEvent.save()

    let nextPeriodNumber = event.params.period
    let nextPeriod = Period.load(nextPeriodNumber.toString())
    if (nextPeriod == null) {
        // Finalize previous period before creating the next one.
        finalizePeriod(nextPeriodNumber - 2)
        // Initialize the next period
        nextPeriod = createPeriod(BigInt.fromI32(nextPeriodNumber), event.block.timestamp.toI32())
    }

    // Accumulate the next period's data
    nextPeriod.totalStaked = nextPeriod.totalStaked.plus(convertToDecimal(event.params.value))
    nextPeriod.activeStakers = nextPeriod.activeStakers.plus(BigInt.fromI32(1))
    nextPeriod.save()

    // Update this staker's last commitment period
    let contract = StakingEscrow.bind(event.address)
    staker.staked = convertToDecimal(contract.stakerInfo(event.params.staker).value0)
    staker.lastCommitment = BigInt.fromI32(event.params.period)
    staker.save()
}

export function handleMinted(event: Minted): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let mintedEvent = new MintedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    mintedEvent.transaction = event.transaction.hash.toHex()
    mintedEvent.timestamp = event.block.timestamp.toI32()
    mintedEvent.period = periodNumber.toString()
    mintedEvent.staker = staker.id

    // event record
    mintedEvent.value = convertToDecimal(event.params.value)
    mintedEvent.mintingPeriod = BigInt.fromI32(event.params.period)
    mintedEvent.save()

    // update previous period
    let prevPeriod = Period.load(BigInt.fromI32(event.params.period).toString())
    if (prevPeriod != null) {
        prevPeriod.minted = prevPeriod.minted.plus(convertToDecimal(event.params.value))
        prevPeriod.save()
    }

    // staker
    staker.minted = staker.minted.plus(convertToDecimal(event.params.value))
    staker.save()
}

export function handleReStakeSet(event: ReStakeSet): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let reStakeEvent = new ReStakeEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    reStakeEvent.transaction = event.transaction.hash.toHex()
    reStakeEvent.timestamp = event.block.timestamp.toI32()
    reStakeEvent.period = periodNumber.toString()
    reStakeEvent.staker = staker.id

    // event record
    reStakeEvent.reStake = event.params.reStake
    reStakeEvent.save()

    // staker
    staker.restaking = event.params.reStake
    staker.save()
}

export function handleSnapshotSet(event: SnapshotSet): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.snapshots = event.params.snapshotsEnabled
    staker.save()
}

export function handleWindDownSet(event: WindDownSet): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let windDownEvent = new WindDownEvent(makeEventId(event.transaction.hash, event.logIndex))

    // base
    windDownEvent.transaction = event.transaction.hash.toHex()
    windDownEvent.timestamp = event.block.timestamp.toI32()
    windDownEvent.period = periodNumber.toString()
    windDownEvent.staker = staker.id

    // record
    windDownEvent.windDown = event.params.windDown
    windDownEvent.save()

    // staker
    staker.windingDown = event.params.windDown
    staker.save()
}

export function handleWithdrawn(event: Withdrawn): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let withdrawEvent = new WithdrawEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    withdrawEvent.transaction = event.transaction.hash.toHex()
    withdrawEvent.timestamp = event.block.timestamp.toI32()
    withdrawEvent.period = periodNumber.toString()
    withdrawEvent.staker = staker.id

    // event record
    withdrawEvent.value = convertToDecimal(event.params.value)
    withdrawEvent.save()

    // staker
    staker.withdrawn = staker.withdrawn.plus(convertToDecimal(event.params.value))
    staker.save()
}

export function handleWorkerBonded(event: WorkerBonded): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let workerBondedEvent = new WorkerBondedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    workerBondedEvent.transaction = event.transaction.hash.toHex()
    workerBondedEvent.timestamp = event.block.timestamp.toI32()
    workerBondedEvent.period = periodNumber.toString()
    workerBondedEvent.staker = staker.id

    // event record
    workerBondedEvent.worker = event.params.worker.toHex()
    workerBondedEvent.startPeriod = BigInt.fromI32(event.params.startPeriod)
    workerBondedEvent.save()

    // staker
    staker.worker = event.params.worker.toHex()
    staker.bonded = staker.worker != NULL_ADDRESS.toHex()
    staker.save()
}

export function handleMigrated(event: Migrated): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let migratedEvent = new MigratedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event record
    migratedEvent.transaction = event.transaction.hash.toHex()
    migratedEvent.timestamp = event.block.timestamp.toI32()
    migratedEvent.period = periodNumber.toString()
    migratedEvent.staker = staker.id
    migratedEvent.save()

    // staker
    staker.migrated = true
    staker.save()
}

export function handleSlashed(event: Slashed): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let slashedEvent = new SlashedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    slashedEvent.transaction = event.transaction.hash.toHex()
    slashedEvent.timestamp = event.block.timestamp.toI32()
    slashedEvent.period = periodNumber.toString()
    slashedEvent.staker = staker.id

    // event record
    slashedEvent.penalty = convertToDecimal(event.params.penalty)
    slashedEvent.investigator = event.params.investigator.toString()
    slashedEvent.reward = convertToDecimal(event.params.reward)
    slashedEvent.save()

    // staker
    staker.slashed = staker.slashed.plus(convertToDecimal(event.params.penalty))
    staker.save()
}

export function handleDeposited(event: Deposited): void {

    // setup
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let periodNumber = getPeriodNumber(event.block.timestamp.toI32())
    getOrCreateTransaction(event.transaction, event.block)
    let depositedEvent = new DepositedEvent(makeEventId(event.transaction.hash, event.logIndex))

    // event base
    depositedEvent.transaction = event.transaction.hash.toHex()
    depositedEvent.timestamp = event.block.timestamp.toI32()
    depositedEvent.period = periodNumber.toString()
    depositedEvent.staker = staker.id

    // event record
    depositedEvent.value = convertToDecimal(event.params.value)
    depositedEvent.duration = BigInt.fromI32(event.params.periods)
    depositedEvent.save()

    //staker
    staker.deposited = staker.deposited.plus(convertToDecimal(event.params.value))
    staker.save()
}
