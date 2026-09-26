import data from "@/data/questions.json";

export type Option = { key: string; text: string };

export type Question = {
  id: number;
  question: string;
  options: Option[];
  answer: string;
  explanation: string;
  disputed?: boolean;
};

export const questions = data as Question[];
