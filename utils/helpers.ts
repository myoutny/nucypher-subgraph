import {Period, Staker, Transaction} from "../generated/schema";
import {Address, BigDecimal, BigInt, Bytes, dataSource, ethereum} from "@graphprotocol/graph-ts";
import {StakingEscrow} from "../generated/StakingEscrow/StakingEscrow";

export let MIGRATION_TIMESTAMP = 1618358661;  // final genesis period block timestamp
export let FINAL_GENESIS_PERIOD_NUMBER = BigInt.fromI32(18732);  // actual final genesis period number
export let GENESIS_ERA_PERIOD_NUMBER = BigInt.fromI32(18000);  // estimated first genesis period number
export let GENESIS_PERIOD_DURATION = 86400;  // seconds
export let PERIOD_DURATION = 604800;  // seconds

export let ZERO_BI = BigInt.fromI32(0);
export let ZERO_BD = BigDecimal.fromString("0");
export let BI_18 = BigInt.fromI32(18);
export let ONE_BI = BigInt.fromI32(1);
export let NULL_ADDRESS = Address.fromString(
    "0000000000000000000000000000000000000000"
);


export function makeEventId(hash: Bytes, index: BigInt): string {
  return hash.toHex().concat("-").concat(index.toString());
}


export function getNuCypherTokenAddress(network: string): string {
  if (network == "rinkeby") {
    return "6A6F917a3FF3d33d26BB4743140F205486cD6B4B";
  } else if (network == "goerli") {
    return "02B50E38E5872068F325B1A7ca94D90ce2bfff63";
  } else {
      // mainnet
      return "4fE83213D56308330EC302a8BD641f1d0113A4Cc";
  }
}


export function getStakingEscrowAddress(network: string): string {
  if (network == "rinkeby") {
    return "6A6F917a3FF3d33d26BB4743140F205486cD6B4B";
  } else if (network == "goerli") {
    return "40Ca356d8180Ddc21C82263F9EbCeaAc6Cad7250";
  } else {
    // mainnet
    return "bbD3C0C794F40c4f993B03F65343aCC6fcfCb2e2";
  }
}


export function getPolicyManagerAddress(network: string): string {
  if (network == "rinkeby") {
    return "4db603E42E6798Ac534853AA2c0fF5618cb0ebE5";
  } else if (network == "goerli") {
    return "aC5e34d3FD41809873968c349d1194D23045b9D2";
  } else {
    // mainnet
    return "67E4A942c067Ff25cE7705B69C318cA2Dfa54D64";
  }
}


export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}


export function convertToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(BI_18));
}


export function getOrCreateStaker(id: string): Staker {
    let staker = Staker.load(id);
    if (staker == null) {
        staker = new Staker(id)
        staker.staked = ZERO_BD
        staker.deposited = ZERO_BD
        staker.slashed = ZERO_BD
        staker.restaking = true
        staker.windingDown = false
        staker.bonded = false
        staker.worker = NULL_ADDRESS.toString()
        staker.substakes = ZERO_BI
        staker.minted = ZERO_BD
        staker.withdrawn = ZERO_BD
        staker.lastCommitment = ZERO_BI
        staker.migrated = false
        staker.snapshots = true
        staker.save()
    }
    return staker as Staker;
}


export function getOrCreateTransaction(transaction: ethereum.Transaction, block: ethereum.Block): Transaction {
  let tx = Transaction.load(transaction.hash.toHex())
  if (tx == null) {
    let tx = new Transaction(transaction.hash.toHex());
    tx.blockNumber = block.number;
    tx.gasUsed = transaction.gasUsed;
    tx.gasPrice = transaction.gasPrice;
    tx.timestamp = block.timestamp.toI32();
    tx.from = transaction.from.toHex();
    tx.to = transaction.to.toHex();
    tx.save();
  }
  return tx as Transaction
}


export function getPeriodNumber(timestamp: i32): BigInt {
    let periodNumber: BigInt;
    if (timestamp < MIGRATION_TIMESTAMP) {
        periodNumber = BigInt.fromI32(timestamp / GENESIS_PERIOD_DURATION)
    } else {
        periodNumber = BigInt.fromI32(timestamp / PERIOD_DURATION);
    }
    return periodNumber;
}

export function finalizePeriod(periodNumber: i32): void {
    let period = Period.load(periodNumber.toString())
    if (period != null) {
        let stakingEscrowAddress = Address.fromString(getStakingEscrowAddress(dataSource.network()))
        let contract = StakingEscrow.bind(stakingEscrowAddress)
        period.circulatingSupply = convertToDecimal(contract.previousPeriodSupply())
        if (period.totalStaked > ZERO_BD) {
            period.participationRate = period.totalStaked.div(period.circulatingSupply);
        }
        period.finalized = true;
        period.save()
    }
}


export function createPeriod(periodNumber: BigInt, timestamp: i32): Period {
    let period = new Period(periodNumber.toString())
    period.timestamp = timestamp
    period.activeStakers = ZERO_BI
    period.totalStaked = ZERO_BD
    period.circulatingSupply = ZERO_BD
    period.participationRate = ZERO_BD
    period.minted = ZERO_BD
    period.finalized = false
    period.genesis = periodNumber > GENESIS_ERA_PERIOD_NUMBER;
    period.save()
    return period as Period
}
