// app/posts/new/page.tsx
import PostComposer from "@/components/PostComposer";

export default function NewPostPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">新規質問（Q&A）</h1>
      <PostComposer />
    </div>
  );
}
