import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    // Entity automation payload: { event, data, old_data }
    const { event, data, old_data } = payload;

    // Only process update events where status changed
    if (!data || !event) {
      return Response.json({ skipped: "no event or data" });
    }

    const mintRecord = data;
    const prevStatus = old_data?.status;
    const newStatus = mintRecord.status;

    // Only fire if status actually changed
    if (prevStatus === newStatus) {
      return Response.json({ skipped: "status unchanged" });
    }

    // Only handle confirmed or failed transitions
    if (newStatus !== "confirmed" && newStatus !== "failed") {
      return Response.json({ skipped: "irrelevant status" });
    }

    if (!mintRecord.user_id) {
      return Response.json({ skipped: "no user_id on record" });
    }

    // Resolve user email for frontend filtering
    let userEmail = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ id: mintRecord.user_id });
      userEmail = users?.[0]?.email || null;
    } catch (_) {
      // non-critical
    }

    let title, message, type;

    if (newStatus === "confirmed") {
      title = "🎉 NFT Minted Successfully!";
      message = `Your NFT "${mintRecord.nft_name || `#${mintRecord.token_id}`}" has been minted on ${
        mintRecord.network === "mainnet" ? "Polygon Mainnet" : "Polygon Amoy"
      }. Tx: ${mintRecord.tx_hash ? mintRecord.tx_hash.slice(0, 12) + "..." : "N/A"}`;
      type = "success";
    } else {
      title = "❌ Mint Failed";
      message = mintRecord.error_message
        ? `Your mint failed: ${mintRecord.error_message}`
        : "Your NFT mint could not be completed. Please try again.";
      type = "error";
    }

    await base44.asServiceRole.entities.Notification.create({
      user_id: mintRecord.user_id,
      user_email: userEmail,
      title,
      message,
      type,
      read: false,
      mint_request_id: mintRecord.id,
    });

    console.log(`Notification created for user ${mintRecord.user_id}: ${type}`);
    return Response.json({ success: true, type, user_id: mintRecord.user_id });
  } catch (error) {
    console.error("sendMintNotification error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});