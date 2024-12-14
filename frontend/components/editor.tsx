"use client"; // クライアントコンポーネントであることを明示

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface EditorProps {
  userId: string | undefined;
  article: string;
}

const Editor: React.FC<EditorProps> = ({ userId, article }) => {
  const [value, setValue] = useState<string>(article);

  return (
    <>
      <div style={{ padding: "20px" }}>
        <MDEditor value={value} onChange={setValue} height={400} width={400} />
      </div>
      <div>
        Logged in user ID: {userId || "Guest"}
      </div>
      <div>
        {article}
      </div>
    </>
  );
};

export default Editor;
