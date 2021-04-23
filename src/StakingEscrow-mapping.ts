import {BigInt} from "@graphprotocol/graph-ts"
import {
    CommitmentMade,
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
import {getOrCreateStaker, ZERO_BI} from "../utils/helpers";
import {Period} from "../generated/schema";

export function handleLocked(event: Locked): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.substakes = staker.substakes + BigInt.fromI32(1)
    staker.staked = staker.staked + event.params.value
    staker.save()
}

export function handleDivided(event: Divided): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.substakes = staker.substakes + BigInt.fromI32(1)
    staker.save()
}

export function handleMerged(event: Merged): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.substakes = staker.substakes - BigInt.fromI32(1)
    staker.save()
}

export function handleCommitmentMade(event: CommitmentMade): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())

    let next_period_number = event.params.period

    if (next_period_number < 10000) {
        // Weekly Periods (168)

        let next_period = Period.load(next_period_number.toString())
        if (next_period == null) {
            next_period = new Period(next_period_number.toString())

            // Initialize next period
            next_period.timestamp = event.block.timestamp.toI32()
            next_period.activeStakers = ZERO_BI
            next_period.totalStaked = ZERO_BI
            next_period.save()

            // Finalize previous period circulating supply
            let prev_period_number = BigInt.fromI32(next_period_number - 2).toString()
            let previous_period = Period.load(prev_period_number.toString())
            let contract = StakingEscrow.bind(event.address)
            previous_period.circulatingSupply = contract.previousPeriodSupply()
            previous_period.save()

        }
        next_period.totalStaked = next_period.totalStaked + event.params.value
        next_period.activeStakers = next_period.activeStakers + BigInt.fromI32(1)
        next_period.save()

        staker.commitment = BigInt.fromI32(event.params.period)
        staker.save()

    } else {
        // Daily Periods (24)
    }


}

export function handleMinted(event: Minted): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.minted = staker.minted + event.params.value
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
    staker.withdrawn = staker.withdrawn + event.params.value
    staker.save()
}

export function handleWorkerBonded(event: WorkerBonded): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.worker = event.params.worker.toHex()
    staker.bonded = true
    staker.save()
}

export function handleMigrated(event: Migrated): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.migrated = true
    staker.save()
}

export function handleSlashed(event: Slashed): void {
    let staker = getOrCreateStaker(event.params.staker.toHex())
    staker.slashed = staker.slashed + event.params.penalty
    staker.save()
}