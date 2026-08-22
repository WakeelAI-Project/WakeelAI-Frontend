import React from "react";
import { AssistantChat } from "../features/company/components/assistant/assistant-chat";

export function AssistantPage() {
  return (
    <main className="flex h-full min-w-0 bg-(--bg-page) p-2 sm:p-4 lg:p-6">
      <div className="flex h-full w-full min-w-0">
        <AssistantChat className="w-full flex-1" />
      </div>
    </main>
  );
}
