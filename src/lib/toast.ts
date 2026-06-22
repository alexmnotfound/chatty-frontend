import { sileo } from "sileo";

export function toast(message: string, type: "success" | "error" | "warning" | "info" = "info") {
  if (type === "success") sileo.success({ title: message });
  else if (type === "error") sileo.error({ title: message });
  else if (type === "warning") sileo.warning({ title: message });
  else sileo.info({ title: message });
}
