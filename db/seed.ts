import { PrismaClient } from '@prisma/client'
import sampleData from './sample-data'

async function main() {
  console.log('Seeding database...')
  const prisma = new PrismaClient()
  await prisma.product.deleteMany()

  await prisma.product.createMany({ data: sampleData.products })
  // Add your seeding logic here
  console.log('Database seeded successfully.')
}

main()
