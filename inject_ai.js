const fs = require('fs');
const path = require('path');

const apps = [
  "UCC-Renaissance-STAR-360-Geometry-Spatial-main",
  "UCC-x-Rennaissance-STAR-360-Measurement-Data-main",
  "UCC-x-Renaissance-Star-360-Fractions---Visual-Ratio-Number-Sense-Lab-main"
];

for (const app of apps) {
  const appPath = path.join(process.cwd(), app, 'App.tsx');
  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    
    // 1. Inject import
    if (!content.includes("import { AiSettingsPanel }")) {
      content = 'import { AiSettingsPanel } from "./components/AiSettingsPanel";\n' + content;
    }
    
    // 2. Inject component after header
    if (!content.includes("<AiSettingsPanel")) {
      const headerPattern = '</header>';
      const injection = '\n        <AiSettingsPanel purpose="Stores operator-selected provider and model locally for this origin." />';
      content = content.replace(headerPattern, headerPattern + injection);
    }
    
    fs.writeFileSync(appPath, content);
    console.log(`Injected AiSettingsPanel into ${app}`);
  }
}
