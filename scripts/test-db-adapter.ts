// Quick test for the db adapter
// Run with: bun run scripts/test-db-adapter.ts
import { db } from '../src/lib/db'

async function main() {
  console.log('=== Testing Supabase DB adapter ===\n')

  // Test 1: Find many templates
  console.log('1. db.template.findMany({ where: { active: true }, take: 3 })')
  try {
    const templates = await db.template.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    console.log(`  ✓ Got ${templates.length} templates:`)
    for (const t of templates) {
      console.log(`     - ${t.title} (${t.category})`)
    }
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 2: Count templates
  console.log('\n2. db.template.count({ where: { active: true } })')
  try {
    const count = await db.template.count({ where: { active: true } })
    console.log(`  ✓ Active templates: ${count}`)
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 3: Find unique template
  console.log('\n3. db.template.findUnique({ where: { id: <first-template-id> } })')
  try {
    const all = await db.template.findMany({ take: 1 })
    if (all[0]) {
      const t = await db.template.findUnique({ where: { id: all[0].id } })
      console.log(`  ✓ Found: ${t?.title}`)
    }
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 4: Find plans
  console.log('\n4. db.subscriptionPlan.findMany()')
  try {
    const plans = await db.subscriptionPlan.findMany({ orderBy: { price: 'asc' } })
    console.log(`  ✓ Got ${plans.length} plans:`)
    for (const p of plans) {
      console.log(`     - ${p.name}: $${p.price}/${p.interval}`)
    }
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 5: Find admin user
  console.log('\n5. db.user.findUnique({ where: { email: "admin@webflowsub.com" } })')
  try {
    const user = await db.user.findUnique({ where: { email: 'admin@webflowsub.com' } })
    if (user) {
      console.log(`  ✓ Found: ${user.name} (role: ${user.role})`)
    } else {
      console.log(`  ✗ Admin user not found`)
    }
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 6: Testimonials with active filter
  console.log('\n6. db.testimonial.findMany({ where: { active: true } })')
  try {
    const testimonials = await db.testimonial.findMany({ where: { active: true } })
    console.log(`  ✓ Got ${testimonials.length} testimonials`)
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  // Test 7: FAQs ordered
  console.log('\n7. db.fAQ.findMany({ orderBy: { order: "asc" } })')
  try {
    const faqs = await db.fAQ.findMany({ orderBy: { order: 'asc' } })
    console.log(`  ✓ Got ${faqs.length} FAQs`)
    for (const f of faqs) {
      console.log(`     - Q: ${f.question}`)
    }
  } catch (e: any) {
    console.log(`  ✗ ${e.message}`)
  }

  console.log('\n=== Done ===')
}

main().catch(console.error)
