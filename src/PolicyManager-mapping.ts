import { BigInt } from "@graphprotocol/graph-ts"
import {
  PolicyManager,
  ArrangementRevoked,
  FeeRateRangeSet,
  MinFeeRateSet,
  OwnershipTransferred,
  PolicyCreated,
  PolicyRevoked,
  RefundForArrangement,
  RefundForPolicy,
  StateVerified,
  UpgradeFinished,
  Withdrawn
} from "../generated/PolicyManager/PolicyManager"
import { ExampleEntity } from "../generated/schema"

export function handleArrangementRevoked(event: ArrangementRevoked): void {
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
  entity.policyId = event.params.policyId
  entity.sender = event.params.sender

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
  // - contract.DEFAULT_FEE_DELTA(...)
  // - contract.calculateRefundValue(...)
  // - contract.calculateRefundValue(...)
  // - contract.escrow(...)
  // - contract.feeRateRange(...)
  // - contract.getArrangementInfo(...)
  // - contract.getArrangementsLength(...)
  // - contract.getCurrentPeriod(...)
  // - contract.getMinFeeRate(...)
  // - contract.getNodeFeeDelta(...)
  // - contract.getPolicyOwner(...)
  // - contract.getRevocationHash(...)
  // - contract.isOwner(...)
  // - contract.isUpgrade(...)
  // - contract.nodes(...)
  // - contract.owner(...)
  // - contract.policies(...)
  // - contract.previousTarget(...)
  // - contract.refund(...)
  // - contract.revoke(...)
  // - contract.revokeArrangement(...)
  // - contract.revokePolicy(...)
  // - contract.secondsPerPeriod(...)
  // - contract.target(...)
  // - contract.withdraw(...)
  // - contract.withdraw(...)
}

export function handleFeeRateRangeSet(event: FeeRateRangeSet): void {}

export function handleMinFeeRateSet(event: MinFeeRateSet): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePolicyCreated(event: PolicyCreated): void {}

export function handlePolicyRevoked(event: PolicyRevoked): void {}

export function handleRefundForArrangement(event: RefundForArrangement): void {}

export function handleRefundForPolicy(event: RefundForPolicy): void {}

export function handleStateVerified(event: StateVerified): void {}

export function handleUpgradeFinished(event: UpgradeFinished): void {}

export function handleWithdrawn(event: Withdrawn): void {}
