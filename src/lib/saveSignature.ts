import { api } from "@/lib/api"; // adjust path if needed
import { EmailSignature } from "@/types/signature";

export const saveSignature = async (payload: EmailSignature) => {
console.log(payload)
  const res = await api.post("/email-signature", payload);
  return res.data;
};