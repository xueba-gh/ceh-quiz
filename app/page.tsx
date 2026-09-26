import Quiz from "@/components/Quiz";
import { questions } from "@/lib/questions";

export default function Home() {
  return <Quiz questions={questions} />;
}
