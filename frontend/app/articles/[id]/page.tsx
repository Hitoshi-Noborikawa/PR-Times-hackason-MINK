import Editor from "@/components/editor";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function EditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const { data: article, error } = await supabase
    .from("Articles")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !article) {
    console.error("Error fetching article:", error);
    notFound();
  }

  return (
    <div>
      <Editor userId={user.id} articleId={article.id} initialContent={article.content} />
    </div>
  );
}
