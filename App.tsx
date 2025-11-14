import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Label } from './types';
import { UploadIcon, TrashIcon, CopyIcon, CheckIcon, PencilIcon } from './components/icons';

// Point and Rectangle interfaces are for internal drawing state
interface Point {
  x: number;
  y: number;
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

const App: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isLabelingMode, setIsLabelingMode] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFileName(file.name);
      // Reset state for new video
      setLabels([]);
      setIsLabelingMode(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
      resizeCanvas(); // Ensure canvas is resized on metadata load
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.videoWidth === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isLabelingMode) return;

    const scaleX = canvas.width / 1920;
    const scaleY = canvas.height / 1080;

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    labels.forEach(label => {
        const { xmin, ymin, xmax, ymax } = label.box;
        ctx.strokeRect(
            xmin * scaleX,
            ymin * scaleY,
            (xmax - xmin) * scaleX,
            (ymax - ymin) * scaleY
        );
    });

    if (isDrawing && currentRect) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.strokeRect(
            currentRect.x,
            currentRect.y,
            currentRect.width,
            currentRect.height
        );
    }
  }, [labels, isDrawing, currentRect, isLabelingMode]);

  const resizeCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = video?.parentElement;
    if (video && canvas && container && video.videoWidth > 0) {
      const { clientWidth } = container;
      const aspectRatio = video.videoHeight / video.videoWidth;
      canvas.width = clientWidth;
      canvas.height = clientWidth * aspectRatio;
      draw();
    }
  }, [draw]);

  useEffect(() => {
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);
  
  useEffect(() => {
    draw();
  }, [labels, isDrawing, currentRect, draw]);


  const getScaledPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isLabelingMode || !videoRef.current || videoRef.current.paused === false) {
        return;
    }
    setIsDrawing(true);
    const point = getScaledPoint(e);
    setStartPoint(point);
    setCurrentRect(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const currentPoint = getScaledPoint(e);
    const rect = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(startPoint.x - currentPoint.x),
      height: Math.abs(startPoint.y - currentPoint.y),
    };
    setCurrentRect(rect);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentRect || !videoRef.current || !canvasRef.current) return;
    setIsDrawing(false);
    
    if (currentRect.width < 5 || currentRect.height < 5) {
        setStartPoint(null);
        setCurrentRect(null);
        return;
    }

    const { width: canvasWidth, height: canvasHeight } = canvasRef.current;
    const targetWidth = 1920;
    const targetHeight = 1080;

    const scaleX = targetWidth / canvasWidth;
    const scaleY = targetHeight / canvasHeight;

    const newLabel: Label = {
      id: new Date().toISOString(),
      timestamp: videoRef.current.currentTime,
      box: {
        xmin: Math.round(currentRect.x * scaleX),
        ymin: Math.round(currentRect.y * scaleY),
        xmax: Math.round((currentRect.x + currentRect.width) * scaleX),
        ymax: Math.round((currentRect.y + currentRect.height) * scaleY),
      },
    };

    setLabels(prev => [...prev, newLabel]);
    setStartPoint(null);
    setCurrentRect(null);
  };
  
  const handleDeleteLabel = (id: string) => {
    setLabels(prev => prev.filter(label => label.id !== id));
  };

  const handleToggleLabelingMode = () => {
    setIsLabelingMode(prev => {
        const newMode = !prev;
        if (newMode && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
        return newMode;
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '00:00';
    const roundedTime = Math.floor(time);
    const minutes = Math.floor(roundedTime / 60);
    const seconds = roundedTime % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const generatedJson = JSON.stringify(
    labels.map(l => ({
      eventStart: formatTime(l.timestamp),
      eventEnd: formatTime(l.timestamp),
      area: [l.box.xmin, l.box.ymin, l.box.xmax, l.box.ymax],
    })),
    null,
    2
  );

  const handleCopyJson = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedJson);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = generatedJson;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show error message
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-3 sm:p-4 lg:p-6">
      <div className="w-full mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400">Video Bounding Box Labeling Tool</h1>
          <p className="mt-2 text-gray-400">Import a video, use the controls to activate labeling, and draw boxes. The tool will generate timestamped coordinates scaled to 1920x1080.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-11 gap-3">
          <div className="lg:col-span-8 bg-gray-800 rounded-lg p-4 shadow-2xl flex flex-col">
            {!videoSrc ? (
              <div className="w-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg flex-grow">
                <h2 className="text-base font-semibold mb-4 text-gray-300">Import Your Video</h2>
                 <label className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300 flex items-center text-sm">
                    <UploadIcon />
                    <span>Choose File</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3 flex-shrink-0 gap-2">
                    <button
                        onClick={handleToggleLabelingMode}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                            isLabelingMode
                                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                        aria-pressed={isLabelingMode}
                    >
                        <PencilIcon />
                        <span className="hidden sm:inline">{isLabelingMode ? 'Label' : 'Label'}</span>
                    </button>
                    <label className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded-lg cursor-pointer transition-colors duration-300 flex items-center text-xs">
                        <UploadIcon />
                        <span className="ml-1 hidden sm:inline">New</span>
                        <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                <div className="relative w-full aspect-video bg-black rounded-md">
                    <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="w-full h-full rounded-md"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => isLabelingMode && setIsLabelingMode(false)}
                    />
                    <canvas
                    ref={canvasRef}
                    className={`absolute top-0 left-0 w-full h-full ${isLabelingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    />
                    <div className="absolute bottom-16 sm:bottom-12 right-2 pointer-events-none">
                        <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-mono">
                            {formatTime(currentTime)}
                        </div>
                    </div>
                </div>
                <div className="mt-3 text-center flex-shrink-0">
                    <p className="text-sm text-gray-400 truncate" title={videoFileName}>
                        <strong>Now playing:</strong> {videoFileName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLabelingMode ? "Seek to a frame and draw a box." : "Activate the label tool to start drawing."}
                    </p>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-3 bg-gray-800 rounded-lg p-4 shadow-2xl flex flex-col">
            <h2 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-cyan-400">Generated Labels</h2>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              {labels.length === 0 ? (
                <p className="text-gray-500">No labels created yet.</p>
              ) : (
                labels.slice().reverse().map((label) => {
                    const box = label.box;
                    const w = box.xmax - box.xmin;
                    const h = box.ymax - box.ymin;

                    return (
                        <div key={label.id} className="bg-gray-700 p-2 rounded-lg text-xs group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-cyan-300">Time: <span className="font-mono text-white">{formatTime(label.timestamp)}</span></p>
                                    <p className="font-mono text-gray-300 mt-1">
                                        <span className="font-sans font-semibold text-gray-400">xywh:</span> {box.xmin}, {box.ymin}, {w}, {h}
                                    </p>
                                    <p className="font-mono text-gray-300">
                                        <span className="font-sans font-semibold text-gray-400">minmax:</span> {box.xmin}, {box.ymin}, {box.xmax}, {box.ymax}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteLabel(label.id)}
                                    className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Delete label"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    );
                })
              )}
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-cyan-400">JSON Output (1920x1080)</h3>
                    <button 
                        onClick={handleCopyJson}
                        className="flex items-center text-sm bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={labels.length === 0}
                        type="button"
                    >
                       {isCopied ? <CheckIcon/> : <CopyIcon />}
                       <span className="ml-2">{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
              <pre className="bg-gray-900 rounded-md p-4 text-xs text-green-300 overflow-auto max-h-48 font-mono">
                <code>{generatedJson}</code>
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
