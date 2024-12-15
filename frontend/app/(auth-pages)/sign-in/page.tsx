import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">ログイン</h1>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">メールアドレス</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">パスワード</Label>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          required
        />
        <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            パスワードをお忘れの方
          </Link>
        <SubmitButton pendingText="ログイン中..." formAction={signInAction}>
          ログイン
        </SubmitButton>
        <FormMessage message={searchParams} />
        <hr />
        <Link className="text-foreground font-medium underline mt-2" href="/sign-up">
          <Button className="w-full">
            新規登録
          </Button>
        </Link>
      </div>
    </form>
  );
}
