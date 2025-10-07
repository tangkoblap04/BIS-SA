import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function VideoPlayer({ videoUrl, onComplete }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, [videoRef.current]);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(progress);
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
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
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-white">
          <button
            onClick={handlePlayPause}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            {isPlaying ? 'หยุด' : 'เล่น'}
          </button>
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