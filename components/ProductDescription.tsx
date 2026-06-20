"use client";

import ReactMarkdown from "react-markdown";

export default function ProductDescription({ text }: { text: string }) {
  return (
    <div className="prose prose-sm prose-gray max-w-none mb-6 text-gray-600">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
