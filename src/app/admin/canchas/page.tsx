import { redirect } from "next/navigation";

/** La gestión de canchas vive en /admin/locales (un solo módulo por centro). */
export default function AdminCanchasRedirectPage() {
  redirect("/admin/locales");
}
