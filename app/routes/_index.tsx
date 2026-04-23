import { redirect } from "@remix-run/node";

export const loader = () => redirect("/entradas");

export default function Index() {
  return null;
}
