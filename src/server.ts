import http from 'node:http'

const DATABASE_URL = `${process.env.DATABASE_URL}`

const app = http.createServer((req, res) => {
  res.end('hello word')
})

app.listen(5555, () => {
  console.log('SERVER IS RUNNIG')
  console.log(DATABASE_URL)
})
