"use client"

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import Link from "next/link"

interface NavigationProps {
  user: User | null
}

// ナビゲーション
const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、よろしいですか？")) {
      return
    }

    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="mx-auto max-w-screen-lg px-2 py-5 flex items-center justify-between">
        <div>
            <Link href="/" className="font-bold text-xl">
            自動生成リリース
            </Link>
        </div>
        {user ? (
            <div className="flex space-x-5">
                <Link href="/blog/new">
                    <div>投稿</div>
                </Link>

                <Link href="/settings/profile">
                    <div>設定</div>
                </Link>
            </div>
        ) : (<> </>)}
        {user ? (
            <div className="text-sm font-bold">
                <div className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </div>
            </div>
          ) : (
            <div className="flex items-center space-x-5">
              <Link href="/sign-in">ログイン</Link>
              <Link href="/signup">サインアップ</Link>
            </div>
          )}
      </div>
    </header>
  )
}

export default Navigation