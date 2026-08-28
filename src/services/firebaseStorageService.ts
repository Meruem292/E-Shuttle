import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload any image or media file directly to Firebase Cloud Storage.
 * @param file File object to upload
 * @param folder Target folder inside storage bucket (e.g., 'logos', 'driver_licenses', 'chat', 'ebikes')
 */
export async function uploadMediaToFirebase(
  file: File,
  folder: string = 'media'
): Promise<UploadResult> {
  if (!file) {
    return { success: false, error: 'No file selected for upload.' };
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: 'File size exceeds 10MB limit. Please select a smaller photo or media file.',
    };
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const filePath = `${folder}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, filePath);

    // Upload file bytes to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/png',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // Obtain the public HTTP download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadUrl,
    };
  } catch (err: any) {
    console.warn('Firebase Storage upload notice, attempting Base64 fallback:', err);

    // Fallback to Base64 Data URL so user media uploads never fail even during offline or missing bucket setups
    try {
      const base64Url = await convertFileToBase64(file);
      return {
        success: true,
        url: base64Url,
        error: err?.message ? `Notice: Uploaded using direct storage fallback (${err.message})` : undefined,
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        error: err?.message || 'Failed to upload file to Firebase Cloud Storage.',
      };
    }
  }
}

/**
 * Specialized helper to upload custom app logo to Firebase Storage (`logos/` folder)
 */
export async function uploadLogoToFirebase(file: File): Promise<UploadResult> {
  return uploadMediaToFirebase(file, 'logos');
}

/**
 * Specialized helper to upload Driver's License photos to Firebase Storage (`driver_licenses/` folder)
 */
export async function uploadDriverLicenseToFirebase(file: File, driverId?: string): Promise<UploadResult> {
  const folder = driverId ? `driver_licenses/${driverId}` : 'driver_licenses';
  return uploadMediaToFirebase(file, folder);
}

/**
 * Helper to convert File to Base64 Data URL string for local storage fallback
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
