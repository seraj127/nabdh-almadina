import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/products';

interface ImageTask {
  filename: string;
  prompt: string;
}

const tasks: ImageTask[] = [
  // ─── الأدوات الكهربائية ───
  { filename: 'coffee-machine.png', prompt: 'Professional product photography of an automatic espresso coffee machine 15 bar, modern silver design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'electric-blender.png', prompt: 'Professional product photography of an electric blender with glass jar, multiple speeds, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── العناية بالبيت ───
  { filename: 'general-disinfectant.png', prompt: 'Professional product photography of a general disinfectant spray bottle, clean design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'furniture-polish.png', prompt: 'Professional product photography of a furniture polish spray bottle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'air-freshener.png', prompt: 'Professional product photography of an air freshener spray bottle with natural scent, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'dish-soap.png', prompt: 'Professional product photography of a liquid dish soap bottle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'laundry-detergent.png', prompt: 'Professional product photography of a concentrated laundry detergent powder box, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'floor-cleaner.png', prompt: 'Professional product photography of a floor cleaner bottle with antibacterial formula, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── مستلزمات الأم والطفل ───
  { filename: 'baby-bottle.png', prompt: 'Professional product photography of an anti-colic baby bottle, BPA-free, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'newborn-clothes.png', prompt: 'Professional product photography of a cute newborn baby clothes set, soft cotton pastel colors, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'baby-car-seat.png', prompt: 'Professional product photography of a safe baby car seat, modern design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'baby-stroller.png', prompt: 'Professional product photography of a lightweight folding baby stroller, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'baby-diapers.png', prompt: 'Professional product photography of a baby diapers pack, ultra absorbent, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'baby-formula.png', prompt: 'Professional product photography of a baby formula milk powder tin, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── الإكسسوارات والساعات ───
  { filename: 'silver-ring.png', prompt: 'Professional product photography of a sterling silver ring with oriental design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'pearl-necklace.png', prompt: 'Professional product photography of a natural pearl necklace, elegant luxury, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'leather-belt.png', prompt: 'Professional product photography of a genuine leather belt with stainless steel buckle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'sunglasses.png', prompt: 'Professional product photography of stylish polarized sunglasses, modern design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'gold-bracelet.png', prompt: 'Professional product photography of an 18k gold bracelet with oriental design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-wristwatch.png', prompt: 'Professional product photography of a luxury men wristwatch with stainless steel frame, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── الإلكترونيات ───
  { filename: 'camera.png', prompt: 'Professional product photography of a digital camera with high-resolution lens, 4K video, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'smartwatch.png', prompt: 'Professional product photography of a modern smartwatch with touch screen and health monitoring, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'fast-charger.png', prompt: 'Professional product photography of a 65W fast charger, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'tablet.png', prompt: 'Professional product photography of a tablet with high-res screen, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'bluetooth-headphones.png', prompt: 'Professional product photography of wireless Bluetooth headphones with noise cancellation, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'smartphone.png', prompt: 'Professional product photography of a smartphone with AMOLED screen, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أواني الطبخ ───
  { filename: 'cooking-pot.png', prompt: 'Professional product photography of a stainless steel cooking pot with lid, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'frying-pan.png', prompt: 'Professional product photography of a non-stick frying pan, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'saucepan.png', prompt: 'Professional product photography of a small saucepan with handle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'stockpot.png', prompt: 'Professional product photography of a large stockpot with lid, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'wok-pan.png', prompt: 'Professional product photography of a wok pan, carbon steel, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'steamer-pot.png', prompt: 'Professional product photography of a steamer pot with tiers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أدوات المطبخ ───
  { filename: 'kitchen-knife-set.png', prompt: 'Professional product photography of a kitchen knife set with wooden block, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'cutting-board.png', prompt: 'Professional product photography of a wooden cutting board, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kitchen-scissors.png', prompt: 'Professional product photography of stainless steel kitchen scissors, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'peeler.png', prompt: 'Professional product photography of a vegetable peeler, ergonomic handle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'spatula-set.png', prompt: 'Professional product photography of a kitchen spatula set, silicone, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'whisk.png', prompt: 'Professional product photography of a stainless steel whisk, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أدوات التقديم ───
  { filename: 'dinner-plate-set.png', prompt: 'Professional product photography of a white ceramic dinner plate set, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'serving-bowl.png', prompt: 'Professional product photography of a large ceramic serving bowl, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'serving-platter.png', prompt: 'Professional product photography of a rectangular serving platter, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'tea-set.png', prompt: 'Professional product photography of an oriental tea set with cups and teapot, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'glass-pitcher.png', prompt: 'Professional product photography of a glass water pitcher with lid, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'soup-tureen.png', prompt: 'Professional product photography of a ceramic soup tureen with lid, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أكواب وأباريق ───
  { filename: 'coffee-mug-set.png', prompt: 'Professional product photography of a set of ceramic coffee mugs, colorful, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'glass-cup-set.png', prompt: 'Professional product photography of a set of glass cups, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'thermal-flask.png', prompt: 'Professional product photography of a stainless steel thermal flask, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'water-pitcher.png', prompt: 'Professional product photography of a water pitcher with filter, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'tea-glass-set.png', prompt: 'Professional product photography of oriental tea glasses with holder, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'travel-mug.png', prompt: 'Professional product photography of an insulated travel mug, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أدوات التحضير ───
  { filename: 'mixing-bowl-set.png', prompt: 'Professional product photography of a stainless steel mixing bowl set, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'measuring-cup-set.png', prompt: 'Professional product photography of measuring cups and spoons set, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'food-processor.png', prompt: 'Professional product photography of a kitchen food processor, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'colander.png', prompt: 'Professional product photography of a stainless steel colander, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'grater.png', prompt: 'Professional product photography of a stainless steel box grater, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mortar-pestle.png', prompt: 'Professional product photography of a granite mortar and pestle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── تخزين الطعام ───
  { filename: 'food-container-set.png', prompt: 'Professional product photography of a food storage container set with lids, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'glass-jar-set.png', prompt: 'Professional product photography of glass storage jars with wooden lids, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'lunch-box.png', prompt: 'Professional product photography of a bento lunch box, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'vacuum-sealer.png', prompt: 'Professional product photography of a vacuum sealer machine, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'spice-rack.png', prompt: 'Professional product photography of a spice rack with jars, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'cereal-dispenser.png', prompt: 'Professional product photography of a cereal dispenser, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── ملابس رجالية ───
  { filename: 'mens-shirt.png', prompt: 'Professional product photography of a men dress shirt, premium cotton, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-pants.png', prompt: 'Professional product photography of men chinos pants, slim fit, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-jacket.png', prompt: 'Professional product photography of a men casual jacket, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-tshirt.png', prompt: 'Professional product photography of a men polo t-shirt, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-suit.png', prompt: 'Professional product photography of a men business suit, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-hoodie.png', prompt: 'Professional product photography of a men hoodie sweatshirt, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── ملابس نسائية ───
  { filename: 'womens-dress.png', prompt: 'Professional product photography of an elegant women dress, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-blouse.png', prompt: 'Professional product photography of a women silk blouse, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-skirt.png', prompt: 'Professional product photography of a women midi skirt, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-abaya.png', prompt: 'Professional product photography of a women abaya, elegant Islamic fashion, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-cardigan.png', prompt: 'Professional product photography of a women knit cardigan, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-hijab.png', prompt: 'Professional product photography of a premium hijab scarf set, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── ملابس أطفال ───
  { filename: 'kids-tshirt.png', prompt: 'Professional product photography of a colorful kids t-shirt, cotton, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-dress.png', prompt: 'Professional product photography of a cute girls dress, colorful, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-pajama.png', prompt: 'Professional product photography of kids pajama set, cozy cotton, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-jacket.png', prompt: 'Professional product photography of a kids winter jacket, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-shorts.png', prompt: 'Professional product photography of kids casual shorts, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-romper.png', prompt: 'Professional product photography of a baby romper, cute design, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أحذية رجالية ───
  { filename: 'mens-dress-shoes.png', prompt: 'Professional product photography of men leather dress shoes, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-sneakers.png', prompt: 'Professional product photography of men casual sneakers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-loafers.png', prompt: 'Professional product photography of men leather loafers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-boots.png', prompt: 'Professional product photography of men ankle boots, leather, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-sandals.png', prompt: 'Professional product photography of men leather sandals, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'mens-running-shoes.png', prompt: 'Professional product photography of men running shoes, athletic, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أحذية نسائية ───
  { filename: 'womens-heels.png', prompt: 'Professional product photography of women high heels, elegant, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-flats.png', prompt: 'Professional product photography of women ballet flats, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-sneakers.png', prompt: 'Professional product photography of women casual sneakers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-sandals.png', prompt: 'Professional product photography of women stylish sandals, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-boots.png', prompt: 'Professional product photography of women ankle boots, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'womens-wedges.png', prompt: 'Professional product photography of women wedge shoes, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── أحذية أطفال ───
  { filename: 'kids-sneakers.png', prompt: 'Professional product photography of kids colorful sneakers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-sandals.png', prompt: 'Professional product photography of kids summer sandals, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-school-shoes.png', prompt: 'Professional product photography of kids school shoes, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-boots.png', prompt: 'Professional product photography of kids winter boots, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-slippers.png', prompt: 'Professional product photography of kids fun slippers, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'kids-flip-flops.png', prompt: 'Professional product photography of kids flip flops, colorful, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  // ─── العطور والبخور ───
  { filename: 'perfume-bottle.png', prompt: 'Professional product photography of a luxury perfume bottle, elegant glass, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'oud-wood.png', prompt: 'Professional product photography of premium oud wood chips, aromatic, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'attar-oil.png', prompt: 'Professional product photography of traditional attar perfume oil in ornate bottle, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'incense-burner.png', prompt: 'Professional product photography of an oriental incense burner, brass, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'body-spray.png', prompt: 'Professional product photography of a men body spray, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
  { filename: 'gift-perfume-set.png', prompt: 'Professional product photography of a luxury perfume gift set, on clean white background, studio lighting, e-commerce style, high quality, detailed' },
];

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const zai = await ZAI.create();
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const task of tasks) {
    const outputPath = path.join(OUTPUT_DIR, task.filename);
    
    // Skip if already exists and has reasonable size
    if (fs.existsSync(outputPath)) {
      const stat = fs.statSync(outputPath);
      if (stat.size > 10000) {
        console.log(`⏭️  Skipped (exists): ${task.filename}`);
        skipped++;
        continue;
      }
    }
    
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        console.log(`🎨 [${completed + 1}/${tasks.length}] Generating: ${task.filename}...`);
        
        const response = await zai.images.generations.create({
          prompt: task.prompt,
          size: '1024x1024'
        });
        
        const imageBase64 = response.data[0].base64;
        const buffer = Buffer.from(imageBase64, 'base64');
        fs.writeFileSync(outputPath, buffer);
        
        completed++;
        console.log(`✅ Saved: ${task.filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
        break;
      } catch (error: any) {
        retries++;
        if (error.message?.includes('429')) {
          const waitTime = 10000 * retries;
          console.log(`⏳ Rate limited, waiting ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error(`❌ Failed (attempt ${retries}): ${task.filename} - ${error.message}`);
          if (retries >= maxRetries) {
            failed++;
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n📊 Summary: ${completed} completed, ${skipped} skipped, ${failed} failed out of ${tasks.length} total`);
}

main().catch(console.error);
