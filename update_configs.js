const fs = require('fs');
const path = require('path');

const apps = {
  "ucc-x-renaissance-star-360---algebra-readiness": "algebra-readiness",
  "ucc-×-renaissance-star-360_-base-10-&-place-value": "base-10-place-value",
  "ucc-×-renaissance-star-360_-key-ideas-&-details": "key-ideas-details",
  "ucc-×-renaissance-star-360_-literature-craft-&-structure": "literature-craft-structure",
  "ucc-×-renaissance-star-360_-literature-key-ideas-&-details": "literature-key-ideas-details",
  "ucc-×-renaissance-star-360_-range-&-complexity": "range-complexity",
  "ucc-×-renaissance-star-360_-reading--informational_-craft-&-structure": "reading-informational-craft-structure",
  "ucc-×-renaissance-star-360_-test-assessment": "test-assessment",
  "ucc-×-renaissance-star-360_-vocabulary": "vocabulary",
  "UCC-Renaissance-STAR-360-Geometry-Spatial-main": "geometry-spatial",
  "UCC-x-Rennaissance-STAR-360-Measurement-Data-main": "measurement-data",
  "UCC-x-Renaissance-Star-360-Fractions---Visual-Ratio-Number-Sense-Lab-main": "fractions-ratios"
};

const rootDir = process.env.USER_ROOT || process.cwd();
console.log('Working in', rootDir);

for (const [folder, targetPath] of Object.entries(apps)) {
  const viteConfigPath = path.join(rootDir, folder, 'vite.config.ts');
  const appTsxPath = path.join(rootDir, folder, 'App.tsx');
  
  if (fs.existsSync(viteConfigPath)) {
    let code = fs.readFileSync(viteConfigPath, 'utf8');
    if (!code.includes('base:')) {
      code = code.replace('export default defineConfig({', `export default defineConfig({\n  base: '/UCC-cognition-under-pressure-assessment-test/${targetPath}/',`);
      fs.writeFileSync(viteConfigPath, code);
      console.log('Updated base in', viteConfigPath);
    }
  }

  if (fs.existsSync(appTsxPath)) {
    let code = fs.readFileSync(appTsxPath, 'utf8');
    if (!code.includes('← Back to Home Directory')) {
      const backLink = `\n      <a href="/" className="mb-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#4EABBC] transition-colors">← Back to Home Directory</a>`;
      
      const pattern = '<header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">';
      
      if (code.includes(pattern)) {
        code = code.replace(pattern, `${backLink}\n      ${pattern}`);
        fs.writeFileSync(appTsxPath, code);
        console.log('Added Back Link to', appTsxPath);
      } else {
        console.log('Header pattern not found in', appTsxPath);
      }
    }
  }
}
