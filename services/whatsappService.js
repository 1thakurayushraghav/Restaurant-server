/**
 * Builds a pre-filled WhatsApp order message and click-to-chat link.
 * Does NOT send anything server-side by default — returns a wa.me link the client opens.
 * (A real WhatsApp Business/Cloud API send can be wired in here later using
 *  WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID from env, if the business enables it.)
 */
function buildWhatsAppOrderMessage({ restaurantName, customer, items, total, orderType, address }) {
  const lines = [];
  lines.push(`*New Order - ${restaurantName}*`);
  lines.push("");
  lines.push(`Name: ${customer.name}`);
  lines.push(`Phone: ${customer.phone}`);
  lines.push("");
  lines.push("*Items:*");
  items.forEach((item) => {
    lines.push(`- ${item.name} (${item.variantLabel}) x${item.quantity} = ₹${item.lineTotal}`);
  });
  lines.push("");
  lines.push(`*Total: ₹${total}*`);
  lines.push(`Order Type: ${orderType === "DELIVERY" ? "Delivery" : "Pickup"}`);
  if (orderType === "DELIVERY" && address) {
    const addrParts = [address.addressLine, address.area, address.landmark, address.pincode].filter(Boolean);
    if (addrParts.length) lines.push(`Address: ${addrParts.join(", ")}`);
  }

  return lines.join("\n");
}

function buildWhatsAppLink(whatsappNumber, message) {
  const cleanNumber = (whatsappNumber || "").replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

module.exports = { buildWhatsAppOrderMessage, buildWhatsAppLink };
