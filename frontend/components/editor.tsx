"use client"; // クライアントコンポーネントであることを明示

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const Editor = () => {
  const [value, setValue] = useState<string>("**Hello world!!!**");

  return (
    <div style={{ padding: "20px" }}>
        <MDEditor value={value} onChange={setValue} height={400} width={400} />
    </div>
  );
};

export default Editor;
