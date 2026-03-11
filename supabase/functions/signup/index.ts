import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { username, password, metadata } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if username already exists in profiles table
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Username already taken" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate a fake email for Supabase Auth (username@connecto.local)
    const email = `${username.toLowerCase()}@connecto.local`;

    // Check if this internal email already exists in auth
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (existingUser && existingUser.user) {
      return new Response(
        JSON.stringify({ error: "Username already taken" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        ...metadata,
        username: username.toLowerCase(),
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create profile with username
    if (data.user) {
      const { error: profileInsertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username.toLowerCase(),
          full_name: metadata?.full_name || null,
        });

      if (profileInsertError) {
        // If profile creation fails, delete the user
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        return new Response(JSON.stringify({ error: "Failed to create profile" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: data.user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
