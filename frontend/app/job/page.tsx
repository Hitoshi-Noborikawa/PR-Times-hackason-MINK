"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const JobForm = () => {
  const [job, setJob] = useState<{
    id: string;
    url: string;
    article_title: string;
    executable: boolean;
  } | null>(null); // 既存データの状態管理
  const [url, setUrl] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [executable, setExecutable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchJob = async () => {
      // ユーザー情報の取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("You must be logged in.");
        return;
      }

      // Jobsテーブルからデータを取得
      const { data, error } = await supabase
        .from("Jobs")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("No job found for the user:", error.message);
      } else {
        setJob(data); // 既存データを保存
        setUrl(data.url);
        setArticleTitle(data.article_title);
        setExecutable(data.executable);
      }
    };

    fetchJob();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (!job) {
      setMessage("No job data to update.");
      setIsSubmitting(false);
      return;
    }

    // 更新処理
    const { error } = await supabase
      .from("Jobs")
      .update({ url, article_title: articleTitle, executable })
      .eq("id", job.id);

    if (error) {
      console.error("Update error:", error);
      setMessage("Failed to update the job.");
    } else {
      setMessage("Job updated successfully!");
    }

    setIsSubmitting(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>{job ? "Edit Job" : "No Job Found"}</h1>
      {job ? (
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>
            URL:
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="Enter a valid URL"
              style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            />
          </label>
          <label>
            Article Title:
            <input
              type="text"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              required
              placeholder="Enter the article title"
              style={{ width: "100%", padding: "8px", fontSize: "16px" }}
            />
          </label>
          <label>
            Executable:
            <input
              type="checkbox"
              checked={executable}
              onChange={(e) => setExecutable(e.target.checked)}
              style={{ marginLeft: "10px" }}
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              backgroundColor: isSubmitting ? "#ddd" : "#007bff",
              color: "#fff",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </form>
      ) : (
        <div>No job data found for the current user.</div>
      )}
      {message && (
        <div style={{ marginTop: "20px", color: message.includes("successfully") ? "green" : "red" }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default JobForm;
