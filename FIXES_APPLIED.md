# Video Loading Issue Fixes - Summary

## Vấn đề đã phát hiện

Khi upload video trên Chrome hoặc Microsoft Edge, video không load được. Nguyên nhân chính:

1. **Canvas không được vẽ lại khi video metadata load** - Timing issue
2. **Sự kiện `onLoadStart` không được xử lý** - Video element cần thêm event listeners
3. **CORS headers thiếu** - Vite server không gửi headers cần thiết cho video streaming
4. **Browser compatibility issues** - Cần thêm `crossOrigin` attribute

---

## Các sửa chữa đã áp dụng

### 1. **App.tsx - Video Event Handling**

#### Sửa đổi: `handleLoadedMetadata` function
```tsx
// TRƯỚC:
const handleLoadedMetadata = () => {
  if (videoRef.current) {
    setVideoDimensions({...});
    resizeCanvas(); // Gọi ngay - timing quá nhanh
  }
};

// SAU:
const handleLoadedMetadata = () => {
  if (videoRef.current) {
    setVideoDimensions({...});
    // Delay canvas resize để ensure video dimensions được set đúng
    setTimeout(() => resizeCanvas(), 100);
  }
};
```

**Lý do**: Browser cần thời gian để thực sự load video metadata. Gọi ngay có thể dẫn đến canvas chưa có kích thước đúng.

---

#### Sửa đổi: `resizeCanvas` function
```tsx
// TRƯỚC:
const resizeCanvas = useCallback(() => {
  if (video && canvas && container && video.videoWidth > 0) {
    // ...
    draw();
  }
}, [draw]);

// SAU:
const resizeCanvas = useCallback(() => {
  if (video && canvas && container && video.videoWidth > 0 && video.videoHeight > 0) {
    // ...
    // Force redraw after canvas size change
    setTimeout(() => draw(), 50);
  }
}, [draw]);
```

**Lý do**: 
- Thêm check `video.videoHeight > 0` để ensure video dimensions hoàn toàn loaded
- Sử dụng `setTimeout` để force redraw sau khi canvas resize

---

#### Sửa đổi: Thêm Video Error Handler
```tsx
const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
  const video = e.currentTarget;
  console.error('Video error:', {
    error: video.error,
    errorCode: video.error?.code,
    errorMessage: video.error?.message,
    src: video.src,
  });
};
```

**Lý do**: Để log lỗi video chi tiết, giúp debug vấn đề trên different browsers.

---

#### Sửa đổi: Thêm handler vào Video Element
```tsx
<video
  ref={videoRef}
  src={videoSrc}
  controls
  className="w-full h-full rounded-md"
  onLoadedMetadata={handleLoadedMetadata}
  onTimeUpdate={handleTimeUpdate}
  onPlay={() => isLabelingMode && setIsLabelingMode(false)}
  onLoadStart={(e) => {
    console.log('Video loading started', e);
  }}
  onError={handleVideoError}  // ← Thêm error handler
  crossOrigin="anonymous"      // ← Thêm cho CORS support
/>
```

**Lý do**: 
- `onError`: Bắt lỗi video loading
- `crossOrigin="anonymous"`: Cho phép Chrome/Edge load video từ local files

---

### 2. **vite.config.ts - Server Configuration**

#### Sửa đổi: Thêm CORS headers
```ts
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Accept-Ranges': 'bytes',                          // Support video seeking
      'Cross-Origin-Resource-Policy': 'cross-origin',    // CORS policy
    },
  },
  // ... rest of config
});
```

**Lý do**: 
- `Accept-Ranges`: Cho phép browser seek trong video files
- `Cross-Origin-Resource-Policy`: Giải quyết CORS issues trên Chrome/Edge

---

### 3. **index.html - Metadata**

#### Sửa đổi: Thêm meta tags
```html
<meta name="description" content="Video Bounding Box Labeling Tool" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
```

**Lý do**: Cải thiện browser compatibility, đặc biệt trên Edge

---

## Cách Kiểm Tra Fixes

### 1. **Restart Dev Server**
```bash
# Terminal
npm install
npm run dev
```

### 2. **Test trên Chrome**
- Mở `http://localhost:3000`
- Click "Choose File"
- Upload một video file (.mp4, .webm, .ogg)
- Video sẽ hiển thị và playback bình thường

### 3. **Test trên Microsoft Edge**
- Mở Edge browser
- Truy cập `http://localhost:3000`
- Repeat upload test

### 4. **Kiểm tra Browser Console**
- Mở DevTools (F12)
- Tìm logs:
  - `"Video loading started"` - Video bắt đầu load
  - `"Video error"` object nếu có lỗi

---

## Nếu Vẫn Có Vấn Đề

### Triệu chứng: Video không hiển thị
**Giải pháp**: 
1. Check browser console cho error messages
2. Đảm bảo video format được support (MP4 is most compatible)
3. Thử test với video file khác

### Triệu chứng: Video lag hoặc stutter
**Giải pháp**:
1. Thử video có độ phân giải thấp hơn
2. Check canvas size qua DevTools Elements inspector
3. Thử trên browser khác để confirm

### Triệu chứng: Canvas không vẽ lại khi play
**Giải pháp**:
1. Kiểm tra `onPlay` event - nó sẽ tắt labeling mode
2. Pause video rồi click Label button để vẽ lại

---

## Files Đã Modify

1. ✅ `App.tsx` - Video event handling và error management
2. ✅ `vite.config.ts` - CORS headers configuration  
3. ✅ `index.html` - Meta tags cho browser compatibility

---

## Kỹ Thuật Được Áp Dụng

| Technique | Purpose |
|-----------|---------|
| `setTimeout` delays | Ensure DOM/media ready before operations |
| CORS headers | Enable cross-origin resource loading |
| Error event handling | Catch and debug loading issues |
| `crossOrigin` attribute | Browser compatibility for local files |
| Metadata validation | Confirm video dimensions loaded before resize |

---

**Last Updated**: November 26, 2025
