import { HStack, IconButton, Input } from '@chakra-ui/react';
import React, { SetStateAction, useState } from 'react';
import { IoSearchSharp } from 'react-icons/io5';

interface Props {
    search: string
    setSearch: (value: string) => void
}

export default function Search(props: Props) {
    const { setSearch, search } = props
    const [searchInput, setSearchInput] = useState<string>("")

    const handleSearchInput = (value: string) => {
        setSearchInput(value.toLowerCase())
    }

    const handleSearchEnter = (e: { code: string, key: string }) => {
        const keyCode = e.code || e.key
        if(keyCode === 'Enter') {
            setSearch(searchInput)
        }
    }

    const handleSearchButtonClick = () => {
        if (searchInput != search) {
            setSearch(searchInput)
        }
    }

    return (
        <HStack h='40px'>
            <Input
                variant='filled'
                value={searchInput}
                bg='mainUi.warmDark'
                border='1px'
                textColor='mainUi.light'
                onKeyDown={(e: { code: string, key: string }) => handleSearchEnter(e)}
                onChange={(e: { target: { value: string } }) => handleSearchInput(e.target.value)}
                placeholder='search: hash | function | to | from | contract'
                _placeholder={{ opacity: 1, color: 'mainUi.darker' }}
                focusBorderColor=''
                _focus={{ border: '2px' }}
                size='sm' />
            <IconButton
                h='full' w='40px'
                aria-label='Search Txns'
                // isLoading={txnsLoading}
                icon={<IoSearchSharp />}
                variant='dash'
                onClick={() => handleSearchButtonClick()} />
        </HStack>
    );
}

