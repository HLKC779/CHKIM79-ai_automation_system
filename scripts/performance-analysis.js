#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analyzes bundle size, load times, and performance metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance thresholds
const THRESHOLDS = {
  bundleSize: {
    total: 200, // KB
    main: 50,   // KB
    vendor: 40, // KB
  },
  loadTime: {
    fcp: 1500,  // ms
    lcp: 2500,  // ms
    fid: 100,   // ms
    cls: 0.1,   // score
  },
  lighthouse: {
    performance: 90,
    accessibility: 90,
    bestPractices: 90,
    seo: 90,
  }
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeBundleSize() {
  log('\n📦 Analyzing Bundle Size...', 'blue');
  
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      log('❌ Dist folder not found. Run "npm run build" first.', 'red');
      return false;
    }

    const assetsPath = path.join(distPath, 'assets');
    const jsFiles = fs.readdirSync(assetsPath)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        return { name: file, size: sizeKB, path: filePath };
      });

    let totalSize = 0;
    let mainSize = 0;
    let vendorSize = 0;

    jsFiles.forEach(file => {
      totalSize += file.size;
      
      if (file.name.includes('index')) {
        mainSize = file.size;
      } else if (file.name.includes('vendor')) {
        vendorSize = file.size;
      }
      
      const status = file.size > THRESHOLDS.bundleSize.main ? '❌' : '✅';
      log(`  ${status} ${file.name}: ${file.size}KB`, file.size > THRESHOLDS.bundleSize.main ? 'red' : 'green');
    });

    log(`\n📊 Bundle Size Summary:`, 'bold');
    log(`  Total: ${totalSize}KB ${totalSize > THRESHOLDS.bundleSize.total ? '❌' : '✅'}`, 
        totalSize > THRESHOLDS.bundleSize.total ? 'red' : 'green');
    log(`  Main: ${mainSize}KB ${mainSize > THRESHOLDS.bundleSize.main ? '❌' : '✅'}`, 
        mainSize > THRESHOLDS.bundleSize.main ? 'red' : 'green');
    log(`  Vendor: ${vendorSize}KB ${vendorSize > THRESHOLDS.bundleSize.vendor ? '❌' : '✅'}`, 
        vendorSize > THRESHOLDS.bundleSize.vendor ? 'red' : 'green');

    return totalSize <= THRESHOLDS.bundleSize.total;
  } catch (error) {
    log(`❌ Error analyzing bundle size: ${error.message}`, 'red');
    return false;
  }
}

function analyzeLighthouse() {
  log('\n🏠 Running Lighthouse Analysis...', 'blue');
  
  try {
    // Check if Lighthouse is installed
    try {
      execSync('lighthouse --version', { stdio: 'ignore' });
    } catch {
      log('❌ Lighthouse not found. Install with: npm install -g lighthouse', 'red');
      return false;
    }

    // Run Lighthouse audit
    const output = execSync(
      'lighthouse http://localhost:5173 --output=json --chrome-flags="--headless"',
      { encoding: 'utf8' }
    );

    const results = JSON.parse(output);
    const scores = results.categories;

    log('\n📊 Lighthouse Scores:', 'bold');
    
    Object.keys(scores).forEach(category => {
      const score = Math.round(scores[category].score * 100);
      const threshold = THRESHOLDS.lighthouse[category] || 90;
      const status = score >= threshold ? '✅' : '❌';
      const color = score >= threshold ? 'green' : 'red';
      
      log(`  ${status} ${category}: ${score}/100`, color);
    });

    // Check Core Web Vitals
    const metrics = results.audits;
    log('\n📈 Core Web Vitals:', 'bold');
    
    const webVitals = [
      { name: 'FCP', key: 'first-contentful-paint', threshold: THRESHOLDS.loadTime.fcp },
      { name: 'LCP', key: 'largest-contentful-paint', threshold: THRESHOLDS.loadTime.lcp },
      { name: 'FID', key: 'max-potential-fid', threshold: THRESHOLDS.loadTime.fid },
      { name: 'CLS', key: 'cumulative-layout-shift', threshold: THRESHOLDS.loadTime.cls }
    ];

    webVitals.forEach(vital => {
      const metric = metrics[vital.key];
      if (metric && metric.numericValue !== undefined) {
        const value = vital.name === 'CLS' ? metric.numericValue : metric.numericValue;
        const status = value <= vital.threshold ? '✅' : '❌';
        const color = value <= vital.threshold ? 'green' : 'red';
        const unit = vital.name === 'CLS' ? '' : 'ms';
        
        log(`  ${status} ${vital.name}: ${value.toFixed(2)}${unit}`, color);
      }
    });

    return true;
  } catch (error) {
    log(`❌ Error running Lighthouse: ${error.message}`, 'red');
    return false;
  }
}

function analyzeDependencies() {
  log('\n📋 Analyzing Dependencies...', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for known performance-heavy packages
    const heavyPackages = [
      'moment', 'lodash', 'jquery', 'bootstrap', 'material-ui',
      'antd', 'semantic-ui', 'foundation', 'bulma'
    ];

    const foundHeavy = heavyPackages.filter(pkg => dependencies[pkg]);
    
    if (foundHeavy.length > 0) {
      log('⚠️  Found potentially heavy packages:', 'yellow');
      foundHeavy.forEach(pkg => {
        log(`  - ${pkg}: ${dependencies[pkg]}`, 'yellow');
      });
      log('  Consider using lighter alternatives or tree-shaking.', 'yellow');
    } else {
      log('✅ No heavy packages detected', 'green');
    }

    // Check bundle analyzer
    if (dependencies['webpack-bundle-analyzer'] || dependencies['vite-bundle-analyzer']) {
      log('✅ Bundle analyzer available', 'green');
    } else {
      log('⚠️  Consider adding bundle analyzer for detailed analysis', 'yellow');
    }

    return foundHeavy.length === 0;
  } catch (error) {
    log(`❌ Error analyzing dependencies: ${error.message}`, 'red');
    return false;
  }
}

function generateReport(results) {
  log('\n📄 Performance Report', 'bold');
  log('='.repeat(50), 'blue');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`\nOverall Score: ${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('🎉 All performance checks passed!', 'green');
  } else {
    log('⚠️  Some performance issues detected. Review the recommendations above.', 'yellow');
  }
  
  // Generate recommendations
  log('\n💡 Recommendations:', 'bold');
  if (!results.bundleSize) {
    log('  - Optimize bundle size with code splitting and tree shaking', 'blue');
    log('  - Consider lazy loading for non-critical components', 'blue');
    log('  - Review and remove unused dependencies', 'blue');
  }
  
  if (!results.lighthouse) {
    log('  - Optimize images and use proper formats', 'blue');
    log('  - Implement service worker for caching', 'blue');
    log('  - Minimize render-blocking resources', 'blue');
  }
  
  if (!results.dependencies) {
    log('  - Replace heavy packages with lighter alternatives', 'blue');
    log('  - Enable tree shaking for large libraries', 'blue');
  }
}

function main() {
  log('🚀 Performance Analysis Starting...', 'bold');
  
  // Check if development server is running
  try {
    execSync('curl -s http://localhost:5173 > /dev/null', { stdio: 'ignore' });
  } catch {
    log('❌ Development server not running. Start with: npm run dev', 'red');
    process.exit(1);
  }

  const results = {
    bundleSize: analyzeBundleSize(),
    lighthouse: analyzeLighthouse(),
    dependencies: analyzeDependencies()
  };

  generateReport(results);
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSize,
  analyzeLighthouse,
  analyzeDependencies,
  generateReport
};