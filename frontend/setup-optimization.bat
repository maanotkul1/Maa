@echo off
REM Setup script untuk optimasi web performance (Windows)

echo.
echo ============================================
echo 🚀 Web Performance Optimization Setup
echo ============================================
echo.

REM Check if in frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

echo 1️⃣  Installing dependencies...
call npm install

echo.
echo 2️⃣  Building optimized production bundle...
call npm run build

echo.
echo 3️⃣  Build Summary:
echo ✅ Lazy loading: Enabled for all routes except Login ^& Dashboard
echo ✅ Code splitting: react-vendor, charts, utils chunks
echo ✅ Console removal: All console.log removed in production
echo ✅ Minification: Terser with compression enabled
echo ✅ Sourcemap: Disabled for smaller bundle
echo.

echo 4️⃣  Preview production build:
echo     Run: npm run preview
echo.

echo 5️⃣  Performance Tips:
echo     - Use Chrome DevTools ^> Lighthouse for performance audit
echo     - Check Network tab to verify chunk caching
echo     - Monitor bundle size with 'npm run build' output
echo.

echo ✨ Setup complete! Your web is now optimized.
echo.
pause
