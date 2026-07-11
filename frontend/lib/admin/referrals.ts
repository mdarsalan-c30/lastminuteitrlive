import { all, insert, update, genId } from "@/lib/db/store";
import type { PlanId } from "@/lib/payments/plans";
import { REFERRAL_ECONOMICS } from "@/lib/seo/referralEconomics";

// Fallback defaults — locked in doc 62 / referralEconomics.ts
const DEFAULT_CONFIG = {
  referrerRewardCoins: REFERRAL_ECONOMICS.referrerRewardCoins,
  refereeDiscountPct: REFERRAL_ECONOMICS.refereeDiscountPct,
  maxCoinUsePerFiling: REFERRAL_ECONOMICS.maxCoinUsePerFiling,
};

export async function getReferralConfig() {
  const configs = await all("referralConfig");
  if (configs.length > 0) return configs[0];
  return DEFAULT_CONFIG;
}

export async function updateReferralConfig(data: {
  referrerRewardCoins: number;
  refereeDiscountPct: number;
  maxCoinUsePerFiling: number;
  updatedBy: string;
}) {
  const configs = await all("referralConfig");
  if (configs.length > 0) {
    return update("referralConfig", configs[0].id, data);
  } else {
    return insert("referralConfig", { id: "singleton", ...data });
  }
}

export async function getReferralCodeByOwner(ownerEmail: string) {
  const codes = await all("referralCodes");
  return codes.find((c) => c.ownerEmail === ownerEmail) ?? null;
}

export async function getReferralCode(code: string) {
  const codes = await all("referralCodes");
  const normalized = code.trim().toUpperCase();
  return codes.find((c) => c.code === normalized) ?? null;
}

export async function generateReferralCode(ownerEmail: string) {
  let existing = await getReferralCodeByOwner(ownerEmail);
  if (existing) return existing;

  const prefix = ownerEmail.split("@")[0].substring(0, 4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const codeStr = `${prefix}${randomSuffix}`;

  const code = {
    id: genId("ref"),
    code: codeStr,
    ownerEmail,
    createdAt: new Date().toISOString(),
  };
  await insert("referralCodes", code);
  return code;
}

export async function validateReferralCode(code: string, planId: PlanId) {
  const referral = await getReferralCode(code);
  if (!referral) return { valid: false, reason: "Invalid code" };

  const config = await getReferralConfig();
  
  return {
    valid: true,
    reason: "Referral applied",
    discount: "amount",
    amountOff: null, // Will compute based on plan price during redemption or in route
    refereeDiscountPct: config.refereeDiscountPct,
    referralCodeId: referral.id
  };
}

export async function recordReferralRedemption(
  referralCodeId: string,
  redeemerSessionId: string,
  paymentId?: string
) {
  // Insert redemption record
  const redemption = {
    id: genId("ref_red"),
    referralCodeId,
    redeemerSessionId,
    paymentId,
    rewardGranted: true,
    createdAt: new Date().toISOString(),
  };
  await insert("referralRedemptions", redemption);

  // Grant reward to referrer
  const codes = await all("referralCodes");
  const referral = codes.find(c => c.id === referralCodeId);
  if (referral) {
    const config = await getReferralConfig();
    await addCoins(referral.ownerEmail, config.referrerRewardCoins);
  }
}

// B2C Wallet Logic
export async function getB2CWallet(email: string) {
  const wallets = await all("b2cWallets");
  const wallet = wallets.find((w) => w.email === email);
  if (wallet) return wallet;

  // Create empty wallet
  const newWallet = {
    id: genId("wal"),
    email,
    coins: 0,
    updatedAt: new Date().toISOString(),
  };
  await insert("b2cWallets", newWallet);
  return newWallet;
}

export async function addCoins(email: string, amount: number) {
  const wallet = await getB2CWallet(email);
  return update("b2cWallets", wallet.id, {
    coins: wallet.coins + amount,
    updatedAt: new Date().toISOString(),
  });
}

export async function spendCoins(email: string, amountToUse: number) {
  const wallet = await getB2CWallet(email);
  if (wallet.coins < amountToUse) {
    throw new Error("Insufficient coins");
  }
  return update("b2cWallets", wallet.id, {
    coins: wallet.coins - amountToUse,
    updatedAt: new Date().toISOString(),
  });
}
