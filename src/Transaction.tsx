import { HStack, Button, VStack, Text, Link, Box, Th, Tr, Thead, Tbody, Table, TableContainer, Td, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from "framer-motion"
import millify from 'millify';
import { channelClaimAlchemicaEvent, craftEvent, equipUnequipInstEvent, equipUnequipTileEvent, Tx, upgradeEvent } from './types/common/interfaces';

interface Stat {
    name: string
    stat: string
    props?: {
        textColor?: string
        isNumeric?: boolean
    }
}

interface Props {
    currency: string | null
    tx: Tx
    index: number
    address: string
    viewPortRef: HTMLDivElement | null
}

function Transaction(props: Props) {
    const { tx, index, address, viewPortRef, currency } = props
    const [expanded, setExpanded] = useState(false)
    const options = { root: viewPortRef, rootMargin: '600px', threshold: 0 }
    const { ref, inView } = useInView(options);
    const MotionTableContainer = motion(TableContainer)
    let eventTypes: (upgradeEvent | craftEvent | equipUnequipInstEvent | equipUnequipTileEvent | channelClaimAlchemicaEvent)[];

    const handleExpandButtonClick = (arg0: boolean) => {
        setExpanded(arg0)
    }

    const childHeaders = [
        'direction', 'value', 'qty', 'ticker', 'type', 'way', 'other party', 'gas'
    ]

    return (
        <Flex w='full' ref={ref}>
            {!inView ? (
                <Box h='30px' w='full' />
            ) : (
                <VStack
                    w='full'
                    border={expanded ? '1px' : '0px'}
                    borderColor='mainUi.ggMagenta'
                    spacing=''>
                    <HStack
                        h='30px' w='full' filter='auto' role='group' brightness={index % 2 == 0 ? '1' : '0.8'} bg='mainUi.warmDark'>
                        {tx.childTxns && tx.childTxns.length > 0 ? (
                            <Button w='30px' size='x-sm' variant='gh' isActive={expanded}
                                onClick={() => { handleExpandButtonClick(!expanded) }}>
                                <Text maxW='50px' variant='alternate' textColor='mainUi.warm' _groupHover={{ textColor: 'mainUi.ggMagenta' }}>
                                    ...
                                </Text>
                            </Button>
                        ) : (
                            <Box h='full' w='30px' />
                        )}
                        <Link href={`https://polygonscan.com/tx/${tx.hash}`} isExternal>
                            <Text w='80px' textAlign='left' noOfLines={1} __css={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }} variant='alternate' textColor='mainUi.warm' _groupHover={{ textColor: 'mainUi.ggMagenta' }}>
                                {tx.hash}
                            </Text>
                        </Link>
                        <Text noOfLines={1} __css={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }} maxW='200px' variant='alternate' textAlign='left' textColor='mainUi.warm' _groupHover={{ textColor: 'mainUi.ggMagenta' }}>
                            {tx.functionName}
                        </Text>
                        <Text noOfLines={1} __css={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }} variant='alternate' textAlign='left' textColor='mainUi.warm' _groupHover={{ textColor: 'mainUi.ggMagenta' }}>
                            {(new Date(parseFloat(tx.timeStamp) * 1000)).toUTCString()}
                        </Text>
                        <Text variant='alternate' textAlign='left' textColor='mainUi.warm' _groupHover={{ textColor: 'mainUi.ggMagenta' }}>
                            {tx.posTxEvents
                                && tx.posTxEvents.map((event: string) => `${event},`)}
                        </Text>
                    </HStack>
                    <AnimatePresence initial={false}>
                        {expanded && (
                            <MotionTableContainer w='full'
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={{
                                    open: { opacity: 1, height: "auto" },
                                    collapsed: { opacity: 0, height: 0 }
                                }}
                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}>
                                <Table variant='unstyled' w='full' align='center'>
                                    <Thead>
                                        <Tr
                                            w='full'
                                            h='15px'
                                            filter='auto'
                                            brightness={index % 2 == 0 ? '1' : '0.8'}
                                            bg='mainUi.warmDark'>
                                            {childHeaders.map((header: string, headerIndex: number) => {
                                                return (
                                                    <Th
                                                        key={tx.hash + ': tableHeader' + headerIndex.toString()}
                                                        pr='4px' pl='4px' pt='0' pb='0'
                                                        textColor='mainUi.darker'
                                                        fontWeight='bold'
                                                        fontSize='x-small'
                                                        textAlign='center'
                                                        textTransform='uppercase'
                                                        isNumeric={header === 'value'}
                                                    >
                                                        {header}
                                                    </Th>
                                                )
                                            })}
                                        </Tr>
                                    </Thead>
                                    <Tbody w='full'>
                                        {tx.childTxns && (
                                            tx.childTxns.filter((childTx: Tx) => childTx.value === '0' && childTx.tokenType === 'ERC20' ? false : true). map((childTx: Tx, rowIndex: number) => {
                                                const stats: Stat[] = [
                                                    {
                                                        name: 'way',
                                                        stat: childTx.way.toUpperCase(),
                                                        props: {
                                                            textColor: childTx.from.toLowerCase() === address.toLowerCase() ? 'red' : 'green'
                                                        }
                                                    },
                                                    {
                                                        name: currency ? currency : 'value',
                                                        stat: millify(parseFloat(childTx.calculatedValue.toFixed(5)), { precision: 2 }),
                                                        props: {
                                                            isNumeric: true
                                                        }
                                                    },
                                                    {
                                                        name: 'qty',
                                                        stat: childTx.tokenValue || millify(parseFloat((parseFloat(childTx.value) / Math.pow(10, parseFloat(childTx.tokenDecimal))).toFixed(6)), { precision: 2 }),
                                                        props: {
                                                            isNumeric: true
                                                        }
                                                    },
                                                    {
                                                        name: 'ticker',
                                                        stat: childTx.tokenSymbol,
                                                    },
                                                    {
                                                        name: 'tokenType',
                                                        stat: childTx.tokenType,
                                                    },
                                                    {
                                                        name: 'to/from',
                                                        stat: childTx.from.toLowerCase() === address.toLowerCase() ? 'TO' : 'FROM',
                                                        props: {
                                                            textColor: childTx.from.toLowerCase() === address.toLowerCase() ? 'red' : 'green'
                                                        }
                                                    },
                                                    {
                                                        name: 'otherParty',
                                                        stat: childTx.from.toLowerCase() === address.toLowerCase() ? childTx.to : childTx.from,
                                                    },
                                                ]
                                                return (
                                                    <Tr
                                                        key={childTx.hash + ': tableRow' + rowIndex.toString()}
                                                        pt='2px'
                                                        pb='2px'
                                                        pr='0'
                                                        pl='0'
                                                        w='full'>
                                                        {stats.map((stat: Stat, statIndex: number) => {
                                                            return (
                                                                <Td
                                                                    key={childTx.hash + ': stat' + statIndex.toString()}
                                                                    pt='2px'
                                                                    pb='2px'
                                                                    textStyle='identifier'
                                                                    textAlign='center'
                                                                    {...stat.props}>
                                                                    {stat.stat}
                                                                </Td>)
                                                        })}
                                                    </Tr>
                                                )
                                            })
                                        )}
                                    </Tbody>
                                </Table>
                            </MotionTableContainer>
                        )}
                    </AnimatePresence>
                </VStack>
            )}
        </Flex>
    );
}

export default Transaction;


