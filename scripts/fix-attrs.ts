import { db } from '../src/lib/db'

async function main() {
  // Fix Cookware products
  const cookware = await db.category.findFirst({ where: { slug: 'cookware' } })
  if (cookware) {
    const products = await db.product.findMany({ where: { categoryId: cookware.id } })
    const cookwareAttrs: Record<string, Record<string, unknown>> = {
      'NBD-COOK-001': { color: 'فضي', material: 'ستانلس ستيل', countryOfOrigin: 'الصين', dimensions: { length: '25 سم', width: '25 سم', height: '18 سم' }, weight: '1.2 كجم', capacity: '5 لتر', nonStick: false, dishwasherSafe: true, heatResistant: true, foodSafe: true },
      'NBD-COOK-002': { color: 'أسود', material: 'ألمنيوم مع طبقة غير لاصقة', countryOfOrigin: 'إيطاليا', dimensions: { length: '45 سم', width: '30 سم', height: '20 سم' }, weight: '3.5 كجم', capacity: 'متعدد', piecesCount: 7, nonStick: true, dishwasherSafe: true, heatResistant: true, foodSafe: true },
      'NBD-COOK-003': { color: 'أسود داكن', material: 'ألمنيوم مع تيفال', countryOfOrigin: 'فرنسا', dimensions: { length: '28 سم', width: '28 سم', height: '8 سم' }, weight: '0.8 كجم', capacity: '2 لتر', nonStick: true, dishwasherSafe: true, heatResistant: true, foodSafe: true },
      'NBD-COOK-004': { color: 'فضي لامع', material: 'ستانلس ستيل 18/10', countryOfOrigin: 'ألمانيا', dimensions: { length: '22 سم', width: '22 سم', height: '22 سم' }, weight: '2.1 كجم', capacity: '6 لتر', nonStick: false, dishwasherSafe: true, heatResistant: true, foodSafe: true },
      'NBD-COOK-005': { color: 'نحاسي لامع', material: 'نحاس نقي', countryOfOrigin: 'ليبيا', dimensions: { length: '20 سم', width: '20 سم', height: '15 سم' }, weight: '1.8 كجم', capacity: '3 لتر', nonStick: false, dishwasherSafe: false, heatResistant: true, foodSafe: true },
      'NBD-COOK-006': { color: 'رمادي غامق', material: 'ألمنيوم مع طبقة غير لاصقة', countryOfOrigin: 'تركيا', dimensions: { length: '24 سم', width: '24 سم', height: '12 سم' }, weight: '1.1 كجم', capacity: '3 لتر', nonStick: true, dishwasherSafe: true, heatResistant: true, foodSafe: true },
      'NBD-COOK-007': { color: 'فضي', material: 'ستانلس ستيل', countryOfOrigin: 'الهند', dimensions: { length: '32 سم', width: '32 سم', height: '25 سم' }, weight: '2.8 كجم', capacity: '10 لتر', nonStick: false, dishwasherSafe: true, heatResistant: true, foodSafe: true },
    }
    for (const p of products) {
      const attrs = cookwareAttrs[p.sku]
      if (attrs) {
        await db.product.update({ where: { id: p.id }, data: { attributes: JSON.stringify(attrs) } })
        console.log(`Updated: ${p.nameAr}`)
      }
    }
  }

  // Fix Kitchen Tools products
  const kitchenTools = await db.category.findFirst({ where: { slug: 'kitchen-tools' } })
  if (kitchenTools) {
    const products = await db.product.findMany({ where: { categoryId: kitchenTools.id } })
    const kitchenAttrs: Record<string, Record<string, unknown>> = {
      'NBD-KT-001': { color: 'بني طبيعي', material: 'خشب زان طبيعي', countryOfOrigin: 'تركيا', dimensions: { length: '30 سم', width: '6 سم', height: '3 سم' }, weight: '0.3 كجم', piecesCount: 6, dishwasherSafe: false, easyToClean: true },
      'NBD-KT-002': { color: 'فضي', material: 'ستانلس ستيل', countryOfOrigin: 'الصين', dimensions: { length: '25 سم', width: '22 سم', height: '12 سم' }, weight: '0.4 كجم', dishwasherSafe: true, easyToClean: true },
      'NBD-KT-003': { color: 'أبيض وأحمر', material: 'بلاستيك ABS وستانلس ستيل', countryOfOrigin: 'الصين', dimensions: { length: '35 سم', width: '10 سم', height: '10 سم' }, weight: '0.7 كجم', piecesCount: 2, easyToClean: true },
      'NBD-KT-004': { color: 'فضي', material: 'ستانلس ستيل', countryOfOrigin: 'الصين', dimensions: { length: '15 سم', width: '10 سم', height: '25 سم' }, weight: '0.3 كجم', dishwasherSafe: true, easyToClean: true },
      'NBD-KT-005': { color: 'فضي وأسود', material: 'ستانلس ستيل ألماني', countryOfOrigin: 'ألمانيا', dimensions: { length: '35 سم', width: '12 سم', height: '25 سم' }, weight: '1.5 كجم', piecesCount: 5, sharpBlade: true, dishwasherSafe: false, easyToClean: true },
      'NBD-KT-006': { color: 'بني طبيعي', material: 'خشب زان', countryOfOrigin: 'تركيا', dimensions: { length: '40 سم', width: '5 سم', height: '2 سم' }, weight: '0.1 كجم', dishwasherSafe: false, easyToClean: true },
      'NBD-KT-007': { color: 'شفاف', material: 'زجاج مقاوم للحرارة', countryOfOrigin: 'الصين', dimensions: { length: '12 سم', width: '12 سم', height: '15 سم' }, weight: '0.2 كجم', piecesCount: 4, microwaveSafe: true, dishwasherSafe: true, easyToClean: true },
    }
    for (const p of products) {
      const attrs = kitchenAttrs[p.sku]
      if (attrs) {
        await db.product.update({ where: { id: p.id }, data: { attributes: JSON.stringify(attrs) } })
        console.log(`Updated: ${p.nameAr}`)
      }
    }
  }

  console.log('Done!')
}

main().catch(console.error)
