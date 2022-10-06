export interface Tx {
    blockNumber: string;
    blockHash: string;
    confirmations: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    from: string;
    to: string;
    functionName: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    hash: string;
    input: string;
    isError: string;
    methodId: string;
    nonce: string;
    timeStamp: string;
    transactionIndex: string;
    txreceipt_status: string;
    value: string;
    children: number;
    childTxns: Tx[];
    posTxEvents: string[];
    tokenType: string;
    tokenValue: string;
    tokenDecimal: string;
    tokenID: string;
    tokenName: string;
    tokenSymbol: string;
    calculatedValue: number;
    incomingCount: number;
    outgoingCount: number;
    incomingValue: number;
    outgoingValue: number;
    way: string;
    gotchiverseEventData:(upgradeEvent 
                        | craftEvent
                        | equipUnequipInstEvent
                        | equipUnequipTileEvent
                        | channelClaimAlchemicaEvent)[];
}

export interface TotalCostByType {

}

export interface ERC20info {
    balance: number;
    cost: number;
}

export interface ERC20 {
    GHST: ERC20info;
    FUD: ERC20info;
    FOMO: ERC20info;
    ALPHA: ERC20info;
    KEK: ERC20info;
    GLTR: ERC20info;
}

export interface ERC1155 {
    installations: Installation[];
    tiles: Tile[];
    wearables: Wearable[];
    tickets: Ticket[];
}

export interface ERC721 {
    parcels: Parcel[];
    gotchis: Gotchi[];
}

export interface Wallet {
    ERC721: ERC721
    ERC1155: ERC1155
    ERC20: ERC20
}

export interface ParcelCoordinates {
    x: string;
    y: string;
}

export interface DefaultItemValues {
    txHash: string;
    inVault?: boolean;
    id: string;
    name?: string;
    quantity?: number
    cost: number;
}

export interface Installation extends ParcelCoordinates extends DefaultItemValues {
    level: number;
}

export interface Tile extends ParcelCoordinates extends DefaultItemValues {
}

export interface Wearable extends DefaultItemValues {
    rarity: string | number;
}

export interface Ticket extends DefaultItemValues {
    rarity: string | number;
}

export interface Gotchi extends DefaultItemValues{
    wearables?: Wearable[];
}

export interface Parcel extends DefaultItemValues {
    parcelHash?: string;
    size?: string;
    tiles?: Tile[];
    installations?: Installation[];
}

export interface GotchiverseEvents {
    upgradeInitiatedEvents: upgradeEvent[];
    upgradeFinalizedEvents: upgradeEvent[];
    upgradeTimeReducedEvents: upgradeEvent[];
    mintInstallationEvents: craftEvent[];
    mintTileEvents: craftEvent[];
    equipInstallationEvents: equipUnequipInstEvent[];
    unequipInstallationEvents: equipUnequipInstEvent[];
    equipTileEvents: equipUnequipTileEvent[];
    unequipTileEvents: equipUnequipTileEvent[];
    alchemicaClaimedEvents: channelClaimAlchemicaEvent[];
    channelAlchemicaEvents: channelClaimAlchemicaEvent[];
}

export interface DefaultEventValues {
    timestamp: string;
    transaction: string;
    block: string;
}
export interface upgradeEvent extends DefaultEventValues {
    id: string;
    readyBlock?: string;
    parcel: {
        id: string;
        parcelHash: string;
        tokenId: string;
        size: string;
    };
    installation?: {
        id: string;
        name: string;
        level: string;
    };
    x: string;
    y: string;
}

export interface craftEvent extends DefaultEventValues {
    installationType?: {
        id: string;
        name: string;
        level: string;
    };
    tile?: {
        id: string;
        name: string;
    };
}

export interface equipUnequipInstEvent extends DefaultEventValues {
    id: string;
    installation: {
        id: string;
        name: string;
        level: string;
    };
    parcel: {
        id: string;
        parcelHash: string;
        tokenId: string;
        size: string;
    };
    x: string;
    y: string;
}

export interface equipUnequipTileEvent extends DefaultEventValues {
    id: string;
    tile: {
        id: string;
    };
    parcel: {
        id: string;
        parcelHash: string;
        tokenId: string;
        size: string;
    };
    x: string;
    y: string;
}

export interface channelClaimAlchemicaEvent extends DefaultEventValues {
    id: string;
    gotchi: {
        id: string;
    };
    parcel: {
        id: string;
        parcelHash: string;
        tokenId: string;
        size: string;
    };
    installation: {
        id: string;
        name: string;
        level: string;
    };
    spilloverRate: string;
    spilloverRadius: string;
}