import topicDifficulty from "../../../data/course/topic_difficulty.json";

type TopicDifficultyRow = {
  difficulty: number;
  core: boolean;
};

const difficultyMap = new Map<string, TopicDifficultyRow>(
  Object.entries(topicDifficulty as Record<string, TopicDifficultyRow>)
);

export const getTopicDifficulty = (topicId: string): number => {
  return difficultyMap.get(topicId)?.difficulty ?? 3;
};

export const isTopicCore = (topicId: string): boolean => {
  const row = difficultyMap.get(topicId);
  return row ? row.core : true;
};
