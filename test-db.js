const { PrismaClient } = require('@prisma/client')

// Test different URL formats
const urls = [
  'postgresql://postgres:Wegonshine1%2A@db.oqifdixuxnabkpdqjjrh.supabase.co:5432/postgres',
  'postgresql://postgres:Wegonshine1*@db.oqifdixuxnabkpdqjjrh.supabase.co:5432/postgres',
  process.env.DATABASE_URL
]

console.log('Testing database URLs...\n')

urls.forEach((url, i) => {
  if (!url) {
    console.log(`URL ${i + 1}: undefined`)
    return
  }

  console.log(`URL ${i + 1}: ${url.replace(/postgres:([^@]+)@/, 'postgres:***@')}`)

  try {
    const parsed = new URL(url)
    console.log(`  ✓ Valid URL format`)
    console.log(`  - Host: ${parsed.hostname}`)
    console.log(`  - Port: ${parsed.port}`)
    console.log(`  - User: ${parsed.username}`)
    console.log(`  - Pass: ${parsed.password ? '***' : 'none'}`)
  } catch (e) {
    console.log(`  ✗ Invalid URL: ${e.message}`)
  }
  console.log('')
})

// Try actual connection
async function testConnection() {
  console.log('Testing actual database connection...')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    await prisma.$connect()
    console.log('✓ Successfully connected to database!')
    await prisma.$disconnect()
  } catch (error) {
    console.log('✗ Connection failed:', error.message)
  }
}

testConnection()