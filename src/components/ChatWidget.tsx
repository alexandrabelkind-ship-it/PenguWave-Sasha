import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  from: "user" | "assistant";
  text: string;
}

const GREETING: ChatMessage = {
  from: "assistant",
  text: "Hi! I'm Pengu, your AI security assistant (demo). Ask me about an event, a severity level, or how to investigate a threat.",
};

// Canned demo responses — this is a prototype, so replies are scripted rather
// than coming from a real model. Keyword matching keeps it feeling responsive.
const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /brute.?force|ssh|login/i,
    reply:
      "Brute-force attempts usually mean an exposed service. I'd recommend rate-limiting auth, enforcing MFA, and blocking the offending source IP at the firewall.",
  },
  {
    match: /critical|severity|prioriti/i,
    reply:
      "Triage by severity: handle CRITICAL and HIGH first, since they're most likely to represent active compromise. Use the Dashboard's Severity Mix chart to see the breakdown.",
  },
  {
    match: /mimikatz|credential/i,
    reply:
      "Credential-theft tools like mimikatz are a strong indicator of lateral movement. Isolate the host, rotate affected credentials, and review recent logons.",
  },
  {
    match: /tor|exfil|outbound/i,
    reply:
      "Unusual outbound traffic (e.g. to Tor exit nodes) can signal exfiltration. Inspect the volume and destination, and consider isolating the asset.",
  },
];

function replyFor(input: string): string {
  return (
    CANNED.find((c) => c.match.test(input))?.reply ??
    "Thanks for the question! In the full product I'll analyze your event data and walk you through remediation steps. For now, try asking about brute-force, mimikatz, or how to prioritize by severity."
  );
}

/** Slide-in demo chat overlay — a prototype for a future AI security assistant. */
export default function ChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep the latest message in view.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "assistant", text: replyFor(text) },
    ]);
    setInput("");
  };

  return (
    <div className="chat-widget" role="dialog" aria-label="AI security assistant">
      <div className="chat-header">
        <span className="chat-title">
          <span aria-hidden="true">🐧</span> Pengu Assistant
          <span className="chat-badge">demo</span>
        </span>
        <button className="chat-close" onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-msg-${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="chat-input-row" onSubmit={send}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a threat or event…"
          aria-label="Message"
          autoFocus
        />
        <button type="submit" className="btn-primary btn-sm" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
