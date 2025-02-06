import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Stack,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  ClosedCaption as SubtitlesIcon,
  BrandingWatermark as QualityIcon,
} from '@mui/icons-material';
import Hls from 'hls.js';

const VideoPlayer = ({
  src,
  poster,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  startTime = 0,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported() && src) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const qualities = hls.levels.map((level) => ({
          height: level.height,
          bitrate: level.bitrate,
        }));
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((error) => console.error('Autoplay failed:', error));
        }
        if (startTime > 0) {
          video.currentTime = startTime;
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((error) => console.error('Autoplay failed:', error));
        }
        if (startTime > 0) {
          video.currentTime = startTime;
        }
      });

      return () => {
        video.removeEventListener('loadedmetadata', () => {});
      };
    }
  }, [src, autoPlay, startTime]);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (_, value) => {
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (_, value) => {
    videoRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleMuteToggle = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const handleQualityChange = (index) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setQuality(index === -1 ? 'auto' : `${hlsRef.current.levels[index].height}p`);
      setShowSettings(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: 'black',
        '&:hover': {
          '& .controls': {
            opacity: 1,
          },
        },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={poster}
        style={{ width: '100%', height: '100%' }}
        onClick={handlePlayPause}
      />

      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Paper
        className="controls"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 1,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <Stack spacing={1}>
          <Slider
            value={currentTime}
            max={duration}
            onChange={handleTimeChange}
            sx={{ color: 'primary.main' }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePlayPause} size="small" sx={{ color: 'white' }}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>

            <Box sx={{ width: 100, mr: 2 }}>
              <Slider
                value={volume}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                sx={{ color: 'white' }}
              />
            </Box>

            <IconButton
              onClick={handleMuteToggle}
              size="small"
              sx={{ color: 'white' }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>

            <Typography sx={{ color: 'white', flex: 1 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              size="small"
              sx={{ color: 'white' }}
            >
              <SettingsIcon />
            </IconButton>

            <IconButton
              onClick={handleFullscreenToggle}
              size="small"
              sx={{ color: 'white' }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Stack>
        </Stack>

        {showSettings && (
          <Paper
            sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              width: 200,
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
            }}
          >
            <Stack>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2">Playback Speed</Typography>
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <Box
                    key={speed}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => handleSpeedChange(speed)}
                  >
                    <SpeedIcon sx={{ mr: 1 }} />
                    <Typography>{speed}x</Typography>
                    {playbackSpeed === speed && (
                      <Typography sx={{ ml: 'auto' }}>✓</Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {hlsRef.current?.levels?.length > 0 && (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2">Quality</Typography>
                  <Box
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={() => handleQualityChange(-1)}
                  >
                    <QualityIcon sx={{ mr: 1 }} />
                    <Typography>Auto</Typography>
                    {quality === 'auto' && (
                      <Typography sx={{ ml: 'auto' }}>✓</Typography>
                    )}
                  </Box>
                  {hlsRef.current.levels.map((level, index) => (
                    <Box
                      key={level.height}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => handleQualityChange(index)}
                    >
                      <QualityIcon sx={{ mr: 1 }} />
                      <Typography>{level.height}p</Typography>
                      {quality === `${level.height}p` && (
                        <Typography sx={{ ml: 'auto' }}>✓</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default VideoPlayer;
