"use client";

export function OpenInRadrButton({ conversationId }: { conversationId: string }) {
  return (
    <button
      onClick={() => {
        // TODO (Luke): confirm exact universal link URL scheme
        window.location.href = `radr://conversation/${conversationId}`;
      }}
      className="w-full py-3.5 rounded-2xl text-base font-semibold text-white cursor-pointer"
      style={{ background: "var(--radr-cobalt)", border: "none" }}
    >
      Open in Radr
    </button>
  );
}
