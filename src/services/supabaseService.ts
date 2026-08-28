/**
 * Legacy Supabase Service file redirected to Firebase Storage.
 * Transferred media storage from Supabase to Firebase Storage.
 */
import {
  uploadMediaToFirebaseStorage,
  uploadLogoToFirebaseStorage,
  convertFileToBase64,
  UploadResult,
} from './firebaseStorageService';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucketName?: string;
}

export function getSupabaseClient(_customConfig?: Partial<SupabaseConfig>): null {
  console.info('Media storage has been migrated to Firebase Storage.');
  return null;
}

export async function uploadLogoToSupabase(
  file: File,
  _config?: Partial<SupabaseConfig>
): Promise<{ success: boolean; url?: string; error?: string }> {
  const result: UploadResult = await uploadLogoToFirebaseStorage(file);
  return {
    success: result.success,
    url: result.url,
    error: result.error,
  };
}

export { convertFileToBase64, uploadMediaToFirebaseStorage, uploadLogoToFirebaseStorage };
