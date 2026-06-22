import { MongoClient, type Db } from "mongodb"

let clientPromise: Promise<MongoClient> | undefined

export async function getDatabase(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    return null
  }

  if (!clientPromise) {
    const client = new MongoClient(uri)
    clientPromise = client.connect()
  }

  const client = await clientPromise
  return client.db(process.env.MONGODB_DB || "hireguardian_ai")
}
