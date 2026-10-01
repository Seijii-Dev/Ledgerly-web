export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface ApkRelease {
  isPublished: boolean;
  version: string;
  fileName: string;
  downloadUrl: string;
  fileSize: string;
  sha256Hash: string;
  updatedAt: string;
  isCustomUpload: boolean;
}
