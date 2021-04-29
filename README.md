# nucypher-subgraph
Subgraph Definition for NuCypher Entities

[![discord](https://img.shields.io/discord/411401661714792449.svg?logo=discord)](https://discord.gg/7rmXa3S)
[![license](https://img.shields.io/pypi/l/nucypher.svg)](https://www.gnu.org/licenses/gpl-3.0.html)

### Deloyment (Hosted Sevice)

```bash
graph auth https://api.thegraph.com/deploy/ <API KEY>

yarn prepare
yarn build
yarn deploy:mainnet

# Ibex Testnet
yarn prepare:rinkeby
yarn build
yarn deploy:rinkeby

# Lynx Testnet
yarn prepare:goerli
yarn build
yarn deploy:goerli
```

##### Manual Deployment

```bash
graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ nucypher/nucypher --debug
```

##### Health Check

Logs for the hosted service can be found on the dashboard: <https://thegraph.com/explorer/subgraph/nucypher/nucypher?selected=logs>

###### Current Version

```bash
curl --location --request POST 'https://api.thegraph.com/index-node/graphql' \
--data-raw '{"query":"{ indexingStatusForCurrentVersion(subgraphName: \"nucypher-nucypher\") \
{ subgraph fatalError { message } nonFatalErrors {message } } }"}'
```

###### Pending Version

```bash
curl --location --request POST 'https://api.thegraph.com/index-node/graphql'  \
--data-raw '{"query":"{ indexingStatusForPendingVersion(subgraphName: \"nucypher/nucypher\") \
{ subgraph fatalError { message } nonFatalErrors {message } } }"}'
```


#### Acknowledgments

Many thanks to LivePeer and TheGraph for open sourcing thier examplar code that is reused/modified and inspired this codebase.

- LivePeer's subgraph: <https://github.com/livepeer/livepeerjs/tree/master/packages/subgraph>
- TheGraph's example: <https://github.com/graphprotocol/example-subgraph>
- Official TheGraph Docs: <https://thegraph.com/docs/>
