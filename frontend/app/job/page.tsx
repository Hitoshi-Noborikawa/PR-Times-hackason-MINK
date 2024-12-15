"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const JobForm = () => {
  const [job, setJob] = useState<{
    id: string;
    url: string;
    article_title: string;
    executable: boolean;
    notification_email: string;
  } | null>(null); // 既存データの状態管理
  const [url, setUrl] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [executable, setExecutable] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
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
        setNotificationEmail(data.notification_email);
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
      .update({
        url,
        article_title: articleTitle,
        executable,
        notification_email: notificationEmail,
      })
      .eq("id", job.id);

    if (error) {
      console.error("Update error:", error);
      setMessage("更新が失敗しました");
    } else {
      setMessage("更新が完了しました");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center sm:py-12">
      {message && (
        <div style={{ marginTop: "20px", color: message.includes("更新が完了しました") ? "green" : "red" }}>
          {message}
        </div>
      )}
      {job ? (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl leading-6 font-medium text-gray-900 mb-4">プレスリリース自動生成の設定</h1>
              <form onSubmit={handleUpdate} className="py-3 space-y-4">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  公式サイトURL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  placeholder="https://example.com"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <label htmlFor="executable" className="pt-3 block text-sm font-medium text-gray-700">
                  自動生成のオン・オフ
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className={`${
                      executable ? 'bg-indigo-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    role="switch"
                    aria-checked={executable}
                    onClick={() => setExecutable(!executable)}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        executable ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {executable ? 'オン' : 'オフ'}
                  </span>
                </div>
                <label htmlFor="email" className="pt-3 block text-sm font-medium text-gray-700">
                  通知先メールアドレス
                </label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSubmitting ? "更新中..." : "更新"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div>No job data found for the current user.</div>
      )}
    </div>
  );
};

export default JobForm;
