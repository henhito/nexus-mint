import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const POLYGON_NETWORK = Deno.env.get("POLYGON_NETWORK") || "amoy";
const MAX_MINTS_PER_USER = 3;

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);

    // 1. Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401, headers: corsHeaders });
    }

    // 2. Check wallet is linked via UserProfile — never trust frontend-supplied address
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
    const profile = profiles[0];

    if (!profile || !profile.wallet_address || !profile.wallet_verified) {
      return Response.json(
        { error: "No verified wallet linked. Please link your wallet before minting." },
        { status: 400, headers: corsHeaders }
      );
    }

    const walletAddress = profile.wallet_address;

    // 3. Enforce per-user mint cap
    const userMints = await base44.entities.MintRequest.filter({
      user_id: user.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (userMints.length >= MAX_MINTS_PER_USER) {
      return Response.json(
        { error: `You have reached your limit of ${MAX_MINTS_PER_USER} free mints.` },
        { status: 429, headers: corsHeaders }
      );
    }

    // 4. IP rate limiting
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ipMints = await base44.asServiceRole.entities.MintRequest.filter({
      ip_address: ipAddress,
      created_date: { $gte: today.toISOString() },
    });

    if (ipMints.length >= 5) {
      return Response.json(
        { error: "Too many requests from this IP. Please try again tomorrow." },
        { status: 429, headers: corsHeaders }
      );
    }

    // 5. Generate NFT metadata
    const nftNames = [
      "Genesis Aurora", "Genesis Nebula", "Genesis Prism", "Genesis Void",
      "Genesis Flux", "Genesis Echo", "Genesis Drift", "Genesis Bloom",
      "Genesis Shade", "Genesis Pulse", "Genesis Horizon", "Genesis Nexus",
    ];
    const nftName = nftNames[Math.floor(Math.random() * nftNames.length)];
    const tokenId = String(Date.now());

    // 6. Generate NFT image
    let imageUrl = "";
    try {
      const imgResult = await base44.integrations.Core.GenerateImage({
        prompt: `Abstract futuristic NFT art, dark cosmic background, glowing neon purple and cyan geometric crystalline structures, ethereal energy particles, minimalist modern style, 4K, named "${nftName}"`,
      });
      imageUrl = imgResult.url;
    } catch (e) {
      console.error("Image generation failed:", e);
    }

    // 7. Simulate blockchain transaction (replace with real ethers.js signing in production)
    const fakeTxHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    // 8. Save MintRequest record
    const mintRecord = await base44.entities.MintRequest.create({
      user_id: user.id,
      wallet_address: walletAddress,
      token_id: tokenId,
      tx_hash: fakeTxHash,
      network: POLYGON_NETWORK,
      status: "confirmed",
      ip_address: ipAddress,
      nft_name: nftName,
      image_url: imageUrl,
    });

    // 9. Update minted_count on UserProfile
    await base44.entities.UserProfile.update(profile.id, {
      minted_count: (profile.minted_count || 0) + 1,
    });

    // 10. Log audit
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: "mint_success",
      user_id: user.id,
      ip_address: ipAddress,
      severity: "info",
      details: { token_id: tokenId, wallet_address: walletAddress, tx_hash: fakeTxHash },
    }).catch(() => {});

    return Response.json(
      {
        success: true,
        mint: {
          id: mintRecord.id,
          tokenId,
          txHash: fakeTxHash,
          nftName,
          imageUrl,
          network: POLYGON_NETWORK,
          explorerUrl: POLYGON_NETWORK === "mainnet"
            ? `https://polygonscan.com/tx/${fakeTxHash}`
            : `https://amoy.polygonscan.com/tx/${fakeTxHash}`,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Mint error:", error);
    return Response.json(
      { error: error.message || "Failed to mint NFT. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
});