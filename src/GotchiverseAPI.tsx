import React from 'react';
import { Gotchi, GotchiverseEvents } from './types/common/interfaces';
import { channelClaimAlchemicaEvent, craftEvent, equipUnequipInstEvent, equipUnequipTileEvent, Tx, upgradeEvent, Wallet } from './types/common/interfaces';


const mapSkip = [
  { skip: 0 },
  { skip: 1000 },
  { skip: 2000 },
  { skip: 3000 },
  { skip: 4000 },
  { skip: 5000 }
]

interface Props {
  desired: string
  keepAlive?: boolean
  params: {
    upgradeInitiatedEvents?: string[],
    upgradeFinalizedEvents?: string[],
    upgradeTimeReducedEvents?: string[],
    mintInstallationEvents?: string[],
    mintTileEvents?: string[],
    equipInstallationEvents?: string[],
    deprecateInstallationEvents?: string[],
    equipTileEvents?: string[],
    unequipTileEvents?: string[],
    alchemicaClaimedEvents?: string[],
    channelAlchemicaEvents?: string[]
  }
}

interface Request {
  graph: string
  query: string
}

const QUERY = `query(
      $upgradeInitiatedEvents: [String!],
      $upgradeFinalizedEvents: [String!],
      $upgradeTimeReducedEvents: [String!],
      $mintInstallationEvents: [String!],
      $mintTileEvents: [String!],
      $equipInstallationEvents: [String!],
      $unequipInstallationEvents: [String!],
      $equipTileEvents: [String!],
      $unequipTileEvents: [String!],
      $alchemicaClaimedEvents: [String!],
      $channelAlchemicaEvents: [String!]
      ) {
    ${mapSkip.map((skip: { skip: number }, index: number) => {
  return (
    `upgradeInitiatedEvents${index}: upgradeInitiatedEvents(
        first: 1000, 
        skip: ${skip.skip},
        where: {transaction_in: $upgradeInitiatedEvents}
      ) {
        id
        blockInitiated
    		readyBlock
        timestamp
        transaction
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        installation {
          id
          name
          level
        }
        x
        y
      }
      upgradeFinalizedEvents${index}: upgradeFinalizedEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $upgradeFinalizedEvents}
      ) {
        id
        block
        timestamp
        transaction
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        installation {
          id
          name
          level
        }
        x
        y
      }
      upgradeTimeReducedEvents${index}: upgradeTimeReducedEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $upgradeTimeReducedEvents}
      ) {
        id
        block
        timestamp
        transaction
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        x
        y
      }
      mintInstallationEvents${index}: mintInstallationEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $mintInstallationEvents}
      ) {
        transaction
        block
        timestamp
        installationType {
          id
          name
          level
        }
      }
      mintTileEvents${index}: mintTileEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $mintTileEvents}
      ) {
        transaction
        block
        timestamp
        tile {
          id
          name
        }
      }
      equipInstallationEvents${index}: equipInstallationEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $equipInstallationEvents}
      ) {
        id
        block
        timestamp
        transaction
        installation {
          id
          name
          level
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        x
        y
      }
      unequipInstallationEvents${index}: unequipInstallationEvents(
        first: 1000,
        skip: ${skip.skip},
        where: { transaction_in: $unequipInstallationEvents}
      ) {
        id
        block
        timestamp
        transaction
        installation {
          id
          name
          level
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        x
        y
      }
      equipTileEvents${index}: equipTileEvents(
        first: 1000,
        skip: ${skip.skip},
        where: { transaction_in: $equipTileEvents}
      ) {
        id
        block
        timestamp
        transaction
        tile {
          id
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        x
        y
      }
      unequipTileEvents${index}: unequipTileEvents(
        first: 1000,
        skip: ${skip.skip},
        where: { transaction_in: $unequipTileEvents}
      ) {
        id
        block
        timestamp
        transaction
        tile {
          id
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        x
        y
      }
      alchemicaClaimedEvents${index}: alchemicaClaimedEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $alchemicaClaimedEvents}
      ) {
        id
        block
        timestamp
        transaction
        gotchi {
          id
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        spilloverRate
        spilloverRadius
      }
      channelAlchemicaEvents${index}: channelAlchemicaEvents(
        first: 1000,
        skip: ${skip.skip},
        where: {transaction_in: $channelAlchemicaEvents}
      ) {
        id
        block
        timestamp
        transaction
        gotchi {
          id
        }
        parcel {
          id
          parcelHash
          tokenId
          size
        }
        spilloverRate
        spilloverRadius
      }`)
}).join('')}}`

interface JsonResult {
  data: GotchiverseEvents
}

export default async function GotchiverseAPI(props: Props): Promise<GotchiverseEvents> {
  const { desired, params, keepAlive } = props
  let retries = 5

  let eventTypes: upgradeEvent | craftEvent | equipUnequipInstEvent | equipUnequipTileEvent | channelClaimAlchemicaEvent;

  const delay = async (t: number): Promise<null> => {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null), t)
    });
  }

  const data = async (): Promise<GotchiverseEvents> => {
    return await fetch('https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic', {
      method: 'POST',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: params
      }),
      keepalive: keepAlive
    }).then(async (res: Response) => {
      if (res.status == 200) {
        const data = await res.json().then((value: JsonResult) => value.data)

        const formattedData: GotchiverseEvents = {
          upgradeInitiatedEvents: [],
          upgradeFinalizedEvents: [],
          upgradeTimeReducedEvents: [],
          mintInstallationEvents: [],
          mintTileEvents: [],
          equipInstallationEvents: [],
          unequipInstallationEvents: [],
          equipTileEvents: [],
          unequipTileEvents: [],
          alchemicaClaimedEvents: [],
          channelAlchemicaEvents: []
        }

        const dataPicker = (i: number, param: string): Array<typeof eventTypes> => {
          return (data[(param + i.toString() as keyof GotchiverseEvents)] as Array<typeof eventTypes>)
      }

        Object.keys(params).forEach((param: string) => {
          (formattedData[param as keyof GotchiverseEvents] as Array<typeof eventTypes>) = dataPicker(0, param).concat(
            dataPicker(1, param), dataPicker(2, param), dataPicker(3, param), dataPicker(4, param), dataPicker(5, param))
        })

        return formattedData
      }
      if (retries > 0) {
        retries -= 1
        return await delay(Math.floor(Math.random() * 500)).then(() => data())
      }
      throw new Error('Gotchiverse subgraph request failure, out of retries.')
    })
  }

  return data()
}