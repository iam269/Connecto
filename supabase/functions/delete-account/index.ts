// Deno type declarations for Supabase Edge Functions
declare const Deno: {
  serve(handler: (req: Request) => Promise<Response> | Response): void;
  env: {
    get(key: string): string | undefined;
  };
};

// Supabase client type declarations
interface User {
  id: string;
}

interface StorageFile {
  name: string;
}

interface StorageListResponse {
  data: StorageFile[] | null;
  error: Error | null;
}

interface StorageClient {
  from(bucket: string): {
    list(options?: { search?: string }): Promise<StorageListResponse>;
    remove(files: string[]): Promise<{ error: Error | null }>;
  };
}

interface GetUserResponse {
  data: { user: User | null };
  error: Error | null;
}

interface DeleteUserResponse {
  error: Error | null;
}

interface SupabaseAuth {
  getUser(): Promise<GetUserResponse>;
  admin: {
    deleteUser(userId: string): Promise<DeleteUserResponse>;
  };
}

interface SupabaseQueryBuilder {
  delete(): SupabaseQueryBuilder;
  eq(column: string, value: string): Promise<{ error: Error | null }>;
}

interface SupabaseClient {
  auth: SupabaseAuth;
  storage: StorageClient;
  from(table: string): SupabaseQueryBuilder;
}

declare const createClient: (
  supabaseUrl: string,
  supabaseKey: string,
  options?: object
) => SupabaseClient;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_ANON_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;

    // Delete user data in order
    // Tables with CASCADE will be handled automatically when auth.users is deleted
    // Only manually delete from tables without CASCADE or with partial CASCADE
    
    // promotions table has user_id but no CASCADE - must delete manually
    try {
      const { error: promoError } = await adminClient.from("promotions").delete().eq("user_id", userId);
      if (promoError) {
        console.error("Error deleting promotions:", promoError);
        // Continue anyway - don't fail the whole operation for promotions
      }
    } catch (promoCatchError) {
      console.error("Exception deleting promotions:", promoCatchError);
      // Continue anyway
    }

    // Delete storage files (user's media uploads)
    try {
      const { data: storageFiles, error: listError } = await adminClient.storage
        .from("media")
        .list();
      
      if (!listError && storageFiles && storageFiles.length > 0) {
        // Filter files that belong to this user (files are stored in userId/filename format)
        const userFiles = storageFiles.filter((f: StorageFile) => f.name.startsWith(userId));
        const filePaths = userFiles.map((f: StorageFile) => f.name);
        if (filePaths.length > 0) {
          await adminClient.storage.from("media").remove(filePaths);
        }
      }
    } catch (storageError) {
      console.error("Error cleaning up storage:", storageError);
      // Continue anyway
    }

    // Delete auth user (this will trigger CASCADE deletes for most tables)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
