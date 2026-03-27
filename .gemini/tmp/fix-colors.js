const fs = require('fs');
const files = [
  'src/app/components/Root.tsx',
  'src/app/seller/dashboard/page.tsx',
  'src/app/seller/layout.tsx',
  'src/app/upload-car/page.tsx',
  'src/app/orders/page.tsx',
  'src/app/order/[id]/page.tsx',
  'src/app/layout.tsx',
  'src/app/cars/page.tsx',
  'src/app/cars/[id]/page.tsx'
];

let filesProcessed = 0;
let errors = 0;

files.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Complex Gradients specific blocks
      content = content.replace(/from-orange-600 to-amber-500/g, 'from-teal-600 to-teal-400');
      content = content.replace(/hover:from-orange-500 hover:to-amber-400/g, 'hover:from-teal-500 hover:to-teal-300');
      content = content.replace(/from-amber-500 to-orange-500/g, 'from-teal-400 to-teal-600');
      content = content.replace(/from-orange-500 to-amber-500/g, 'from-teal-600 to-teal-400');
      
      // Core Tailwind utility class mapping
      content = content.replace(/orange-500/g, 'teal-600');
      content = content.replace(/orange-600/g, 'teal-700');
      content = content.replace(/orange-400/g, 'amber-500');
      content = content.replace(/orange-900/g, 'teal-900');
      content = content.replace(/orange-300/g, 'amber-400');
      content = content.replace(/orange-200/g, 'amber-300');
      content = content.replace(/orange-100/g, 'amber-200');
      content = content.replace(/orange-50/g, 'amber-100');
      
      fs.writeFileSync(file, content);
      filesProcessed++;
    } else {
      console.log("File not found:", file);
    }
  } catch(e) {
    errors++;
    console.log("Error processing file", file, e);
  }
});

console.log(`Processed ${filesProcessed} files. Errors: ${errors}`);
