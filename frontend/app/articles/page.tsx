import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ArticleListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your articles.</div>;
  }

  const { data: articles, error } = await supabase
    .from("Articles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !articles) {
    console.error("Error fetching articles:", error);
    return <div>Error loading articles.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">生成されたプレスリリース</h1>
      <ul className="space-y-4">
        {articles.map((article) => (
          <Link href={`/articles/${article.id}`} key={article.id}>
            <li
              className="flex items-center justify-between bg-white shadow rounded-lg p-4 mb-5 transition-transform transform hover:scale-[1.02] hover:shadow-lg"
              style={{ width: "600px" }}
            >
              <div className="flex items-center space-x-4 w-3/4">
                <p className="text-gray-500 text-sm flex-shrink-0 w-28">
                  {new Date(article.created_at).toLocaleDateString("ja-JP")}
                </p>
                <p className="text-lg font-semibold truncate w-full">
                  {article.title || `無題の記事 (${article.id})`}
                </p>
              </div>

              <div
                className={`flex items-center text-sm font-bold flex-shrink-0 ${
                  article.approved ? "text-green-600" : "text-red-600"
                }`}
              >
                {article.approved ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <>リリース前</>
                )}
                {article.status}
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
