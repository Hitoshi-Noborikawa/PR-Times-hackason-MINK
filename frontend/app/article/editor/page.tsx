import Editor from "@/components/editor";
import { createClient } from "@/utils/supabase/server";

export default async function EditorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: articles, error } = await supabase
    .from("Articles")
    .select("*")
    .eq("user_id", user?.id);

  if (error) {
    console.error("Error fetching articles:", error);
    return <div>Error loading articles.</div>;
  }

  return (
    <>
        <Editor userId={user?.id} articleId={articles[0].id} initialContent={articles[0].content} />
    </>
  );
}
