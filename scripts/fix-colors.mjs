import fs from 'fs';
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

files.forEach(f => {
  if (fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf8');
    
    // Custom gradient specific overrides
    text = text.replace(/from-orange-600 to-amber-500/g, 'from-teal-600 to-teal-400');
    text = text.replace(/hover:from-orange-500 hover:to-amber-400/g, 'hover:from-teal-500 hover:to-teal-300');
    text = text.replace(/from-orange-500 to-amber-500/g, 'from-teal-500 to-teal-400');
    text = text.replace(/from-orange-500 to-orange-400/g, 'from-teal-600 to-amber-500');
    text = text.replace(/from-amber-500 to-orange-500/g, 'from-teal-500 to-teal-600');
    
    // Mass replace
    text = text.replace(/orange-500/g, 'teal-600');
    text = text.replace(/orange-600/g, 'teal-700');
    text = text.replace(/orange-400/g, 'amber-500');
    text = text.replace(/orange-900/g, 'teal-900');
    text = text.replace(/orange-300/g, 'amber-400');
    text = text.replace(/orange-200/g, 'amber-300');
    text = text.replace(/orange-100/g, 'amber-200');
    text = text.replace(/orange-50/g, 'amber-100');
    
    fs.writeFileSync(f, text);
    console.log('Fixed', f);
  } else {
    console.log('Not found', f);
  }
});
