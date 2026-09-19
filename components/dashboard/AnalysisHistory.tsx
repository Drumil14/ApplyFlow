"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAnalysisHistory } from "@/hooks/use-analysis";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchScore } from "@/components/ui/MatchScore";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { formatDateShort } from "@/lib/utils";
import type { AnalysisHistoryItem } from "@/types/app";

export function AnalysisHistory({ initialAnalyses }: { initialAnalyses: AnalysisHistoryItem[] }) {
  const { data: analyses = [] } = useAnalysisHistory(initialAnalyses);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Analysis history</h2>
        <p className="mt-1 text-sm text-content-secondary">
          Every analysis you run is saved here. Select one to revisit its saved result.
        </p>
      </div>

      {analyses.length ? (
        <ul className="space-y-2">
          {analyses.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <li key={item.id}>
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="flex w-full items-center gap-4 p-4 text-left outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent/50"
                  >
                    <MatchScore score={item.matchScore} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.title ?? "Untitled role"}</div>
                      <div className="mt-1 text-xs text-content-tertiary">
                        {item.seniorityLevel} · {formatDateShort(item.createdAt)}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-content-tertiary transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <div className="space-y-4 border-t border-hairline p-4">
                      <div>
                        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-content-tertiary">
                          Skills the role required
                        </h3>
                        {item.requiredSkills.length ? (
                          <div className="flex flex-wrap gap-2">
                            {item.requiredSkills.map((skill) => (
                              <SkillBadge key={skill} tone="neutral">
                                {skill}
                              </SkillBadge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-content-tertiary">No skills were detected.</p>
                        )}
                      </div>

                      {item.resumeSuggestions.length ? (
                        <div>
                          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-content-tertiary">
                            Resume suggestions
                          </h3>
                          <ul className="space-y-2">
                            {item.resumeSuggestions.map((suggestion) => (
                              <li
                                key={suggestion}
                                className="rounded-md border border-hairline bg-surface-inset p-3 text-sm leading-6 text-content-secondary"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No analyses yet"
          description="Run your first analysis above and it will appear here so you can compare roles over time."
        />
      )}
    </div>
  );
}
