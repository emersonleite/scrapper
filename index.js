const axios = require("axios")
const cheerio = require("cheerio")
const express = require("express")

const PORT = process.env.PORT || 5000
const app = express()

async function getPrices(url) {
  const prices = []
  await axios(url).then(response => {
    const { data } = response 
      
    const $ = cheerio.load(data)
    
      $(".ui-search-item__group__element.ui-search-price__part-without-link div div span .price-tag-amount", data).each((index, element)=>{
        const price = $(element).children('.price-tag-fraction').text()
        const cents = $(element).children('.price-tag-cents').text()
        const totalPrice = Number(`${price}.${cents}`)
        prices.push({totalPrice}) 
      })

      console.log(prices)
      return prices

    
    }).catch(err => console.error(err))
}

app.get('/prices/:item', (req, res) => {
  const URL = `https://lista.mercadolivre.com.br/${req.params.item || ""}`
  
  const prices = []
  axios(URL).then(response => {
    const { data } = response 
      
    const $ = cheerio.load(data)
    
      $(".ui-search-item__group__element.ui-search-price__part-without-link div div span .price-tag-amount", data).each((index, element) => {
        const real = $(element).children('.price-tag-fraction').text()
        const cents = $(element).children('.price-tag-cents').text() || ""
        const price = Number(`${real}.${cents}`)
        prices.push({price}) 
      })
      
      // Total de páginas 
      const totalPage = $(".andes-pagination__page-count").text().replace("de ","")
      console.log(totalPage)
      // Total de páginas

      return res.send(`${JSON.stringify({prices, totalPage, minor: Math.min(... prices.map(({price})=> price))})} `)

    
    }).catch(err => console.error(err))

})
  

app.listen(PORT,()=> console.log(`Ouvindo porta ${PORT}`))