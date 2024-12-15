import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user && (
    <div className="flex items-center gap-4">
      {user.email}
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          ログアウト
        </Button>
      </form>
    </div>
  );
}
