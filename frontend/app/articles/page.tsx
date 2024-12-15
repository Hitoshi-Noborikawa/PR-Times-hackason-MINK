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
    .eq("user_id", user.id);

  if (error || !articles) {
    console.error("Error fetching articles:", error);
    return <div>Error loading articles.</div>;
  }

  return (
    <div>
      <h1>Your Articles</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.id}`}>
              {article.title || `Untitled Article (${article.id})`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
