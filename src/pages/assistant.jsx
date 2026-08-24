import React from "react";
import { AssistantChat } from "../features/company/components/assistant/assistant-chat";

export function AssistantPage() {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-(--bg-page) p-2 sm:p-4 lg:p-6">
      <div className="flex min-h-0 min-w-0 h-full w-full flex-1">
        <AssistantChat className="h-full w-full min-h-0 flex-1" />
      </div>
    </main>
  );
}
