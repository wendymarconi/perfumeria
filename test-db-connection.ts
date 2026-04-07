import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Testing connection to Supabase database...')
    const perfumeCount = await prisma.perfume.count()
    console.log('✅ Connection to Perfume model successful. Count:', perfumeCount)
    
    const adminCount = await prisma.adminUser.count()
    console.log('✅ Connection to AdminUser model successful. Count:', adminCount)
    
    console.log('DATABASE CONNECTION IS OK! 🚀')
  } catch (error) {
    console.error('❌ Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
