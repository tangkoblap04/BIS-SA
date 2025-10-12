import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

function VideoPlayer({ videoUrl, onComplete }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);


  // แปลง YouTube URL เป็น embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;

    // ตรวจสอบว่าเป็น YouTube URL หรือไม่
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(youtubeRegex);

    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1&origin=${window.location.origin}`;
    }

    // หากไม่ใช่ YouTube ให้ใช้ URL เดิม
    return url;
  };

  const isYouTubeUrl = (url) => {
    return url && url.includes('youtube.com');
  };



  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsCompleted(true);
    setIsPlaying(false);
    onComplete();
  };



  const handlePlayPause = () => {
    if (videoRef.current && videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Play interrupted:', error);
          setIsPlaying(false);
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {isYouTubeUrl(videoUrl) ? (
        <div className="w-full h-full">
          <iframe
            src={embedUrl}
            title="Course Video"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {/* ปุ่มควบคุมสำหรับ YouTube video */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={handleVideoEnd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              ข้ามวิดีโอ
            </button>
            <button
              onClick={handleVideoEnd}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              เสร็จสิ้นแล้ว
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          onEnded={handleVideoEnd}
          onTimeUpdate={handleTimeUpdate}
          controls
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
          <div
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex space-x-2">
            <button
              onClick={handlePlayPause}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition"
            >
              {isPlaying ? 'หยุด' : 'เล่น'}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleVideoEnd}
              className="bg-blue-600/80 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
            >
              ข้ามวิดีโอ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default VideoPlayer;