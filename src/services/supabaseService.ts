import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global cached client instance
let cachedSupabaseClient: SupabaseClient | null = null;
let cachedClientKey = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucketName?: string;
}

/**
 * Helper to obtain a configured Supabase client instance.
 * Prefers explicitly passed credentials, then environment variables, then cached settings.
 */
export function getSupabaseClient(customConfig?: Partial<SupabaseConfig>): SupabaseClient | null {
  const url =
    customConfig?.url?.trim() ||
    import.meta.env.VITE_SUPABASE_URL ||
    'https://gjfwrphhhgodjhtgwmum.supabase.co';
  const anonKey =
    customConfig?.anonKey?.trim() ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!url || !anonKey) {
    return null;
  }

  const keyCombination = `${url}::${anonKey}`;
  if (cachedSupabaseClient && cachedClientKey === keyCombination) {
    return cachedSupabaseClient;
  }

  try {
    cachedSupabaseClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
    cachedClientKey = keyCombination;
    return cachedSupabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Upload an image file to Supabase Storage.
 * Creates a unique file path in the target bucket and returns the public URL.
 */
export async function uploadLogoToSupabase(
  file: File,
  config?: Partial<SupabaseConfig>
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient(config);

  if (!client) {
    return {
      success: false,
      error:
        'Supabase client is not configured. Please enter your Supabase Project URL and Anon Key in Settings or set environment variables.',
    };
  }

  const bucketName = config?.bucketName?.trim() || 'photos';

  // File validation
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Selected file must be an image (PNG, JPG, SVG, WEBP).' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Logo image size must be less than 5MB.' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `logo_${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file to bucket
    const { data: uploadData, error: uploadError } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase upload error, attempting bucket creation or bucket check:', uploadError);
      
      // If error indicates bucket doesn't exist, attempt to create bucket or inform user
      if (uploadError.message?.toLowerCase().includes('not found') || uploadError.message?.toLowerCase().includes('bucket')) {
        try {
          await client.storage.createBucket(bucketName, { public: true });
          // Retry upload
          const { data: retryData, error: retryError } = await client.storage
            .from(bucketName)
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (retryError) {
            return {
              success: false,
              error: `Supabase Storage upload failed: ${retryError.message}. Please ensure the '${bucketName}' bucket exists and is marked public in your Supabase Storage dashboard.`,
            };
          }
        } catch (bucketErr: any) {
          return {
            success: false,
            error: `Bucket '${bucketName}' not found or auto-creation failed: ${uploadError.message}. Please create a public bucket named '${bucketName}' in Supabase.`,
          };
        }
      } else {
        return {
          success: false,
          error: `Upload to Supabase Storage failed: ${uploadError.message}`,
        };
      }
    }

    // Get public URL
    const { data: publicUrlData } = client.storage.from(bucketName).getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { success: false, error: 'Could not retrieve public URL for uploaded logo.' };
    }

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('Error uploading logo to Supabase:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while uploading to Supabase Storage.',
    };
  }
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
