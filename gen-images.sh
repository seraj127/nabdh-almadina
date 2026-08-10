#!/bin/bash
cd /home/z/my-project

generate() {
  local img="$1"
  local desc="$2"
  if [ ! -f "public/products/${img}.png" ]; then
    echo "[$(date +%H:%M:%S)] Generating: ${img}..."
    z-ai image -p "Professional product photography of a ${desc}, on clean white background, studio lighting, e-commerce style, high quality, detailed" -o "public/products/${img}.png" -s 1024x1024 2>&1
    sleep 3
  else
    echo "[$(date +%H:%M:%S)] Skipped (exists): ${img}"
  fi
}

# Preparation Tools
generate "travel-mug" "insulated travel mug spill-proof lid"
generate "mixing-bowl-set" "stainless steel mixing bowl set nested"
generate "measuring-cup-set" "measuring cups and spoons set"
generate "food-processor" "kitchen food processor multi-function"
generate "colander" "stainless steel colander large"
generate "grater" "stainless steel box grater 4-sided"
generate "mortar-pestle" "granite mortar and pestle heavy duty"

# Food Storage
generate "food-container-set" "food storage container set with lids airtight"
generate "glass-jar-set" "glass storage jars with wooden lids"
generate "lunch-box" "bento lunch box compartments"
generate "vacuum-sealer" "vacuum sealer machine for food"
generate "spice-rack" "spice rack with jars rotating"
generate "cereal-dispenser" "cereal dispenser dual compartment"

# Men's Fashion
generate "mens-shirt" "men dress shirt premium cotton classic fit"
generate "mens-pants" "men chinos pants slim fit"
generate "mens-jacket" "men casual jacket modern design"
generate "mens-tshirt" "men polo t-shirt premium cotton"
generate "mens-suit" "men business suit 2-piece"
generate "mens-hoodie" "men hoodie sweatshirt casual"

# Women's Fashion
generate "womens-dress" "elegant women dress modern design"
generate "womens-blouse" "women silk blouse elegant"
generate "womens-skirt" "women midi skirt modern"
generate "womens-abaya" "women abaya elegant Islamic fashion"
generate "womens-cardigan" "women knit cardigan soft fabric"
generate "womens-hijab" "premium hijab scarf set various colors"

# Kids Fashion
generate "kids-tshirt" "colorful kids t-shirt cotton fun print"
generate "kids-dress" "cute girls dress colorful"
generate "kids-pajama" "kids pajama set cozy cotton"
generate "kids-jacket" "kids winter jacket warm"
generate "kids-shorts" "kids casual shorts cotton"
generate "kids-romper" "baby romper cute design"

# Men's Footwear
generate "mens-dress-shoes" "men leather dress shoes classic"
generate "mens-sneakers" "men casual sneakers modern"
generate "mens-loafers" "men leather loafers comfortable"
generate "mens-boots" "men ankle boots leather"
generate "mens-sandals" "men leather sandals comfortable"
generate "mens-running-shoes" "men running shoes athletic lightweight"

# Women's Footwear
generate "womens-heels" "women high heels elegant"
generate "womens-flats" "women ballet flats comfortable"
generate "womens-sneakers" "women casual sneakers modern"
generate "womens-sandals" "women stylish sandals"
generate "womens-boots" "women ankle boots fashion"
generate "womens-wedges" "women wedge shoes comfortable"

# Kids Footwear
generate "kids-sneakers" "kids colorful sneakers lightweight"
generate "kids-sandals" "kids summer sandals comfortable"
generate "kids-school-shoes" "kids school shoes black leather"
generate "kids-boots" "kids winter boots warm"
generate "kids-slippers" "kids fun slippers cozy"
generate "kids-flip-flops" "kids flip flops colorful"

# Perfumes & Oud
generate "perfume-bottle" "luxury perfume bottle elegant glass"
generate "oud-wood" "premium oud wood chips aromatic"
generate "attar-oil" "traditional attar perfume oil ornate bottle"
generate "incense-burner" "oriental incense burner brass traditional"
generate "body-spray" "men body spray deodorant"
generate "gift-perfume-set" "luxury perfume gift set elegant packaging"

echo "[$(date +%H:%M:%S)] ✅ All images generated!"
