import {BigInt} from "@graphprotocol/graph-ts"
import {
    CommitmentMade, Deposited,
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
    let next_period = Period.load(nextPeriodNumber.toString())
    if (next_period == null) {
        next_period = new Period(nextPeriodNumber.toString())

        // Initialize next period
        next_period.timestamp = event.block.timestamp.toI32()
        next_period.activeStakers = ZERO_BI
        next_period.totalStaked = ZERO_BD

        // Finalize previous period circulating supply
        let prev_period_number = BigInt.fromI32(nextPeriodNumber - 2).toString()
        let previous_period = Period.load(prev_period_number.toString())
        if (previous_period != null) {
            let contract = StakingEscrow.bind(event.address)
            previous_period.circulatingSupply = convertToDecimal(contract.previousPeriodSupply())
            previous_period.save()
        }
    }

    // Accumulate
    next_period.totalStaked = next_period.totalStaked + convertToDecimal(event.params.value)
    next_period.activeStakers = next_period.activeStakers + BigInt.fromI32(1)
    next_period.save()

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
    staker.winding_down = event.params.windDown
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
