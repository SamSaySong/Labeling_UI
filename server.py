#!/usr/bin/env python3
"""
Custom HTTP Server with proper MIME types for development
Supports .tsx, .ts, .jsx, .js, .json and other web assets
"""

import http.server
import socketserver
import mimetypes
from pathlib import Path

# Register additional MIME types
mimetypes.add_type('text/typescript', '.ts')
mimetypes.add_type('text/typescript', '.tsx')
mimetypes.add_type('text/javascript', '.jsx')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('text/html', '.html')

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cross-Origin-Resource-Policy', 'cross-origin')
        super().end_headers()

    def guess_type(self, path):
        mimetype = mimetypes.guess_type(path)[0]
        if mimetype is None:
            if path.endswith('.ts'):
                mimetype = 'text/typescript'
            elif path.endswith('.tsx'):
                mimetype = 'text/typescript'
            elif path.endswith('.jsx'):
                mimetype = 'text/javascript'
            elif path.endswith('.js'):
                mimetype = 'application/javascript'
        return mimetype

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving files from: {Path.cwd()}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
