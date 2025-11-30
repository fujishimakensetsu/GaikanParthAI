export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface EnhancementResult {
  imageUrl: string;
  timestamp: number;
}

export interface ApiError {
  message: string;
  details?: string;
}