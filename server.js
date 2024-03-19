const http = require('http')
const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()

const { createClient } = require('redis')

const server = http.createServer()
let client
let Short


server.on('request', async (req, res) => {
  const slug = req.url.slice(1)
  let short = await client.get(`shorter:slug:${slug}`)
  if (!short) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'NOT_FOUND', message: 'NOT FOUND' }))
    return
  }


  await Short.updateOne({ slug }, { $inc: { clicked: 1 } }, { strict: false })

  short = JSON.parse(short)
  res.writeHead(301, { 'Location': short.real_url });
  res.end();
})

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DBNAME;
  await mongoose.connect(uri, { dbName });

  console.log('mongo connected')
  Short = mongoose.model('Short', {})
}

async function connectRedis() {
  const url = process.env.REDIS_URI
  client = await createClient({ url })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  console.log('redis connected')
}


async function bootstrap() {
  await connectRedis()
  await connectMongo()

  server.listen(Number(process.env.SERVER_PORT))
  console.log('server started:', server.address())
}
bootstrap()