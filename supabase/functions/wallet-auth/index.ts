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
    // Import viem for signature verification
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
  // Handle CORS preflight
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
      .select("user_id")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // Create a new user with wallet-based email (for Supabase auth compatibility)
      const walletEmail = `${walletAddress.toLowerCase()}@wallet.web3jobsinstitute.com`;
      const walletPassword = `wallet_${walletAddress}_${Date.now()}_${Math.random().toString(36)}`;

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: walletEmail,
        password: walletPassword,
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress,
          wallet_type: walletType,
          full_name: `${walletType === "ethereum" ? "ETH" : "SOL"} Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        },
      });

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Update the profile with wallet info
      await supabase
        .from("profiles")
        .update({
          wallet_address: walletAddress,
          wallet_type: walletType,
        })
        .eq("user_id", userId);
    }

    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `${walletAddress.toLowerCase()}@wallet.web3jobsinstitute.com`,
    });

    if (sessionError) {
      console.error("Error generating session:", sessionError);
      
      // Fallback: Sign in the user directly
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: `${walletAddress.toLowerCase()}@wallet.web3jobsinstitute.com`,
      });

      if (signInError) {
        return new Response(
          JSON.stringify({ error: "Failed to generate session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          isNewUser,
          userId,
          token: signInData.properties?.hashed_token,
          redirectUrl: signInData.properties?.action_link,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        isNewUser,
        userId,
        token: sessionData.properties?.hashed_token,
        redirectUrl: sessionData.properties?.action_link,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Wallet auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
