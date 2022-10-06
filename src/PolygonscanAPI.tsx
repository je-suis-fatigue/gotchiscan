import React from 'react';
import { Tx } from './types/common/interfaces';

interface Props {
    module: string
    action: string
    // contract: string
    address: string
    page: number
    offset: number
    startblock: number
    endblock: number
    sort: string
    keepAlive?: boolean
}

interface Result {
    status: string
    message: string
    result: [Tx]
  }

const POLYGONSCANAPI = "FYEAW9M6H9FSEMIMPQAIIB328JBYZZNWBI"
const ETHERSCANAPI = "HFXCIZNPXQIBA9RI3RG39YC3YU5KFR3N5R"

export default async function PolygonscanAPI(props: Props): Promise<Result> {
    const { module, action, address, page, offset, startblock, endblock, sort, keepAlive } = props
    const URL = `https://api.polygonscan.com/api?module=${props.module}&action=${props.action}&address=${props.address}&page=${props.page}&offset=${props.offset}&startblock=${props.startblock}&endblock=${props.endblock}&sort=${props.sort}&apikey=FYEAW9M6H9FSEMIMPQAIIB328JBYZZNWBI`
    let retries = 5

    function delay(t: number) {
        return new Promise(function(resolve) { 
            setTimeout(resolve.bind(null), t)
        });
     }

    const data = async (): Promise<Result> => {
        return await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': "application/x-www-form-urlencoded" },
            keepalive: keepAlive
        })
                    .then((res: Response) => {
                        return res.json()
                    }).then((json: Result) => 
                    {
                        if(json.status == '1') {
                            return json
                        }
                        if(retries > 0) {
                            retries -= 1
                            return delay(Math.floor(Math.random() * 500)).then(() => data())
                        }
                        throw new Error()
                    })}

    return data()
}