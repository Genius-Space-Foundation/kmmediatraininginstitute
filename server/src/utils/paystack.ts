import crypto from "crypto";

export function verifyWebhookSignature(
  body: string | Buffer,
  signature: string | string[] | undefined,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const sig = Array.isArray(signature) ? signature[0] : signature;

  // Create HMAC SHA512 hash
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

  return hash === sig;
}

export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `KM_MEDIA_${timestamp}_${random}`.toUpperCase();
}
