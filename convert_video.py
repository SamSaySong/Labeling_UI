#!/usr/bin/env python3
"""
Convert video to H.264 codec for cross-browser compatibility
Requires: ffmpeg to be installed
"""

import os
import subprocess
import sys

def convert_video_to_h264(input_file, output_file=None):
    """Convert video to H.264 codec"""
    
    if not os.path.exists(input_file):
        print(f"Error: File not found: {input_file}")
        return False
    
    if output_file is None:
        name, ext = os.path.splitext(input_file)
        output_file = f"{name}_converted.mp4"
    
    print(f"Converting: {input_file}")
    print(f"Output: {output_file}")
    
    try:
        # Use ffmpeg to convert to H.264
        cmd = [
            'ffmpeg',
            '-i', input_file,
            '-c:v', 'libx264',           # Video codec: H.264
            '-preset', 'medium',          # Speed: fast, medium, slow
            '-c:a', 'aac',               # Audio codec: AAC
            '-b:a', '128k',              # Audio bitrate
            output_file
        ]
        
        result = subprocess.run(cmd, check=False)
        
        if result.returncode == 0:
            print(f"\n✓ Conversion successful!")
            print(f"New file: {output_file}")
            return True
        else:
            print(f"\n✗ Conversion failed!")
            print("Make sure ffmpeg is installed: https://ffmpeg.org/download.html")
            return False
            
    except FileNotFoundError:
        print("Error: ffmpeg not found!")
        print("Install ffmpeg from: https://ffmpeg.org/download.html")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_video.py <input_file> [output_file]")
        print("Example: python convert_video.py video.mp4 video_h264.mp4")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    convert_video_to_h264(input_file, output_file)
