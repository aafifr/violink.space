import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "register" ? "register" : "login";
  const slugParam = params.slug ? `&slug=${encodeURIComponent(params.slug)}` : "";
  redirect(`/?auth=${tab}${slugParam}`);
}
