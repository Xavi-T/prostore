import { prisma } from './prisma'
import sampleData from './sample-data'

async function main() {
  console.log('Seeding database...')
  await prisma.product.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.verificationToken.deleteMany()

  await prisma.product.createMany({ data: sampleData.products })
  await prisma.user.createMany({ data: sampleData.users })
  // Add your seeding logic here
  console.log('Database seeded successfully.')
}

main()
