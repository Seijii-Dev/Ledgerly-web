/**
 * Utility functions for validating and inspecting Android APK files
 */

// Android APK files are ZIP archives. All ZIP archives start with the 4-byte signature:
// Hex: 50 4B 03 04 ("PK\x03\x04")
const ZIP_MAGIC_HEADER = [0x50, 0x4b, 0x03, 0x04];

export interface ApkValidationResult {
  valid: boolean;
  error?: string;
  sha256?: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  suggestedVersion?: string;
  suggestedFileName: string;
}

/**
 * Validates whether an uploaded File is a legitimate Android APK.
 * Performs filename extension check, non-empty check, and binary ZIP header verification.
 */
export async function validateApkFile(file: File): Promise<ApkValidationResult> {
  const fileName = file.name.trim();

  // 1. File name extension check
  if (!fileName.toLowerCase().endsWith(".apk")) {
    return {
      valid: false,
      error: `Invalid file format: "${fileName}". The file must have a .apk extension.`,
      fileSizeBytes: file.size,
      fileSizeFormatted: formatBytes(file.size),
      suggestedFileName: fileName,
    };
  }

  // 2. File size non-zero check
  if (file.size <= 0) {
    return {
      valid: false,
      error: "The selected file is empty (0 bytes). Please select a valid APK.",
      fileSizeBytes: 0,
      fileSizeFormatted: "0 B",
      suggestedFileName: fileName,
    };
  }

  // 3. Binary magic bytes header check
  try {
    const headerBuffer = await file.slice(0, 4).arrayBuffer();
    const headerBytes = new Uint8Array(headerBuffer);

    if (headerBytes.length < 4) {
      return {
        valid: false,
        error: "File is too small to be a valid Android APK.",
        fileSizeBytes: file.size,
        fileSizeFormatted: formatBytes(file.size),
        suggestedFileName: fileName,
      };
    }

    const isZip = ZIP_MAGIC_HEADER.every((byte, idx) => headerBytes[idx] === byte);
    if (!isZip) {
      return {
        valid: false,
        error: "Invalid APK package. The file header does not match a valid Android application archive.",
        fileSizeBytes: file.size,
        fileSizeFormatted: formatBytes(file.size),
        suggestedFileName: fileName,
      };
    }
  } catch (err) {
    console.error("Error reading file header:", err);
    return {
      valid: false,
      error: "Failed to read file content for validation.",
      fileSizeBytes: file.size,
      fileSizeFormatted: formatBytes(file.size),
      suggestedFileName: fileName,
    };
  }

  // 4. Compute real SHA-256 hash
  let sha256 = "";
  try {
    const fullBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", fullBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.warn("Could not compute SHA-256 checksum:", err);
  }

  // 5. Detect version tag from file name (e.g. ledgerly-v1.0.2.apk or app-1.2.apk)
  const detectedVersion = extractVersionFromFileName(fileName) || "1.0.0";
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  return {
    valid: true,
    sha256,
    fileSizeBytes: file.size,
    fileSizeFormatted: formatBytes(file.size),
    suggestedVersion: detectedVersion,
    suggestedFileName: sanitizedFileName,
  };
}

/**
 * Extracts version string from a filename like "ledgerly-v1.0.4.apk" -> "1.0.4"
 */
export function extractVersionFromFileName(fileName: string): string | null {
  const match = fileName.match(/[vV]?(\d+\.\d+(?:\.\d+)?)/);
  return match ? match[1] : null;
}

/**
 * Formats byte size into human readable string (e.g. "38.4 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formats ISO date string into human friendly date and time
 */
export function formatReleaseDate(isoDate: string): string {
  if (!isoDate) return "Unknown";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}
