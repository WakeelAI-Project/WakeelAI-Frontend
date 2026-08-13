import React from "react";
import { AssistantChat } from "../features/company/components/assistant/assistant-chat";

export function AssistantPage() {
  return (
    <main className="flex min-h-full bg-(--bg-page) p-3 sm:p-4 lg:p-6">
      <div className="flex min-h-[calc(100vh-8.5rem)] w-full">
        <AssistantChat className="w-full flex-1" />
      </div>
    </main>
  );
}
