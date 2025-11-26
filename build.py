#!/usr/bin/env python3
"""
Simple build script to compile TypeScript/JSX to JavaScript
"""

import subprocess
import sys

# Try to use npx (bundled with Node.js) to run esbuild
try:
    print("Building project...")
    result = subprocess.run([
        sys.executable, '-m', 'pip', 'install', 'esbuild'
    ], check=False, capture_output=True)
    
    print("esbuild installed, attempting to build with esbuild...")
    subprocess.run([
        'esbuild', 
        'index.tsx',
        '--bundle',
        '--outfile=dist/index.js',
        '--loader:.tsx=tsx',
        '--loader:.ts=ts',
        '--format=esm'
    ], check=True)
    
    print("✓ Build complete! Generated dist/index.js")
except Exception as e:
    print(f"Build failed: {e}")
    print("\nFallback: Using Vite is recommended. Install Node.js from https://nodejs.org/")
    sys.exit(1)
