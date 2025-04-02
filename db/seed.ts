import { prisma } from './prisma'
import sampleData from './sample-data'

async function main() {
  console.log('Seeding database...')
  await prisma.product.deleteMany()

  await prisma.product.createMany({ data: sampleData.products })
  // Add your seeding logic here
  console.log('Database seeded successfully.')
}

main()
