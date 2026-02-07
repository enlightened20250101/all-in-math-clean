"use server";

type PostInput = {
  title: string;
  body_md: string;
  level?: string;
  tags?: string[];
  images?: string[];
};

type FormatResult = {
  title: string;
  body_md: string;
  summary: string;
  tagSuggestions?: string[];
};

type SuggestResult = {
  id: number;
  title: string;
  created_at: string;
  tags: string[];
  score: number;
};

type CreatePostResult = {
  id: number;
};

export async function action_formatPost(payload: PostInput): Promise<FormatResult> {
  throw new Error("action_formatPost is not implemented.");
}

export async function action_semanticSearch(payload: PostInput): Promise<SuggestResult[]> {
  throw new Error("action_semanticSearch is not implemented.");
}

export async function action_createPost(payload: PostInput): Promise<CreatePostResult> {
  throw new Error("action_createPost is not implemented.");
}

export async function action_voteComment(commentId: number, delta: 1 | -1): Promise<void> {
  throw new Error("action_voteComment is not implemented.");
}

export async function action_markBestAnswer(commentId: number): Promise<void> {
  throw new Error("action_markBestAnswer is not implemented.");
}
