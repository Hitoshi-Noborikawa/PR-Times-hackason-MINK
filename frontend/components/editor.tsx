"use client";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";
import Modal from "@/components/modal";
import { createClient } from "@/utils/supabase/client";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorProps {
  userId: string | undefined;
  articleId: string;
  initialContent: string;
  approved: boolean;
}

const Editor: React.FC<EditorProps> = ({ userId, articleId, initialContent, approved }) => {
  const [value, setValue] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState<boolean>(false); // 保存中フラグ
  const [isApproving, setIsApproving] = useState<boolean>(false); // 承認中フラグ
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // 保存状態のメッセージ
  const [showModal, setShowModal] = useState(false)

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
      setSaveMessage("保存に失敗しました");
    } else {
      setSaveMessage("保存完了!");
      setShowModal(true)
    }
  };

  const handleApprove = async () => {
    if (!userId) {
      setSaveMessage("User not logged in");
      return;
    }

    setIsApproving(true); // 承認開始
    setSaveMessage(null); // メッセージリセット

    const supabase = createClient();

    const { error } = await supabase
      .from("Articles")
      .update({ approved: true })
      .eq("id", articleId)
      .eq("user_id", userId);

    setIsApproving(false); // 承認終了

    if (error) {
      console.error("Error approving article:", error);
      setSaveMessage("Failed to approve the article");
    } else {
      setSaveMessage("リリース完了!");
      setShowModal(true)
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <MDEditor
            value={value}
            onChange={(val) => setValue(val || "")}
            height={500}
            style={{ width: "800px" }}
          />
        </div>
      </div>
      <div className="flex justify-end mt-3" style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
        { !approved &&
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          >
            {isApproving ? "リリース中..." : "リリース"}
          </button>
        }
      </div>
      <Modal
        message={saveMessage}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default Editor;
