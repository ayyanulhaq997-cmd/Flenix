// Video Streaming Service with HLS/DASH support
// Handles adaptive bitrate streaming for multiple quality levels

export interface StreamQuality {
  name: string;
  bitrate: number; // kbps
  resolution: string; // e.g., "1920x1080"
  bandwidth: number; // bps for DASH
}

// Standard streaming quality levels
export const STREAMING_QUALITIES: Record<string, StreamQuality> = {
  hd4k: {
    name: "4K (2160p)",
    bitrate: 20000,
    resolution: "3840x2160",
    bandwidth: 20000000,
  },
  hd1080: {
    name: "1080p",
    bitrate: 8000,
    resolution: "1920x1080",
    bandwidth: 8000000,
  },
  hd720: {
    name: "720p",
    bitrate: 4000,
    resolution: "1280x720",
    bandwidth: 4000000,
  },
  sd480: {
    name: "480p",
    bitrate: 2000,
    resolution: "854x480",
    bandwidth: 2000000,
  },
  sd360: {
    name: "360p",
    bitrate: 1000,
    resolution: "640x360",
    bandwidth: 1000000,
  },
  sd240: {
    name: "240p",
    bitrate: 500,
    resolution: "426x240",
    bandwidth: 500000,
  },
};

// Generate HLS playlist (HTTP Live Streaming)
export function generateHLSPlaylist(
  videoKey: string,
  qualities: string[] = ["hd1080", "hd720", "sd480"],
  cdnUrl: string
): string {
  let playlist = "#EXTM3U\n";
  playlist += "#EXT-X-VERSION:3\n";
  playlist += "#EXT-X-TARGETDURATION:10\n";

  // Add variant streams for adaptive bitrate
  qualities.forEach((quality) => {
    const q = STREAMING_QUALITIES[quality];
    if (q) {
      const baseKey = videoKey.replace(/\.[^/.]+$/, ""); // Remove extension
      const segmentUrl = `${cdnUrl}/${baseKey}/${quality}/playlist.m3u8`;

      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${q.bandwidth},RESOLUTION=${q.resolution}\n`;
      playlist += `${segmentUrl}\n`;
    }
  });

  return playlist;
}

// Generate DASH manifest (MPEG-DASH)
export function generateDASHManifest(
  videoKey: string,
  qualities: string[] = ["hd1080", "hd720", "sd480"],
  cdnUrl: string,
  videoDurationSeconds: number
): string {
  const baseKey = videoKey.replace(/\.[^/.]+$/, "");

  let manifest = '<?xml version="1.0" encoding="UTF-8"?>\n';
  manifest += '<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="static" ';
  manifest += `mediaPresentationDuration="PT${videoDurationSeconds}S">\n`;
  manifest += '<Period>\n';
  manifest += '<AdaptationSet mimeType="video/mp4">\n';

  qualities.forEach((quality) => {
    const q = STREAMING_QUALITIES[quality];
    if (q) {
      const segmentUrl = `${cdnUrl}/${baseKey}/${quality}/segments.mp4`;

      manifest += '<Representation id="' + quality + '" ';
      manifest += `bandwidth="${q.bandwidth}" `;
      manifest += `width="${q.resolution.split("x")[0]}" `;
      manifest += `height="${q.resolution.split("x")[1]}">\n`;
      manifest += '<BaseURL>' + segmentUrl + '</BaseURL>\n';
      manifest += '</Representation>\n';
    }
  });

  manifest += '</AdaptationSet>\n';
  manifest += '</Period>\n';
  manifest += '</MPD>';

  return manifest;
}

// Streaming URL configuration for apps
export interface StreamingUrlConfig {
  type: "hls" | "dash"; // HLS for HTTP Live Streaming, DASH for MPEG-DASH
  playlistUrl: string; // URL to HLS playlist or DASH manifest
  cdnUrl: string; // Base CDN URL for segments
  qualities: string[]; // Available quality levels
  subtitles?: {
    language: string;
    url: string;
  }[];
  poster?: string; // Thumbnail for preview
  duration: number; // In seconds
}

export function buildStreamingUrl(
  videoKey: string,
  cdnUrl: string,
  format: "hls" | "dash" = "hls",
  qualities: string[] = ["hd1080", "hd720", "sd480"],
  durationSeconds: number = 0,
  poster?: string
): StreamingUrlConfig {
  const baseKey = videoKey.replace(/\.[^/.]+$/, "");

  return {
    type: format,
    playlistUrl:
      format === "hls" ? `${cdnUrl}/${baseKey}/playlist.m3u8` : `${cdnUrl}/${baseKey}/manifest.mpd`,
    cdnUrl: `${cdnUrl}/${baseKey}`,
    qualities,
    poster,
    duration: durationSeconds,
  };
}

// Check if a video has been transcoded (quality versions exist)
export async function checkTranscodingStatus(
  videoKey: string,
  qualities: string[]
): Promise<Record<string, boolean>> {
  // In production, this would check if transcoded files exist in cloud storage
  // For now, return placeholder status
  const status: Record<string, boolean> = {};

  qualities.forEach((q) => {
    status[q] = false; // TODO: Check actual existence in S3/cloud storage
  });

  return status;
}
