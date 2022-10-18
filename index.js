const PORT = 8000
const axios = require("axios");
const cheerio = require("cheerio")
const express = require("express")
const { writeFileSync } = require('fs')
const { parse } = require("json2csv")

const app = express();
const url = "https://coinmarketcap.com/"
const selector = "#__next > div > div.main-content > div.sc-4vztjb-0.cLXodu.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"

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

axios(url)
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)
    
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
    while (count < 10) {
      coinArr[count].name = coinArr[count].name.substring(0, coinArr[0+count].name.indexOf(`${count+1}`))
      count++
    }
    const csv = parse(coinArr)
    writeFileSync("test.csv", csv)
  })
    .catch(err => console.log(err))
  app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))



