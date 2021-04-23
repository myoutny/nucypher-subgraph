import {Staker} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {Address} from "@graphprotocol/graph-ts";

export let NULL_ADDRESS = Address.fromString(
  "0000000000000000000000000000000000000000"
);

export let ZERO_BI = BigInt.fromI32(0);


export function getOrCreateStaker(id: string): Staker {
  let staker = Staker.load(id);
    if (staker == null) {
        staker = new Staker(id)
        staker.staked = ZERO_BI
        staker.restaking = true
        staker.winding_down = false
        staker.bonded = false
        staker.worker = NULL_ADDRESS.toString()
        staker.substakes = ZERO_BI
        staker.minted = ZERO_BI
        staker.withdrawn = ZERO_BI
        staker.commitment = ZERO_BI
    }
  return staker as Staker;
}