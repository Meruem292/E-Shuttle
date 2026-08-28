import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  storageType?: 'firebase' | 'base64';
}

/**
 * Convert file to Base64 string for direct local storage fallback
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload a media file (image, document, photo) directly to Firebase Storage.
 * Falls back safely to Base64 data URL if Firebase Storage is unavailable.
 */
export async function uploadMediaToFirebaseStorage(
  file: File,
  folder: string = 'media',
  maxSizeMB: number = 8
): Promise<UploadResult> {
  // File type validation
  if (!file.type.startsWith('image/') && !file.type.startsWith('application/pdf')) {
    return {
      success: false,
      error: 'Selected file must be an image (PNG, JPG, WEBP, SVG) or PDF document.',
    };
  }

  // File size validation
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      success: false,
      error: `File size exceeds the ${maxSizeMB}MB limit. Please select a smaller file.`,
    };
  }

  try {
    const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timeStamp = Date.now();
    const filePath = `${folder}/${timeStamp}_${sanitizeName}`;
    const storageRef = ref(storage, filePath);

    // Upload bytes to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // Obtain direct public HTTPS download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadUrl,
      storageType: 'firebase',
    };
  } catch (err: any) {
    console.warn('Firebase Storage upload warning, attempting Base64 fallback:', err);
    
    // Attempt fallback to Base64 data URL
    try {
      const base64Url = await convertFileToBase64(file);
      return {
        success: true,
        url: base64Url,
        storageType: 'base64',
        error: `Uploaded locally via Base64 (${err?.message || 'Storage bucket notice'})`,
      };
    } catch (base64Err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to process media file for storage.',
      };
    }
  }
}

/**
 * Helper to upload application logo image to Firebase Storage ('logos/' directory)
 */
export async function uploadLogoToFirebaseStorage(file: File): Promise<UploadResult> {
  return uploadMediaToFirebaseStorage(file, 'logos', 5);
}

/**
 * Helper to upload Driver License photo to Firebase Storage ('driver_licenses/' directory)
 */
export async function uploadDriverLicenseToFirebaseStorage(
  file: File,
  driverUid?: string
): Promise<UploadResult> {
  const folder = driverUid ? `driver_licenses/${driverUid}` : 'driver_licenses';
  return uploadMediaToFirebaseStorage(file, folder, 8);
}

/**
 * Delete a media file from Firebase Storage given its full URL or path
 */
export async function deleteMediaFromFirebaseStorage(urlOrPath: string): Promise<boolean> {
  try {
    if (!urlOrPath || !urlOrPath.startsWith('http')) return false;
    const storageRef = ref(storage, urlOrPath);
    await deleteObject(storageRef);
    return true;
  } catch (err) {
    console.warn('Could not delete file from Firebase Storage:', err);
    return false;
  }
}

/**
 * Legacy Supabase integration wrapper pointing to Firebase Storage
 * Maintains full backwards compatibility with existing components
 */
export async function uploadLogoToSupabase(
  file: File,
  _config?: any
): Promise<{ success: boolean; url?: string; error?: string }> {
  const res = await uploadLogoToFirebaseStorage(file);
  return {
    success: res.success,
    url: res.url,
    error: res.error,
  };
}

export function getSupabaseClient(_customConfig?: any) {
  return null;
}
