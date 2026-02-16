import { createClientFromRequest } from "npm:@base44/sdk@0.1.106";

// Environment configuration
const POLYGON_NETWORK = Deno.env.get("POLYGON_NETWORK") || "amoy"; // "amoy" or "mainnet"
const CONTRACT_ADDRESS_AMOY = Deno.env.get("CONTRACT_ADDRESS_AMOY") || "";
const CONTRACT_ADDRESS_MAINNET = Deno.env.get("CONTRACT_ADDRESS_MAINNET") || "";
const RELAYER_PRIVATE_KEY = Deno.env.get("RELAYER_PRIVATE_KEY") || "";
const IPFS_PINATA_API_KEY = Deno.env.get("IPFS_PINATA_API_KEY") || "";
const IPFS_PINATA_SECRET = Deno.env.get("IPFS_PINATA_SECRET") || "";

// Rate limits
const MAX_MINTS_PER_USER = 3;
const MAX_MINTS_PER_IP_DAILY = 5;
const MAX_GLOBAL_MINTS_DAILY = 100;

interface MintRequest {
  walletAddress: string;
}

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json(
        { error: "Unauthorized. Please sign in with Google or Facebook." },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse request body
    const body: MintRequest = await req.json();
    const { walletAddress } = body;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return Response.json(
        { error: "Invalid wallet address. Must be a valid Ethereum address (0x...)" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Extract IP address
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.headers.get("x-real-ip") ||
                      "unknown";

    // 4. Check rate limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Per-user limit
    const userMints = await base44.entities.MintRequest.filter({
      user_id: user.id,
      status: { $in: ["pending", "confirmed"] }
    });

    if (userMints.length >= MAX_MINTS_PER_USER) {
      await logAudit(base44, "rate_limit_hit", user.id, ipAddress, {
        reason: "per_user_limit",
        limit: MAX_MINTS_PER_USER,
      });

      return Response.json(
        { error: `You have reached your limit of ${MAX_MINTS_PER_USER} free mints.` },
        { status: 429, headers: corsHeaders }
      );
    }

    // Per-IP daily limit
    const ipMints = await base44.asServiceRole.entities.MintRequest.filter({
      ip_address: ipAddress,
      created_date: { $gte: today.toISOString() }
    });

    if (ipMints.length >= MAX_MINTS_PER_IP_DAILY) {
      await logAudit(base44, "rate_limit_hit", user.id, ipAddress, {
        reason: "per_ip_daily_limit",
        limit: MAX_MINTS_PER_IP_DAILY,
      });

      return Response.json(
        { error: "Too many mint requests from this IP address. Please try again tomorrow." },
        { status: 429, headers: corsHeaders }
      );
    }

    // Global daily limit
    const globalMints = await base44.asServiceRole.entities.MintRequest.filter({
      created_date: { $gte: today.toISOString() }
    });

    if (globalMints.length >= MAX_GLOBAL_MINTS_DAILY) {
      await logAudit(base44, "rate_limit_hit", user.id, ipAddress, {
        reason: "global_daily_limit",
        limit: MAX_GLOBAL_MINTS_DAILY,
      });

      return Response.json(
        { error: "Daily mint limit reached. Please try again tomorrow." },
        { status: 429, headers: corsHeaders }
      );
    }

    // 5. Generate NFT metadata
    const nftNames = [
      "Genesis Aurora", "Genesis Nebula", "Genesis Prism", "Genesis Void",
      "Genesis Flux", "Genesis Echo", "Genesis Drift", "Genesis Bloom",
      "Genesis Shade", "Genesis Pulse", "Genesis Horizon", "Genesis Nexus"
    ];
    const nftName = nftNames[Math.floor(Math.random() * nftNames.length)];
    const tokenId = String(Date.now()); // In production, get from contract

    // 6. Generate NFT image using Base44's AI
    let imageUrl = "";
    try {
      const imgResult = await base44.integrations.Core.GenerateImage({
        prompt: `Abstract futuristic digital art NFT, dark cosmic background with glowing neon purple and cyan geometric crystalline structures, ethereal energy particles, minimalist modern style, high quality 4K, named "${nftName}"`,
      });
      imageUrl = imgResult.url;
    } catch (error) {
      console.error("Image generation failed:", error);
      // Continue without image
    }

    // 7. Upload metadata to IPFS (simulated - in production use Pinata/Web3.Storage)
    // In production, upload image to IPFS first, then upload metadata JSON
    const metadata = {
      name: nftName,
      description: `${nftName} - A unique piece from the Genesis NFT collection. Free mint on Polygon.`,
      image: imageUrl || "ipfs://QmPlaceholder",
      attributes: [
        { trait_type: "Generation", value: "Genesis" },
        { trait_type: "Network", value: POLYGON_NETWORK === "mainnet" ? "Polygon" : "Polygon Amoy" },
        { trait_type: "Rarity", value: "Unique" }
      ]
    };

    // Simulate IPFS upload (in production, use actual IPFS pinning service)
    const fakeIpfsHash = `Qm${Array.from({ length: 44 }, () => 
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]
    ).join("")}`;
    const tokenUri = `ipfs://${fakeIpfsHash}`;

    // 8. Mint NFT via ERC-2771 meta-transaction (simulated)
    // In production:
    // - Use ethers.js or viem to interact with contract
    // - Sign transaction with RELAYER_PRIVATE_KEY
    // - Use Gelato Relay or OpenZeppelin Defender for gasless transactions
    // - Contract must support ERC-2771 forwarder pattern

    const contractAddress = POLYGON_NETWORK === "mainnet" 
      ? CONTRACT_ADDRESS_MAINNET 
      : CONTRACT_ADDRESS_AMOY;

    // Simulate blockchain transaction
    const fakeTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    // 9. Create MintRequest record
    const mintRecord = await base44.entities.MintRequest.create({
      user_id: user.id,
      wallet_address: walletAddress,
      token_id: tokenId,
      token_uri: tokenUri,
      tx_hash: fakeTxHash,
      network: POLYGON_NETWORK,
      status: "confirmed", // In production: "pending" until tx confirms
      ip_address: ipAddress,
      nft_name: nftName,
      image_url: imageUrl,
    });

    // 10. Log success to audit log
    await logAudit(base44, "mint_success", user.id, ipAddress, {
      token_id: tokenId,
      wallet_address: walletAddress,
      tx_hash: fakeTxHash,
      network: POLYGON_NETWORK,
    });

    // 11. Return response
    return Response.json({
      success: true,
      mint: {
        id: mintRecord.id,
        tokenId,
        txHash: fakeTxHash,
        tokenUri,
        nftName,
        imageUrl,
        network: POLYGON_NETWORK,
        explorerUrl: POLYGON_NETWORK === "mainnet"
          ? `https://polygonscan.com/tx/${fakeTxHash}`
          : `https://amoy.polygonscan.com/tx/${fakeTxHash}`,
      },
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Mint error:", error);

    // Log error to audit log
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me().catch(() => null);
      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      
      await logAudit(base44, "mint_failure", user?.id || "unknown", ipAddress, {
        error: error.message,
        stack: error.stack,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return Response.json(
      { error: error.message || "Failed to mint NFT. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
});

// Helper function to log audit events
async function logAudit(
  base44: any,
  eventType: string,
  userId: string,
  ipAddress: string,
  details: Record<string, any>
) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      event_type: eventType,
      user_id: userId,
      ip_address: ipAddress,
      details,
      severity: eventType.includes("failure") || eventType.includes("error") ? "error" : "info",
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}