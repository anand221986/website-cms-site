import { api } from "@/lib/api"; // adjust path if needed
import { EmailSignature } from "@/types/signature";

export const saveSignature = async (payload: Partial<EmailSignature>) => {
  console.log(payload);

  // EDIT CASE → PUT
  if (payload.id) {
    const res = await api.put(`/email-signature/${payload.id}`, payload);
    return res.data;
  }

  // CREATE CASE → POST
  const res = await api.post("/email-signature", payload);
  return res.data;
};