import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user && (
    <div className="flex items-center gap-4">
      <div>
      <Link
        href="/job"
      >
        プレスリリース自動生成の設定
        </Link>
      </div>
      {user.email}
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          ログアウト
        </Button>
      </form>
    </div>
  );
}
