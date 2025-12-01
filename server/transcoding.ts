import { MediaConvertClient, CreateJobCommand, DescribeEndpointsCommand } from "@aws-sdk/client-mediaconvert";

export interface TranscodingConfig {
  enabled: boolean;
  region: string;
  roleArn: string; // IAM role for MediaConvert
  outputBucket: string;
  outputPrefix: string;
}

let mediaConvertClient: MediaConvertClient | null = null;
let transcodingConfig: TranscodingConfig | null = null;

export function initializeTranscoding(config: TranscodingConfig): MediaConvertClient {
  transcodingConfig = config;
  mediaConvertClient = new MediaConvertClient({ region: config.region });
  console.log("[transcoding] AWS MediaConvert initialized");
  return mediaConvertClient;
}

export function getTranscodingClient(): MediaConvertClient {
  if (!mediaConvertClient) {
    throw new Error("Transcoding not initialized. Call initializeTranscoding first.");
  }
  return mediaConvertClient;
}

// Start transcoding job for a video
export async function startTranscodingJob(
  videoKey: string,
  videoTitle: string,
  inputBucket: string
): Promise<string> {
  if (!transcodingConfig?.enabled) {
    console.warn("[transcoding] Transcoding disabled");
    return "";
  }

  const client = getTranscodingClient();
  const config = transcodingConfig;

  const jobSettings = {
    Inputs: [
      {
        FileInput: `s3://${inputBucket}/${videoKey}`,
      },
    ],
    OutputGroups: [
      {
        Name: "File Group",
        OutputGroupSettings: {
          Type: "HLS_GROUP_SETTINGS",
          HlsGroupSettings: {
            SegmentLength: 10,
            MinSegmentLength: 0,
            Destination: `s3://${config.outputBucket}/${config.outputPrefix}/${videoTitle}/`,
            DestinationSettings: {
              S3ScriptForegroundSettings: {},
            },
          },
        },
        Outputs: [
          // 4K output
          {
            NameModifier: "_hd4k",
            VideoDescription: {
              Width: 3840,
              Height: 2160,
              CodecSettings: {
                Codec: "H_264",
                H264Settings: {
                  Bitrate: 20000,
                  RateControlMode: "VBR",
                  MaxBitrate: 25000,
                },
              },
            },
          },
          // 1080p output
          {
            NameModifier: "_hd1080",
            VideoDescription: {
              Width: 1920,
              Height: 1080,
              CodecSettings: {
                Codec: "H_264",
                H264Settings: {
                  Bitrate: 8000,
                  RateControlMode: "VBR",
                  MaxBitrate: 10000,
                },
              },
            },
          },
          // 720p output
          {
            NameModifier: "_hd720",
            VideoDescription: {
              Width: 1280,
              Height: 720,
              CodecSettings: {
                Codec: "H_264",
                H264Settings: {
                  Bitrate: 4000,
                  RateControlMode: "VBR",
                  MaxBitrate: 5000,
                },
              },
            },
          },
          // 480p output
          {
            NameModifier: "_sd480",
            VideoDescription: {
              Width: 854,
              Height: 480,
              CodecSettings: {
                Codec: "H_264",
                H264Settings: {
                  Bitrate: 2000,
                  RateControlMode: "VBR",
                  MaxBitrate: 3000,
                },
              },
            },
          },
        ],
      },
    ],
  };

  try {
    const response = await client.send(
      new CreateJobCommand({
        Role: config.roleArn,
        Settings: jobSettings as any,
      })
    );

    const jobId = response.Job?.Id || "";
    console.log(`[transcoding] Started job ${jobId} for ${videoTitle}`);
    return jobId;
  } catch (error) {
    console.error("[transcoding] Failed to start job:", error);
    throw error;
  }
}

// Check transcoding job status
export async function getJobStatus(jobId: string): Promise<string> {
  // In production, use DescribeJobCommand to check status
  // For now, return mock status
  return "SUBMITTED";
}
