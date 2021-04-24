import {Staker} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {Address, BigDecimal} from "@graphprotocol/graph-ts";

export let ZERO_BI = BigInt.fromI32(0);
export let ZERO_BD = BigDecimal.fromString("0");
export let BI_18 = BigInt.fromI32(18);
export let ONE_BI = BigInt.fromI32(1);
export let NULL_ADDRESS = Address.fromString(
  "0000000000000000000000000000000000000000"
);


export function getNuCypherTokenAddress(network: string): string {
  if (network == "mainnet") {
    return "4fE83213D56308330EC302a8BD641f1d0113A4Cc";
  } else if (network == "rinkeby") {
    return "6A6F917a3FF3d33d26BB4743140F205486cD6B4B";
  } else if (network == "goerli") {
    return "02B50E38E5872068F325B1A7ca94D90ce2bfff63";
  }
}


export function getStakingEscrowAddress(network: string): string {
  if (network == "mainnet") {
    return "bbD3C0C794F40c4f993B03F65343aCC6fcfCb2e2";
  } else if (network == "rinkeby") {
    return "6A6F917a3FF3d33d26BB4743140F205486cD6B4B";
  } else if (network == "goerli") {
    return "40Ca356d8180Ddc21C82263F9EbCeaAc6Cad7250";
  }
}


export function getPolicyManagerAddress(network: string): string {
  if (network == "mainnet") {
    return "67E4A942c067Ff25cE7705B69C318cA2Dfa54D64";
  } else if (network == "rinkeby") {
    return "4db603E42E6798Ac534853AA2c0fF5618cb0ebE5";
  } else if (network == "goerli") {
    return "aC5e34d3FD41809873968c349d1194D23045b9D2";
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
        staker.commitment = ZERO_BI
        staker.migrated = false
        staker.save()
    }
    return staker as Staker;
}
