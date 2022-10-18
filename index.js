const PORT = 8000
const axios = require("axios");
const cheerio = require("cheerio")
const express = require("express")
const { writeFileSync } = require('fs')
const { parse } = require("json2csv")

const app = express();
const url = "https://coinmarketcap.com/"
// top 10 coins
const selector = "#__next > div > div.main-content > div.sc-4vztjb-0.cLXodu.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"

// What I want to scrape
const keys = [
  'rank',
  'name',
  'price',
  '1h',
  '24h',
  '7d',
  'marketCap',
  'volume',
  'circulatingSupply'
]

coinArr = []

async function getCoinPrices() { 

  try {

    
    const { data } = await axios(url)
    const $ = cheerio.load(data)
    
    $(selector).each((parentId, parentElement) => {
      let keyIndex = 0
      const coins = {} 

      if(parentId <= 9) {
        $(parentElement).children().each((childId, childElement) => {
          const child = $(childElement).text()
          
          if(child) {
            coins[keys[keyIndex]] = child
            keyIndex++
          }})
          coinArr.push((coins))   
      }
    })
    
    let count = 0;
    // cleaning up coin names
    while (count < 10) {
      coinArr[count].name = coinArr[count].name.substring(0, coinArr[0+count].name.indexOf(`${count+1}`))
      count++
    }
  
    const csv = parse(coinArr)
    const fileName = `crypto_prices_${(new Date().toJSON().slice(0,10))}.csv`
    writeFileSync(`${fileName}`, csv) 
    return coinArr
    
  } catch (err) {
    console.error(err)
  }
}
 
  
app.get('/api/coin-prices', async (req, res) => {
  try {
    const prices = await getCoinPrices() 
    
    return res.status(200).json({
      prices
    })
  } catch (error) {
    return res.status(500).json({
      error
    })
  }
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))



