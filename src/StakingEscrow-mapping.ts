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
import {convertToDecimal, getOrCreateStaker, NULL_ADDRESS, ZERO_BD, ZERO_BI} from "../utils/helpers";
import {Period} from "../generated/schema";


export function handleLocked(event: Locked): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let contract = StakingEscrow.bind(event.address)
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.staked = staker.staked + convertToDecimal(event.params.value)
    staker.save()
}

export function handleDivided(event: Divided): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let contract = StakingEscrow.bind(event.address)
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.save()
}

export function handleMerged(event: Merged): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    let contract = StakingEscrow.bind(event.address)
    staker.substakes = contract.getSubStakesLength(event.params.staker)
    staker.save()
}

export function handleCommitmentMade(event: CommitmentMade): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())

    let nextPeriodNumber = event.params.period
    let nextPeriod = Period.load(nextPeriodNumber.toString())
    if (nextPeriod == null) {
        nextPeriod = new Period(nextPeriodNumber.toString())

        // Initialize next period
        nextPeriod.timestamp = event.block.timestamp.toI32()
        nextPeriod.activeStakers = ZERO_BI
        nextPeriod.totalStaked = ZERO_BD

        // Finalize previous period circulating supply
        let prevPeriodNumber = BigInt.fromI32(nextPeriodNumber - 2).toString()
        let prevPeriod = Period.load(prevPeriodNumber.toString())
        if (prevPeriod != null) {
            let contract = StakingEscrow.bind(event.address)
            prevPeriod.circulatingSupply = convertToDecimal(contract.previousPeriodSupply())
            prevPeriod.save()
        }
    }

    // Accumulate
    nextPeriod.totalStaked = nextPeriod.totalStaked + convertToDecimal(event.params.value)
    nextPeriod.activeStakers = nextPeriod.activeStakers + BigInt.fromI32(1)
    nextPeriod.save()

    staker.commitment = BigInt.fromI32(event.params.period)
    staker.save()
}

export function handleMinted(event: Minted): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.minted = staker.minted + convertToDecimal(event.params.value)
    staker.save()
}

export function handleReStakeSet(event: ReStakeSet): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.restaking = event.params.reStake
    staker.save()
}

export function handleSnapshotSet(event: SnapshotSet): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.snapshots = event.params.snapshotsEnabled
    staker.save()
}

export function handleWindDownSet(event: WindDownSet): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.windingDown = event.params.windDown
    staker.save()
}

export function handleWithdrawn(event: Withdrawn): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.withdrawn = staker.withdrawn + convertToDecimal(event.params.value)
    staker.save()
}

export function handleWorkerBonded(event: WorkerBonded): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.worker = event.params.worker.toHex()
    staker.bonded = staker.worker != NULL_ADDRESS.toHex();
    staker.save()
}

export function handleMigrated(event: Migrated): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.migrated = true
    staker.save()
}

export function handleSlashed(event: Slashed): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.slashed = staker.slashed + convertToDecimal(event.params.penalty)
    staker.save()
}

export function handleDeposited(event: Deposited): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.deposited = staker.deposited + convertToDecimal(event.params.value)
    staker.save()
}
