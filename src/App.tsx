import { useRef, useState } from 'react';
import { Input, HStack, Button, VStack, Text, Box } from '@chakra-ui/react';
import Transaction from './Transaction';
import Search from './Search';
import PolygonscanAPI from './PolygonscanAPI';
import CoingeckoAPI from './CoingeckoAPI';
import CurrencySelect from './CurrencySelect';
import { channelClaimAlchemicaEvent, craftEvent, equipUnequipInstEvent, equipUnequipTileEvent, ERC20, ERC20info, ERC721, Gotchi, GotchiverseEvents, Parcel, Tx, upgradeEvent, Wallet } from './types/common/interfaces';
import GotchiverseAPI from './GotchiverseAPI';


interface ERC20Data {
  prices: [[number, number]]
  market_caps: [[number, number]]
  total_volumes: [[number, number]]
}

interface aavegotchiERC20Data {
  [key: string]: ERC20Data
}

const customAddressCheck = (address: string) => {
  return address.length === 42 && address.charAt(0) === '0' && address.charAt(1).toLowerCase() === 'x' && address.toLowerCase() !== '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'
}

export default function App() {
  const [address, setAddress] = useState<string>("0x1441bAe48B5Da3da1D6E48C2C5b033fCbF6Ee759");
  const [addressInput, setAddressInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [txns, setTxns] = useState<Tx[]>();
  const [wallet, setWallet] = useState<Wallet>();
  const [userCurrency, setCurrency] = useState<string | null>('usd');
  const [txnsLoading, setTxnsLoading] = useState<boolean>(false);
  const viewPortRef = useRef<HTMLDivElement>(null);

  const walletCache: Wallet = {
    ERC721: {
      parcels: [],
      gotchis: []
    },
    ERC1155: {
      installations: [],
      tiles: [],
      wearables: [],
      tickets: []
    },
    ERC20: {
      GHST: {
        balance: 0,
        cost: 0,
      },
      FUD: {
        balance: 0,
        cost: 0,
      },
      FOMO: {
        balance: 0,
        cost: 0,
      },
      ALPHA: { balance: 0, cost: 0 },
      KEK: {
        balance: 0,
        cost: 0,
      },
      GLTR: {
        balance: 0,
        cost: 0,
      },
    }
  };

  const getData = async () => {
    const tokenTypes = ['ERC20', 'ERC1155', 'ERC721'];
    const actions: string[] = ['txlist', 'tokentx', 'token1155tx', 'tokennfttx'];
    const aavegotchiERC20s = [
      { coingeckoId: 'aavegotchi-fud', ticker: 'FUD' },
      { coingeckoId: 'aavegotchi-fomo', ticker: 'FOMO' },
      { coingeckoId: 'aavegotchi-alpha', ticker: 'ALPHA' },
      { coingeckoId: 'aavegotchi-kek', ticker: 'KEK' },
      { coingeckoId: 'aavegotchi', ticker: 'GHST' },
      { coingeckoId: 'gax-liquidity-token-reward', ticker: 'GLTR' }
    ];

    const transactions = await Promise.all(
      actions.map((action: string, index: number) => PolygonscanAPI({
        module: 'account',
        action: action,
        address: address.toLowerCase(),
        page: 1,
        offset: 10000,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        keepAlive: index === 0
      }))
    );

    const aavegotchiERC20History = await Promise.all(
      aavegotchiERC20s.map((ERC20: { coingeckoId: string, ticker: string }, index: number) => CoingeckoAPI({
        id: ERC20.coingeckoId,
        currency: userCurrency,
        keepAlive: index === 0
      })));

    const aavegotchiERC20Data: aavegotchiERC20Data = {}
    aavegotchiERC20History.forEach((token: ERC20Data | void, index: number) => {
      if(token && "prices" in token) {
        aavegotchiERC20Data[aavegotchiERC20s[index].ticker] = token;
      }
    });

    const mainTxns: Tx[] = transactions[0].result.sort((a: Tx, b:Tx) => parseFloat(a.timeStamp) - parseFloat(b.timeStamp));

    const sortedTxns: { [key: string]: string[] } = {
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
    };

    for (let i = 0, n = transactions.length; i < n; i += 1) {
      if(i === 0) {
        const mainTxns = transactions[i].result
        for (let x = 0, n = mainTxns.length; x < n; x += 1) { 
          const mainTx = mainTxns[x]
          const functionName = mainTx.functionName
    
          const check = (name: string): boolean => {
            return functionName.includes(name)
          }
    
          const sortTxn = (events: string[]): void => {
            events.forEach((event: string) => {
              sortedTxns[event].push(mainTx.hash)
            })
            mainTx.posTxEvents = events
          }

          if (functionName) {
            if (check('claimAvailableAlchemica')) {
              sortTxn(['alchemicaClaimedEvents']);
            } else if (check('channelAlchemica')) {
              sortTxn(['channelAlchemicaEvents']);
            } else if (check('upgradeInstallation')) {
              sortTxn(['upgradeInitiatedEvents', 'upgradeTimeReducedEvents', 'upgradeFinalizedEvents']);
            } else if (check('reduceUpgradeTime')) {
              sortTxn(['upgradeTimeReducedEvents']);
            } else if (check('finalizeUpgrades')) {
              sortTxn(['upgradeFinalizedEvents']);
            } else if (check('unequipInstallation')) {
              sortTxn(['unequipInstallationEvents']);
            } else if (check('equipInstallation')) {
              sortTxn(['equipInstallationEvents']);
            } else if (check('batchEquip')) {
              sortTxn(['unequipTileEvents', 'equipTileEvents']);
            } else if (check('craftInstallations')) {
              sortTxn(['mintInstallationEvents']);
            } else if (check('craftTiles')) {
              sortTxn(['mintTileEvents']);
            } else {
              mainTx.posTxEvents = []
            }
          }
        }
      } else {
        transactions[i].result.forEach((childTx: Tx) => {
          const parentCheck = mainTxns.findIndex((mainTx: Tx) => mainTx.hash === childTx.hash)
          let childValue = 0;
          const ERC20DataAvailable = aavegotchiERC20s.findIndex((ERC20: { ticker: string }) => ERC20.ticker === childTx.tokenSymbol);
          let tokenAmount = 0;
          if (ERC20DataAvailable >= 0) {
            const reqPrice = aavegotchiERC20Data[childTx.tokenSymbol].prices.findIndex((timePricePair: [number, number], index: number, obj: [number, number][]) => (
              new Date(timePricePair[0])).setHours(0, 0, 0, 0) === (new Date(parseFloat(childTx.timeStamp) * 1000)).setHours(obj[index + 1] ? 24 : 0, 0, 0, 0));
            tokenAmount = parseFloat(childTx.value) / Math.pow(10, parseFloat(childTx.tokenDecimal));
            const tokenPrice = aavegotchiERC20Data[childTx.tokenSymbol].prices[reqPrice][1];
            childValue = tokenAmount * tokenPrice;
          }
  
          let way = 'incoming';
          if (childTx.from.toLowerCase() === address.toLowerCase()) {
            way = 'outgoing';
          }
          
          if (parentCheck >= 0) {
            if (!mainTxns[parentCheck].childTxns) {
              mainTxns[parentCheck].childTxns = [Object.assign({}, childTx, { tokenType: tokenTypes[i - 1], calculatedValue: childValue, way: way })]
            } else {
              mainTxns[parentCheck].childTxns.push(Object.assign({}, childTx, { tokenType: tokenTypes[i - 1], calculatedValue: childValue, way: way }))
            }
            if (way === 'outgoing') {
              if (!mainTxns[parentCheck].outgoingValue) {
                mainTxns[parentCheck].outgoingValue = childValue
              } else {
                mainTxns[parentCheck].outgoingValue += childValue
              }
            } else {
              if (!mainTxns[parentCheck].incomingValue) {
                mainTxns[parentCheck].incomingValue = childValue
              } else {
                mainTxns[parentCheck].incomingValue += childValue
              }
            }
          } else {
            const tempTransaction = childTx
            tempTransaction.functionName = 'unkown function'
            tempTransaction.childTxns = [Object.assign({}, childTx, { tokenType: tokenTypes[i - 1], calculatedValue: childValue, way: way })]
            mainTxns.push(tempTransaction)
          }
        });
      }
    }

    const gotchiverseEvents: GotchiverseEvents = await GotchiverseAPI({
      desired: 'gotchiverseEvents',
      keepAlive: false,
      params: sortedTxns
    });

    let eventTypes: upgradeEvent | craftEvent | equipUnequipInstEvent | equipUnequipTileEvent | channelClaimAlchemicaEvent;

    for (let i = 0, n = mainTxns.length; i < n; i += 1) {
      const mainTx = mainTxns[i];

      const actualEvents = mainTx.posTxEvents && mainTx.posTxEvents.map((event, index: number) => {
        const eventArray: Array<typeof eventTypes> = gotchiverseEvents[event as keyof GotchiverseEvents]
        const foundEvent = eventArray.filter(
          (foundEvent: typeof eventTypes) => {
            if (foundEvent.transaction.toLowerCase() === mainTx.hash.toLowerCase()) {
              return true;
            }
          });
        if (foundEvent.length > 0) {
          mainTx['gotchiverseEventData'] = !mainTx['gotchiverseEventData'] ? foundEvent : mainTx.gotchiverseEventData.concat(foundEvent);
          return event
        } else {
          return ''
        }
      }).filter((event: string) => event.length > 0);
      mainTx.posTxEvents = actualEvents

      // quantity for mint tiles and mint installation event = incomingCount
      if (mainTx.childTxns) {
        const outgoingCount = mainTx.childTxns.filter((childTx: Tx) => childTx.way === 'outgoing').length;
        const incomingCount = mainTx.childTxns.filter((childTx: Tx) => childTx.way === 'incoming').length;
        mainTx.childTxns.forEach((childTx: Tx, index: number) => {
          const walletTokenType = walletCache[childTx.tokenType as keyof Wallet];
          const tokenAmount = parseFloat(childTx.value) / Math.pow(10, parseFloat(childTx.tokenDecimal));
          if(tokenAmount !== 0)
          switch(childTx.tokenType) {
          case 'ERC20':
                if (aavegotchiERC20s.findIndex((value) => value.ticker === childTx.tokenSymbol.toUpperCase()) >= 0 && 'FUD' in walletTokenType) {
                  if (childTx.way === 'incoming') {
                    walletTokenType[childTx.tokenSymbol as keyof ERC20]['balance' as keyof ERC20info] += tokenAmount;
                    walletTokenType[childTx.tokenSymbol as keyof ERC20]['cost' as keyof ERC20info] += childTx.calculatedValue;
                  } else {
                    walletTokenType[childTx.tokenSymbol as keyof ERC20]['balance' as keyof ERC20info] -= tokenAmount;
                    walletTokenType[childTx.tokenSymbol as keyof ERC20]['cost' as keyof ERC20info] -= childTx.calculatedValue
                  }
                } break
          case 'ERC721':
              if(childTx.way === 'incoming') {
                const withdrawFromVault = mainTx.functionName && mainTx.functionName.includes('withdrawERC721')
                !withdrawFromVault && (mainTx.childTxns[index].calculatedValue = mainTx.outgoingValue / incomingCount)
                if(childTx.tokenSymbol === 'REALM' && 'parcels' in walletTokenType) {
                  if(withdrawFromVault) {
                    const assetIndex = walletTokenType['parcels' as keyof ERC721].findIndex((parcel: Parcel) => parcel.id === childTx.tokenID)
                    walletTokenType['parcels' as keyof ERC721][assetIndex].inVault = false
                  } else {
                    walletTokenType['parcels' as keyof ERC721].push({
                      id: childTx.tokenID,
                      cost: mainTx.outgoingValue / incomingCount,
                      tiles: [],
                      inVault: false,
                      installations: [],
                      txHash: childTx.hash
                    })
                  }
                }
                if(childTx.tokenSymbol === 'GOTCHI' && 'gotchis' in walletTokenType) {
                  if(withdrawFromVault) {
                    const assetIndex = walletTokenType['gotchis' as keyof ERC721].findIndex((gotchi: Gotchi) => gotchi.id === childTx.tokenID)
                    walletTokenType['gotchis' as keyof ERC721][assetIndex].inVault = false
                  } else {
                  walletTokenType['gotchis' as keyof ERC721].push({
                    id: childTx.tokenID,
                    cost: mainTx.outgoingValue / incomingCount,
                    wearables: [],
                    txHash: childTx.hash,
                    inVault: false
                  })
                }
                }
              } else {
                const depositIntoVault = mainTx.functionName && mainTx.functionName.includes('depositERC721')
                !depositIntoVault && (mainTx.childTxns[index].calculatedValue = mainTx.incomingValue / outgoingCount);
                if(childTx.tokenSymbol === 'REALM' && 'parcels' in walletTokenType) {
                  const assetIndex = walletTokenType['parcels' as keyof ERC721].findIndex((parcel: Parcel) => parcel.id === childTx.tokenID)
                  if(depositIntoVault) {
                    walletTokenType['parcels' as keyof ERC721][assetIndex].inVault = true;
                  } else {
                    walletTokenType['parcels' as keyof ERC721].splice(assetIndex, 1)
                  }
                }
                if(childTx.tokenSymbol === 'GOTCHI' && 'gotchis' in walletTokenType) {
                  const assetIndex = walletTokenType['gotchis' as keyof ERC721].findIndex((gotchi: Gotchi) => gotchi.id === childTx.tokenID)
                  if(depositIntoVault) {
                    walletTokenType['gotchis' as keyof ERC721][assetIndex].inVault = true;
                  } else {
                    walletTokenType['gotchis' as keyof ERC721].splice(assetIndex, 1)
                  }
                }
              }
            break
          case 'ERC1155':
            break
            }
          if (childTx.tokenType === 'ERC1155' && childTx.way === 'outgoing') {
            mainTx.childTxns[index].calculatedValue = mainTx.incomingValue / outgoingCount;
          } else if (childTx.tokenType === 'ERC1155' && childTx.way === 'incoming') {
            mainTx.childTxns[index].calculatedValue = mainTx.outgoingValue / incomingCount;
          }
        });

        mainTx['incomingCount'] = incomingCount;
        mainTx['outgoingCount'] = outgoingCount;
      }

      // if(mainTx.posTxEvents[0].includes('upgradeInitiated')) {
      //   if(mainTx.incomingCount === 0)
      // }


    }

    // for (let i = 1, n = transactions.length; i < n; i += 1) {
    //   mainTxns = mainTxns.concat(transactions[i].result);
    // }
    console.log(walletCache)

    console.log(mainTxns.filter((tx: Tx) => tx.childTxns && tx.childTxns.findIndex((child: Tx) => child.tokenSymbol === 'GHST') >= 0))

    // console.log(lit.filter((tx: Tx) => tx.childTxns && tx.childTxns.length > 0 && tx.childTxns.findIndex((childTx: Tx) => childTx.tokenType === 'ERC1155' || childTx.tokenType === 'ERC721') != -1))
    setTxns(mainTxns.sort((a: Tx, b: Tx) => parseFloat(b.timeStamp) - parseFloat(a.timeStamp))
      // .filter((tx: Tx) => tx.functionName && tx.functionName.toLowerCase().includes('alchemica'))
    )
    setTxnsLoading(false);
  }

  const handleAddressInput = (value: string) => {
    setAddressInput(value);
    if (customAddressCheck(value.replace(' ', ''))) {
      setAddress(value.replace(' ', '').toLowerCase());
    }
  };

  const handleGoButtonClick = () => {
    setTxnsLoading(true);
    getData();
  };

  //0x1441bAe48B5Da3da1D6E48C2C5b033fCbF6Ee759

  return (
    <VStack
      padding='10px'
      bgGradient='linear(to-b, mainUi.darker 0%, mainUi.dark 90%, mainUi.warmDark)'
      h='100vh'
      w='100vw'
      align='center'
      justify='center'>
      <HStack h='40px' w='full'>
        <Input
          value={addressInput}
          bg='mainUi.warmDark'
          border='1px'
          textColor='mainUi.warm'
          onChange={(e: { target: { value: string } }) => handleAddressInput(e.target.value)}
          placeholder='0x... custom matic address'
          _placeholder={{ opacity: 1, color: 'mainUi.darker' }}
          focusBorderColor=''
          _focus={{
            border: '2px'
          }}
          size='sm'
        />
        <CurrencySelect userCurrency={userCurrency} setCurrency={setCurrency} />
        {customAddressCheck(address) && (
          <Button
            isLoading={txnsLoading}
            variant='dash'
            onClick={() => handleGoButtonClick()}>
            GO!
          </Button>
        )}
        {txns && txns.length > 1 && (
          <Search setSearch={setSearch} search={search} />
        )}
      </HStack>
      <HStack
        h='30px'
        w='full'
        filter='auto'
        role='group'
        bg='mainUi.warmDark'>
        <Box w='30px' h='full' />
        <Text
          w='80px'
          variant='identifier'
          textColor='mainUi.ggMagenta'>
          HASH
        </Text>
        <Text
          w='200px'
          variant='identifier'
          textColor='mainUi.ggMagenta'>
          FUNCTION
        </Text>
      </HStack>
      <VStack
        ref={viewPortRef}
        pt='0'
        pb='0'
        pr='0'
        pl='0'
        h='full'
        w='full'
        overflow='auto'
        spacing='0'
        sx={{
          '&::-webkit-scrollbar': {
            borderRadius: '1px',
            width: '10px',
            backgroundColor: 'mainUi.dark',
          },
          '&::-webkit-scrollbar-track': {
            marginRight: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'mainUi.warm',
          }
        }}>
        {txns?.filter((tx: Tx) => {
          const searchParams: string[] = [tx.hash, tx.functionName, tx.from, tx.to, tx.contractAddress]
          let i = false;
          searchParams.forEach((param: string) => {
            if (typeof param === 'string' && param.length && param.toLowerCase().includes(search)) {
              i = true
            }
          })
          return i
        }).map((tx: Tx, index: number) => {
          return (
            <Transaction
              currency={userCurrency}
              viewPortRef={viewPortRef.current}
              key={tx.hash + index.toString()}
              tx={tx}
              index={index}
              address={address} />
          )
        })}
      </VStack>
    </VStack>
  );
}
