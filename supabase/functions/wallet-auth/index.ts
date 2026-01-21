import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  walletType: "ethereum" | "solana";
}

// Verify Ethereum signature using ecrecover
async function verifyEthereumSignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const { verifyMessage } = await import("https://esm.sh/viem@2.21.0");
    
    const isValid = await verifyMessage({
      address: expectedAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    
    return isValid;
  } catch (error) {
    console.error("Ethereum signature verification error:", error);
    return false;
  }
}

// Verify Solana signature using nacl
async function verifySolanaSignature(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  try {
    const nacl = await import("https://esm.sh/tweetnacl@1.0.3");
    const bs58 = await import("https://esm.sh/bs58@5.0.0");
    
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.default.decode(signature);
    const publicKeyBytes = bs58.default.decode(publicKey);
    
    return nacl.default.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error("Solana signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { walletAddress, signature, message, walletType }: WalletAuthRequest = await req.json();

    if (!walletAddress || !signature || !message || !walletType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the message contains a recent timestamp (within 5 minutes)
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messageTimestamp = parseInt(timestampMatch[1]);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (currentTime - messageTimestamp > fiveMinutes) {
      return new Response(
        JSON.stringify({ error: "Message expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature based on wallet type
    let isValid = false;
    if (walletType === "ethereum") {
      isValid = await verifyEthereumSignature(message, signature, walletAddress);
    } else if (walletType === "solana") {
      isValid = await verifySolanaSignature(message, signature, walletAddress);
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists with this wallet
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id, email")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    let userId: string;
    let userEmail: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.user_id;
      userEmail = existingProfile.email || `${walletAddress.toLowerCase().slice(0, 20)}@wallet.local`;
    } else {
      // Create a deterministic email from wallet address
      const walletEmail = `${walletAddress.toLowerCase().slice(0, 20)}@wallet.local`;
      
      // Check if this email already exists (edge case)
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userWithEmail = existingUser?.users?.find(u => u.email === walletEmail);
      
      if (userWithEmail) {
        // User exists but profile doesn't have wallet - update profile
        userId = userWithEmail.id;
        userEmail = walletEmail;
        
        await supabase
          .from("profiles")
          .update({
            wallet_address: walletAddress,
            wallet_type: walletType,
          })
          .eq("user_id", userId);
      } else {
        // Create new user - generate a secure random password
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const walletPassword = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: walletEmail,
          password: walletPassword,
          email_confirm: true,
          user_metadata: {
            wallet_address: walletAddress,
            wallet_type: walletType,
            full_name: `${walletType === "ethereum" ? "ETH" : "SOL"} ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          },
        });

        if (createError) {
          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!newUser.user) {
          return new Response(
            JSON.stringify({ error: "No user returned from creation" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = newUser.user.id;
        userEmail = walletEmail;
        isNewUser = true;

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update the profile with wallet info
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            wallet_address: walletAddress,
            wallet_type: walletType,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating profile with wallet:", updateError);
        }
      }
    }

    // Generate a magic link for the user to sign in
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
      options: {
        redirectTo: `${req.headers.get("origin") || "https://web3jobsinst.lovable.app"}/dashboard`,
      },
    });

    if (linkError) {
      console.error("Error generating magic link:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate authentication link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the action link
    const actionLink = linkData.properties?.action_link;
    const hashedToken = linkData.properties?.hashed_token;

    return new Response(
      JSON.stringify({
        success: true,
        isNewUser,
        userId,
        email: userEmail,
        actionLink,
        hashedToken,
        tokenType: "magiclink",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Wallet auth error:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
