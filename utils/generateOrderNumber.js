// Generates a human-friendly, roughly-sequential order number.
// Format: SM-YYMMDD-XXXX (XXXX = random 4-digit suffix)
function generateOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SM-${yy}${mm}${dd}-${rand}`;
}

module.exports = generateOrderNumber;
