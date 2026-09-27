import Quiz from "@/components/Quiz";
import { questions, topics } from "@/lib/questions";

export default function Home() {
  return <Quiz questions={questions} topics={topics} />;
}
