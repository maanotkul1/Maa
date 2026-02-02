#!/bin/bash
# Setup script untuk optimasi web performance

echo "🚀 Web Performance Optimization Setup"
echo "======================================"
echo ""

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

echo "1️⃣  Installing dependencies..."
npm install

echo ""
echo "2️⃣  Building optimized production bundle..."
npm run build

echo ""
echo "3️⃣  Build Summary:"
echo "✅ Lazy loading: Enabled for all routes except Login & Dashboard"
echo "✅ Code splitting: react-vendor, charts, utils chunks"
echo "✅ Console removal: All console.log removed in production"
echo "✅ Minification: Terser with compression enabled"
echo "✅ Sourcemap: Disabled for smaller bundle"
echo ""

echo "4️⃣  Preview production build:"
echo "    Run: npm run preview"
echo ""

echo "5️⃣  Performance Tips:"
echo "    - Use Chrome DevTools > Lighthouse for performance audit"
echo "    - Check Network tab to verify chunk caching"
echo "    - Monitor bundle size with 'npm run build' output"
echo ""

echo "✨ Setup complete! Your web is now optimized."
