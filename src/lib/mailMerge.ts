import { api } from "@/lib/api"; // adjust path if needed
import { StartMergePayload } from "@/components/mail-merge/StartMergeDialog";

export const sendMailMerge = async (payload: StartMergePayload) => {
    console.log(payload)
  const res = await api.post("/email/send", payload);
  return res.data;
};