import {BigInt} from "@graphprotocol/graph-ts"
import {
    CommitmentMade,
    Divided,
    Locked,
    Merged,
    Minted,
    ReStakeSet,
    WindDownSet,
    Withdrawn,
    WorkerBonded
} from "../generated/StakingEscrow/StakingEscrow"
import {Staker} from "../generated/schema"

export function handleLocked(event: Locked): void {
    let staker = Staker.load(event.transaction.from.toHex())
    if (staker == null) {
        staker = new Staker(event.transaction.from.toHex())

        // Defaults
        staker.staked = event.params.value
        staker.restaking = true
        staker.winding_down = false
        staker.bonded = false
        staker.worker = ''
        staker.substakes = BigInt.fromI32(1)
        staker.minted = BigInt.fromI32(0)
        staker.withdrawn = BigInt.fromI32(0)
        staker.commitment = BigInt.fromI32(0)

    } else {
        staker.substakes = staker.substakes + BigInt.fromI32(1)
        staker.staked = staker.staked + event.params.value
    }
    staker.save()
}

export function handleDivided(event: Divided): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.substakes = staker.substakes + BigInt.fromI32(1)
    staker.save()
}

export function handleMerged(event: Merged): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.substakes = staker.substakes - BigInt.fromI32(1)
    staker.save()
}


export function handleCommitmentMade(event: CommitmentMade): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.commitment = BigInt.fromI32(event.params.period)
    staker.save()
}

export function handleMinted(event: Minted): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.minted = staker.minted + event.params.value
    staker.save()
}

export function handleReStakeSet(event: ReStakeSet): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.restaking = event.params.reStake
    staker.save()
}

export function handleWindDownSet(event: WindDownSet): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.winding_down = event.params.windDown
    staker.save()
}

export function handleWithdrawn(event: Withdrawn): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.withdrawn = staker.withdrawn + event.transaction.value
    staker.save()
}

export function handleWorkerBonded(event: WorkerBonded): void {
    let staker = Staker.load(event.transaction.from.toHex())
    staker.bonded = true
    staker.worker = event.params.worker.toHex()
    staker.save()
}
