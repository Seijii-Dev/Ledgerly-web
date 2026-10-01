import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { ApkRelease } from "../types/auth";
import { saveApkBlob, getApkBlob, deleteApkBlob } from "../utils/apkStorage";
import { validateApkFile } from "../utils/apkValidation";

interface ApkContextType {
  currentApk: ApkRelease | null;
  isLoading: boolean;
  isLocalDraft: boolean;
  isServerConnected: boolean;
  importApkFile: (file: File, versionTag?: string) => Promise<{ success: boolean; hash?: string; message?: string }>;
  updateApkUrl: (url: string, versionTag: string, sizeText: string, customHash?: string) => void;
  syncWithGitHubReleases: () => Promise<{ success: boolean; message: string }>;
  restoreGlobalRelease: () => Promise<void>;
  removeRelease: () => Promise<{ success: boolean; message: string }>;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const APK_STORAGE_KEY = "ledgerly_active_apk";

const ApkContext = createContext<ApkContextType | undefined>(undefined);

function resolveAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  const base = import.meta.env.BASE_URL || "./";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return base.endsWith("/") ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}

const STATIC_REPOSITORY_APK = "downloads/Ledgerly-app-release.apk";

async function detectStaticRepositoryApk(): Promise<ApkRelease | null> {
  try {
    const downloadUrl = resolveAssetUrl(STATIC_REPOSITORY_APK);
    // Netlify's SPA fallback can return index.html with a 200 status for a
    // missing file. Read only the first bytes and require the APK ZIP signature
    // before treating the static path as a real APK.
    const response = await fetch(downloadUrl, {
      headers: { Range: "bytes=0-3" },
      cache: "no-store",
    });
    if (!response.ok || !response.body) return null;
    const reader = response.body.getReader();
    const firstChunk = await reader.read();
    await reader.cancel();
    const bytes = firstChunk.value;
    if (!bytes || bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
      return null;
    }
    const contentRange = response.headers.get("content-range") || "";
    const rangeMatch = contentRange.match(/\/(\d+)$/);
    const fileSizeBytes = Number(rangeMatch?.[1] || response.headers.get("content-length") || 0);
    return {
      isPublished: true,
      version: "1.0.0",
      fileName: "Ledgerly-app-release.apk",
      downloadUrl,
      fileSize: fileSizeBytes > 0 ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : "Available",
      sha256Hash: "",
      updatedAt: "",
      isCustomUpload: false,
    };
  } catch {
    return null;
  }
}

export function ApkProvider({ children }: { children: ReactNode }) {
  const [currentApk, setCurrentApk] = useState<ApkRelease | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalDraft, setIsLocalDraft] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Initialize APK status: Reconcile local upload vs server release so refreshes never revert
  useEffect(() => {
    let isMounted = true;

    async function loadRelease() {
      setIsLoading(true);

      // 1. Read local storage & IndexedDB for user's active upload state
      let localMeta: ApkRelease | null = null;
      let cachedBlob: Blob | null = null;

      try {
        const savedStr = localStorage.getItem(APK_STORAGE_KEY);
        if (savedStr) {
          localMeta = JSON.parse(savedStr);
        }
      } catch (e) {
        console.warn("Could not read localStorage", e);
      }

      try {
        cachedBlob = await getApkBlob();
      } catch (e) {
        console.warn("Could not read IndexedDB", e);
      }

      // 2. Fetch server release
      let serverRelease: ApkRelease | null = null;
      try {
        const res = await fetch("/api/apk/current", { cache: "no-store" });
        if (res.ok) {
          setIsServerConnected(true);
          const data = await res.json();
          if (data && typeof data === "object") {
            serverRelease = data;
          }
        }
      } catch {
        // Dev server API not available
      }

      if (!serverRelease) {
        try {
          const releaseUrl = resolveAssetUrl("release.json");
          const res = await fetch(releaseUrl, { cache: "no-store" });
          if (res.ok) {
            serverRelease = await res.json();
          }
        } catch {
          // release.json not found
        }
      }

      if (!isMounted) return;

      // The server is authoritative whenever its API responds. This prevents one
      // browser's local draft or deletion marker from changing the public release
      // seen by everyone else.
      if (serverRelease) {
        if (serverRelease.isPublished && serverRelease.downloadUrl) {
          setCurrentApk({
            ...serverRelease,
            downloadUrl: resolveAssetUrl(serverRelease.downloadUrl),
            isCustomUpload: false,
          });
        } else {
          // Static Vercel/Netlify deployments cannot accept runtime writes, but
          // they can serve an APK committed at public/downloads/.
          const repositoryApk = await detectStaticRepositoryApk();
          if (repositoryApk) {
            setCurrentApk(repositoryApk);
            setIsLocalDraft(false);
            setIsLoading(false);
            return;
          }
        }
        setIsLocalDraft(false);
        setIsLoading(false);
      }

      // API unavailable: retain the existing browser-only fallback for static
      // previews, but never present it as a global publication.
      if (!serverRelease && localMeta?.isPublished) {
        const downloadUrl = cachedBlob
          ? URL.createObjectURL(cachedBlob)
          : localMeta.downloadUrl && !localMeta.downloadUrl.startsWith("blob:")
            ? localMeta.downloadUrl
            : "";
        if (downloadUrl) {
          setCurrentApk({ ...localMeta, downloadUrl, isCustomUpload: true });
          setIsLocalDraft(true);
          setIsLoading(false);
          return;
        }
      }

      // Case D: Fallback to GitHub Releases scan
      try {
        const repos = ["Ledgerly-web"];
        for (const repo of repos) {
          const ghRes = await fetch(`https://api.github.com/repos/Seijii-Dev/${repo}/releases/latest`);
          if (ghRes.ok) {
            const release = await ghRes.json();
            const apkAsset = release.assets?.find((a: { name: string; browser_download_url: string; size: number }) =>
              a.name.toLowerCase().endsWith(".apk")
            );
            if (apkAsset) {
              const detected: ApkRelease = {
                isPublished: true,
                version: release.tag_name?.replace(/^v/, "") || "1.0.0",
                fileName: apkAsset.name,
                downloadUrl: apkAsset.browser_download_url,
                fileSize: (apkAsset.size / (1024 * 1024)).toFixed(1) + " MB",
                sha256Hash: "",
                updatedAt: apkAsset.updated_at || release.published_at,
                isCustomUpload: false,
              };
              if (isMounted) {
                setCurrentApk(detected);
                setIsLoading(false);
                return;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Could not query GitHub releases", e);
      }

      // Case E: Nothing published
      setCurrentApk(null);
      setIsLoading(false);
    }

    loadRelease();

    return () => {
      isMounted = false;
    };
  }, []);

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  // Admin import & publish via local file with strict APK validation & persistent storage
  const importApkFile = async (
    file: File,
    versionTag?: string
  ): Promise<{ success: boolean; hash?: string; message?: string }> => {
    try {
      // 1. Validate APK (magic bytes 0x50 0x4B 0x03 0x04, extension .apk, size > 0)
      const validation = await validateApkFile(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.error || "The selected file is not a valid Android APK.",
        };
      }

      const hash = validation.sha256 || "";
      const sizeText = validation.fileSizeFormatted;
      const ver = (versionTag?.trim() || validation.suggestedVersion || "1.0.0").replace(/^v/, "");
      const fileName = validation.suggestedFileName;
      const nowIso = new Date().toISOString();

      // 2. Always persist binary in IndexedDB and localStorage FIRST
      await saveApkBlob(file);
      const blobUrl = URL.createObjectURL(file);

      let activeRelease: ApkRelease = {
        isPublished: true,
        version: ver,
        fileName,
        downloadUrl: blobUrl,
        fileSize: sizeText,
        sha256Hash: hash,
        updatedAt: nowIso,
        isCustomUpload: true,
      };

      setCurrentApk(activeRelease);
      setIsLocalDraft(true);
      localStorage.setItem(APK_STORAGE_KEY, JSON.stringify(activeRelease));

      // 3. Attempt server-side streaming upload (writes directly to public/downloads/ and public/release.json)
      try {
        const uploadParams = new URLSearchParams({
          version: ver,
          fileName,
          fileSize: sizeText,
          hash,
        });

        const uploadRes = await fetch(`/api/apk/upload?${uploadParams.toString()}`, {
          method: "POST",
          body: file,
        });

        const resData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !resData.success || !resData.release) {
          return {
            success: false,
            hash,
            message: resData.error || "The server rejected the APK publication.",
          };
        }
        const serverUrl = resolveAssetUrl(resData.release.downloadUrl);
        activeRelease = {
          ...activeRelease,
          ...resData.release,
          downloadUrl: serverUrl,
          isCustomUpload: false,
        };
        setCurrentApk(activeRelease);
        setIsLocalDraft(false);
        setIsServerConnected(true);
        localStorage.setItem(APK_STORAGE_KEY, JSON.stringify(activeRelease));
        return {
          success: true,
          hash,
          message: `Published globally: "${fileName}" (v${ver}) is now live on the website!`,
        };
      } catch (uploadErr) {
        console.warn("Server upload endpoint not reachable (static host mode):", uploadErr);
      }

      // Static hosts cannot persist runtime uploads. Keep the preview local, but
      // make the limitation explicit so it is not mistaken for a global release.
      return {
        success: true,
        hash,
        message: `Imported "${fileName}" locally. Global publishing requires the Node server with writable storage.`,
      };
    } catch (err) {
      console.error("Error importing APK", err);
      return { success: false, message: "An unexpected error occurred during APK processing." };
    }
  };

  // Admin update via global direct URL
  const updateApkUrl = (url: string, versionTag: string, sizeText: string, customHash?: string) => {
    const cleanUrl = url.trim();
    const ver = (versionTag.trim() || "1.0.0").replace(/^v/, "");
    const size = sizeText.trim() || "~38.4 MB";
    const hash = customHash?.trim() || "";
    const fileName = cleanUrl.split("/").pop()?.split("?")[0] || `ledgerly-v${ver}.apk`;
    const nowIso = new Date().toISOString();

    const updated: ApkRelease = {
      isPublished: true,
      version: ver,
      fileName,
      downloadUrl: cleanUrl,
      fileSize: size,
      sha256Hash: hash,
      updatedAt: nowIso,
      isCustomUpload: true,
    };

    setCurrentApk(updated);
    setIsLocalDraft(true);
    localStorage.setItem(APK_STORAGE_KEY, JSON.stringify(updated));
  };

  // Sync with GitHub Releases
  const syncWithGitHubReleases = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const repos = ["Ledgerly-web"];
      for (const repo of repos) {
        const ghRes = await fetch(`https://api.github.com/repos/Seijii-Dev/${repo}/releases/latest`);
        if (ghRes.ok) {
          const release = await ghRes.json();
          const apkAsset = release.assets?.find((a: { name: string; browser_download_url: string; size: number }) =>
            a.name.toLowerCase().endsWith(".apk")
          );
          if (apkAsset) {
            const detected: ApkRelease = {
              isPublished: true,
              version: release.tag_name?.replace(/^v/, "") || "1.0.0",
              fileName: apkAsset.name,
              downloadUrl: apkAsset.browser_download_url,
              fileSize: (apkAsset.size / (1024 * 1024)).toFixed(1) + " MB",
              sha256Hash: "",
              updatedAt: apkAsset.updated_at || release.published_at,
              isCustomUpload: false,
            };
            setCurrentApk(detected);
            setIsLocalDraft(false);
            localStorage.setItem(APK_STORAGE_KEY, JSON.stringify(detected));
            return {
              success: true,
              message: `Found and synced "${apkAsset.name}" from ${repo} releases (v${detected.version})!`,
            };
          }
        }
      }
      return {
        success: false,
        message: "No releases containing an .apk asset were found on GitHub.",
      };
    } catch {
      return {
        success: false,
        message: "Network error while checking GitHub releases.",
      };
    }
  };

  // Restore to global public release from release.json / server
  const restoreGlobalRelease = async () => {
    setIsLoading(true);
    await deleteApkBlob();
    localStorage.removeItem(APK_STORAGE_KEY);
    try {
      let res = await fetch("/api/apk/current", { cache: "no-store" });
      if (!res.ok) {
        const releaseUrl = resolveAssetUrl("release.json");
        res = await fetch(releaseUrl, { cache: "no-store" });
      }
      if (res.ok) {
        const data: ApkRelease = await res.json();
        if (data && data.isPublished && data.downloadUrl) {
          setCurrentApk({
            ...data,
            downloadUrl: resolveAssetUrl(data.downloadUrl),
            isCustomUpload: false,
          });
          setIsLocalDraft(false);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch release.json", e);
    }
    setCurrentApk(null);
    setIsLocalDraft(false);
    setIsLoading(false);
  };

  // Remove / unpublish the current release from both server and local storage
  const removeRelease = async (): Promise<{ success: boolean; message: string }> => {
    await deleteApkBlob();
    const unpublishedMeta: ApkRelease = {
      isPublished: false,
      version: "",
      fileName: "",
      downloadUrl: "",
      fileSize: "",
      sha256Hash: "",
      updatedAt: new Date().toISOString(),
      isCustomUpload: true,
    };
    localStorage.setItem(APK_STORAGE_KEY, JSON.stringify(unpublishedMeta));
    setCurrentApk(null);
    setIsLocalDraft(false);

    try {
      const res = await fetch("/api/apk", { method: "DELETE" });
      if (res.ok) {
        return {
          success: true,
          message: "APK removed from server and unpublished successfully.",
        };
      }
    } catch (err) {
      console.warn("Could not contact server to delete APK file:", err);
    }

    return {
      success: true,
      message: "Active APK release unpublished.",
    };
  };

  return (
    <ApkContext.Provider
      value={{
        currentApk,
        isLoading,
        isLocalDraft,
        isServerConnected,
        importApkFile,
        updateApkUrl,
        syncWithGitHubReleases,
        restoreGlobalRelease,
        removeRelease,
        isAdminModalOpen,
        openAdminModal,
        closeAdminModal,
      }}
    >
      {children}
    </ApkContext.Provider>
  );
}

export function useApk() {
  const context = useContext(ApkContext);
  if (!context) {
    throw new Error("useApk must be used within an ApkProvider");
  }
  return context;
}
