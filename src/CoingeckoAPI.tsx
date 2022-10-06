import React from 'react';
import { GotchiverseEvents } from './types/common/interfaces';

interface ERC20Data {
  prices: [[number, number]]
  market_caps: [[number, number]]
  total_volumes: [[number, number]]
}

  interface Props {
    id: string
    currency: string | null
    keepAlive?: boolean
  }

export default async function CoingeckoAPI(props: Props): Promise<ERC20Data | void> {
    const { id, currency, keepAlive } = props
    const URL = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency ? currency : 'usd'}&days=max&interval=daily`
    let retries = 5

    function delay(t: number) {
        return new Promise(function(resolve) { 
            setTimeout(resolve.bind(null), t)
        });
     }

    const data = async (): Promise<ERC20Data | void> => {
        return await fetch(URL, {
          method: 'GET',
          headers: {'Content-Type': "application/json"},
          keepalive: keepAlive,
        }).then(async (res: Response) => {
                        console.log(res)
                        if(res.status == 200) {
                            return await res.json() as ERC20Data
                        }
                        if(retries > 0) {
                            console.log('retrying')
                            retries -= 1
                            return delay(Math.floor(Math.random() * 500)).then(() => data())
                        }
                        throw new Error('CoingeckoAPI request failure, out of retries.')
                  }).catch((error) => {
                    console.log(error)
                  })
      }
        
    return data()
}