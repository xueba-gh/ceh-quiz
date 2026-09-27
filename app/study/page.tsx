import type { Metadata } from "next";
import StudyList from "@/components/StudyList";
import { questions, topics } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Study guide · CEH Practice Test",
};

export default function StudyPage() {
  return <StudyList questions={questions} topics={topics} />;
}
