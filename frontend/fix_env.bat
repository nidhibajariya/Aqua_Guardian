@echo off
echo ============================================================
echo AQUA GUARDIAN - Environment Configuration Fix
echo ============================================================
echo.
echo Your frontend .env file needs to be updated with the correct values.
echo.
echo Please open the file:
echo   c:\Users\Urvashi\OneDrive\Desktop\AQUA_guardian_project\frontend\.env
echo.
echo And replace ALL contents with EXACTLY these lines:
echo.
echo # Frontend Environment Variables - Development Mode
echo # API Backend URL
echo VITE_API_URL=http://localhost:8000
echo.
echo # Supabase Direct Access (for authentication)
echo VITE_SUPABASE_URL=https://hsoooexgsnxsvyfnwuef.supabase.co
echo VITE_SUPABASE_ANON_KEY=YOUR_COMPLETE_ANON_KEY_HERE
echo.
echo ============================================================
echo IMPORTANT: Replace YOUR_COMPLETE_ANON_KEY_HERE with your
echo complete Supabase anon key from:
echo   Supabase Dashboard ^> Settings ^> API ^> Project API keys ^> anon public
echo.
echo The key should start with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
echo ============================================================
echo.
echo After updating the .env file:
echo 1. Save the file
echo 2. Stop the dev server (Ctrl+C in the terminal)
echo 3. Restart with: npm run dev
echo.
pause
