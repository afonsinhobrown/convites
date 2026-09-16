import * as crypto from "crypto";

const NETSHOP_API_URL = "https://www.netshop.co.mz/api/v1";

export type NetShopMethod = "mpesa" | "emola" | "card";

export type NetShopChargeResult = {
  id: string;
  status: "pending" | "paid" | "failed";
  method: string;
  amount: number;
  reference: string;
  checkoutUrl?: string;
};

/**
 * Cria uma cobrança via NetShop API v1 (M-Pesa ou Cartão BIM)
 */
export async function createNetShopCharge(params: {
  amountMZN: number;
  reference: string;
  method?: NetShopMethod;
  msisdn?: string;
  returnUrl?: string;
}): Promise<NetShopChargeResult> {
  const apiKey = process.env.NETSHOP_API_KEY;
  const selectedMethod: NetShopMethod = params.method || "mpesa";

  // Roteamento de carteira NetShop:
  // Se for cartão BIM usa NETSHOP_WALLET_ID_BIM (318938)
  // Se for M-Pesa / móvel usa NETSHOP_WALLET_ID_MPESA (555633)
  const isBimOrCard = selectedMethod === "card";
  const walletId = isBimOrCard
    ? process.env.NETSHOP_WALLET_ID_BIM
    : process.env.NETSHOP_WALLET_ID_MPESA;

  if (!apiKey || !walletId) {
    throw new Error(
      `Credenciais da NetShop em falta no .env (${
        isBimOrCard ? "NETSHOP_WALLET_ID_BIM" : "NETSHOP_WALLET_ID_MPESA"
      })`
    );
  }

  // Normalizar número de telefone moçambicano
  let phone = params.msisdn ? params.msisdn.replace(/\D/g, "") : undefined;
  if (phone) {
    if (phone.startsWith("258") && phone.length === 12) {
      phone = phone.substring(3);
    }
    if (phone.length !== 9 || !phone.startsWith("8")) {
      phone = undefined;
    }
  }

  const payload: Record<string, unknown> = {
    amount: Math.round(params.amountMZN),
    reference: params.reference,
    method: selectedMethod,
  };

  if (selectedMethod === "mpesa" && phone) {
    payload.msisdn = phone;
  }

  if (params.returnUrl) {
    payload.return_url = params.returnUrl;
  }

  const response = await fetch(`${NETSHOP_API_URL}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Wallet-ID": walletId,
      "Idempotency-Key": `conv_${params.reference}_${Date.now()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.detail || JSON.stringify(data));
  }

  const checkoutUrl = data.checkout?.hosted_url;
  const reference = data.order_id || data.reference || params.reference;

  return {
    id: data.id,
    status: data.status,
    method: data.method,
    amount: data.amount,
    reference,
    checkoutUrl,
  };
}

/**
 * Consulta o estado de uma cobrança na NetShop pelo ID
 */
export async function getNetShopCharge(chargeId: string): Promise<{
  status: string | null;
  paid: boolean;
}> {
  const apiKey = process.env.NETSHOP_API_KEY;
  if (!apiKey || !chargeId) return { status: null, paid: false };
  const wallets = [
    process.env.NETSHOP_WALLET_ID_MPESA,
    process.env.NETSHOP_WALLET_ID_BIM,
  ].filter(Boolean) as string[];

  for (const walletId of wallets) {
    try {
      const res = await fetch(`${NETSHOP_API_URL}/charges/${encodeURIComponent(chargeId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Wallet-ID": walletId,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await res.json().catch(() => null);
      if (!data || !data.status) continue;
      const status = String(data.status).toLowerCase();
      return { status, paid: status === "paid" || status === "succeeded" };
    } catch {
      // tenta próxima carteira
    }
  }
  return { status: null, paid: false };
}

/**
 * Valida a assinatura HMAC dos webhooks enviados pela NetShop
 */
export function verifyNetShopWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.NETSHOP_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  try {
    const provided = signature.replace(/^(sha256=|t=.*,v1=)/, "").trim();

    // 1. Testa com a secret como fornecida
    const expectedRaw = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    if (
      provided.length === expectedRaw.length &&
      crypto.timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expectedRaw, "utf8"))
    ) {
      return true;
    }

    // 2. Testa removendo prefixo whsec_ caso exista
    if (secret.startsWith("whsec_")) {
      const cleanSecret = secret.slice(6);
      const expectedClean = crypto
        .createHmac("sha256", cleanSecret)
        .update(rawBody, "utf8")
        .digest("hex");

      if (
        provided.length === expectedClean.length &&
        crypto.timingSafeEqual(Buffer.from(provided, "utf8"), Buffer.from(expectedClean, "utf8"))
      ) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("Erro ao validar assinatura do webhook NetShop:", err);
    return false;
  }
}
