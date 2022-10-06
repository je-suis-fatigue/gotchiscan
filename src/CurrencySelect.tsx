import { Box, Button, Flex, HStack, Icon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react';
import { useContext, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { GrCurrency } from 'react-icons/gr';
import { Select } from '@chakra-ui/react'

const currencyOptions = ["aed","ars","aud","bch","bdt","bhd","bmd","bnb","brl","btc","cad","chf","clp","cny","czk","dkk","dot","eos","eth","eur","gbp","hkd","huf","idr","ils","inr","jpy","krw","kwd","lkr","ltc","mmk","mxn","myr","ngn","nok","nzd","php","pkr","pln","rub","sar","sek","sgd","thb","try","twd","uah","usd","vef","vnd","xag","xau","xdr","xlm","xrp","yfi","zar","bits","link","sats"]

interface Props {
    setCurrency: (value: string | null) => void
    userCurrency: string | null
}

export default function CurrencySelect(props: Props) {
    const { setCurrency, userCurrency } = props

    useEffect(() => {
        if(typeof window.localStorage.getItem('gotchiactivity-currency') === 'string') {
          setCurrency(window.localStorage.getItem('gotchiactivity-currency'))
        }
      }, [])

    const handleCurrencySelect = (currency: string) => {
        setCurrency(currency)
        window.localStorage.setItem('gotchiactivity-currency', currency)
    }

    return (
            <Popover>
                <PopoverTrigger>
                    <Button
                        w='20px'
                        h='20px'
                        rounded='none'
                        textColor='mainUi.warm'
                        bg=''
                        _focus={{ boxShadow: 'none !important' }}
                        variant='ghost'
                        _hover={{
                            textColor: 'mainUi.ggMagenta'
                        }}>
                        <VStack spacing='' justify='center' align='center'>
                            <Text variant='identifier' fontSize='8px' textColor='mainUi.ggMagenta'>
                                currency
                            </Text>
                            <HStack spacing='2px'>
                                <Icon h='10px' w='10px' as={IoChevronDown} color='mainUi.ggMagenta' />
                                <Text zIndex='1' variant='identifier' textColor='inherit'>
                                    {userCurrency}
                                </Text>
                            </HStack>
                        </VStack>
                    </Button>
                </PopoverTrigger>
                <Portal>
                    <PopoverContent
                        w='unset'
                        rounded='unset'
                        borderColor='mainUi.ggMagenta'
                        bg='mainUi.warmDark'
                        padding=''
                        _focus={{ boxShadow: 'none !important' }}>
                        <PopoverArrow bg='mainUi.ggMagenta' />
                        <PopoverBody w='funset' padding='0' _focus={{ boxShadow: 'none !important' }}>
                            <VStack
                                maxH='100px'
                                overflow='auto'
                                pt='4px'
                                pb='6px'
                                sx={{
                                    "::-webkit-scrollbar": {
                                        width: "4px",
                                        height: "0px",
                                    },
                                    "::-webkit-scrollbar-track": {
                                        background: "mainUi.darker"
                                    },
                                    "::-webkit-scrollbar-thumb": {
                                        background: "mainUi.ggMagenta"
                                    },
                                    "::-webkit-scrollbar-thumb:hover": {
                                        background: "#555"
                                    }
                                }}>
                                {currencyOptions.sort((a: string, b: string) => a.localeCompare(b)).map((currency: string) => {
                                    return currency === userCurrency ? null : (
                                        <Button
                                            variant='ghost'
                                            w='20px'
                                            h='20px'
                                            rounded='none'
                                            onClick={() => { handleCurrencySelect(currency) }}
                                            textColor='mainUi.warm'
                                            bg=''
                                            _hover={{
                                                textColor: 'mainUi.ggMagenta'
                                            }}
                                            key={currency}
                                            defaultValue={currency}>
                                            <Text variant='identifier' textColor='inherit'>
                                                {currency}
                                            </Text>
                                        </Button>
                                    )
                                })}
                            </VStack>
                        </PopoverBody>
                    </PopoverContent>
                </Portal>
            </Popover>
    )
}