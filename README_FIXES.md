# Quick Start - Video Loading Fixes

## 🔧 Changes Made

### Vấn đề gốc
Video không load trên Chrome/Edge sau khi upload

### Nguyên nhân
1. Canvas không được vẽ lại đúng timing
2. Thiếu CORS headers
3. Thiếu browser compatibility attributes

### Giải pháp áp dụng ✅

| File | Thay đổi | Lý do |
|------|---------|-------|
| **App.tsx** | Thêm `setTimeout` delays khi load metadata | Đợi video dimensions load xong |
| **App.tsx** | Thêm `onError={handleVideoError}` handler | Catch video loading errors |
| **App.tsx** | Thêm `crossOrigin="anonymous"` | Browser compatibility (Edge/Chrome) |
| **vite.config.ts** | Thêm `Accept-Ranges` header | Support video seeking |
| **vite.config.ts** | Thêm `Cross-Origin-Resource-Policy` | CORS support |
| **index.html** | Thêm meta tags | Browser compatibility |

---

## 🚀 Cách sử dụng

```bash
# 1. Restart server
npm run dev

# 2. Truy cập app
# http://localhost:3000

# 3. Upload video
# - Click "Choose File"
# - Chọn file video (.mp4, .webm)
# - Video sẽ load và play bình thường
```

---

## ✨ Tính năng vẫn hoạt động
- ✅ Video playback
- ✅ Video seeking
- ✅ Drawing bounding boxes
- ✅ JSON export
- ✅ Cross-browser support (Chrome, Edge, Firefox)

---

## 🐛 Nếu vẫn có issue

**Check console logs:**
```
F12 → Console tab
```

**Kiểm tra:**
1. Video format (MP4 recommended)
2. Video file size (< 500MB for local testing)
3. Browser cache (Ctrl+Shift+Del, clear cache)

**Thử lại:**
```bash
# Hard refresh
Ctrl+Shift+R  (Windows)
Cmd+Shift+R   (Mac)
```

---

**Last Updated**: November 26, 2025
