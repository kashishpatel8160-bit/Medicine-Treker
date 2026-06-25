const fs = require('fs');
['src/components/MedicineForm.tsx', 'src/components/dashboard/MedicineCard.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
});
