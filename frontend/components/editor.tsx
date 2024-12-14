"use client";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorProps {
  userId: string | undefined;
  articleId: string;
  initialContent: string;
}

const Editor: React.FC<EditorProps> = ({ userId, articleId, initialContent }) => {
  const [value, setValue] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState<boolean>(false); // 保存中フラグ
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // 保存状態のメッセージ

  const handleSave = async () => {
    if (!userId) {
      setSaveMessage("User not logged in");
      return;
    }

    setIsSaving(true); // 保存開始
    setSaveMessage(null); // メッセージリセット

    const supabase = createClient();

    const { error } = await supabase
      .from("Articles")
      .update({ content: value })
      .eq("id", articleId)
      .eq("user_id", userId);

    setIsSaving(false); // 保存終了

    if (error) {
      console.error("Error saving content:", error);
      setSaveMessage("Failed to save content");
    } else {
      setSaveMessage("Content saved successfully!");
    }
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <MDEditor value={value} onChange={setValue} height={400} width={400} />
      </div>
      <div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: isSaving ? "#ddd" : "#007bff",
            color: "#fff",
            border: "none",
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        {saveMessage && (
          <div style={{ marginTop: "10px", color: saveMessage.includes("successfully") ? "green" : "red" }}>
            {saveMessage}
          </div>
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        Logged in user ID: {userId || "Guest"}
      </div>
      <div>
        Initial Content:
        <pre>{initialContent}</pre>
      </div>
    </>
  );
};

export default Editor;
