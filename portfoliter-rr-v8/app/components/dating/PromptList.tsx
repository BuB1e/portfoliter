import type { Prompt } from "~/lib/sections";

interface PromptListProps {
  prompts: Prompt[];
}

export function PromptList({ prompts }: PromptListProps) {
  return (
    <div className="grid gap-4">
      {prompts.map((prompt) => (
        <div key={prompt.question} className="rounded-[22px] bg-night-raised px-6 pt-5 pb-6">
          <p className="mb-1 text-[0.95rem] opacity-75">{prompt.question}</p>
          <p className="text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-semibold tracking-tight">{prompt.answer}</p>
        </div>
      ))}
    </div>
  );
}
