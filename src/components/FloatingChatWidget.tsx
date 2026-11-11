"use client";

import React, { useState, useEffect } from "react";

export interface ChatWidgetConfig {
  enabled?: boolean;
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  messengerEnabled?: boolean;
  messengerUsername?: string;
  autoOpen?: boolean;
  displayStyle?: "expandable" | "stacked";
  greetingText?: string;
}

interface FloatingChatWidgetProps {
  chatWidget?: ChatWidgetConfig | null;
  storeName?: string;
  primaryColor?: string;
}

function buildWhatsAppUrl(rawInput?: string, rawMessage?: string): string | null {
  if (!rawInput || !rawInput.trim()) return null;
  const trimmed = rawInput.trim();
  const message = (rawMessage || "").trim();

  if (/^https?:\/\//i.test(trimmed)) {
    if (!message) return trimmed;
    const separator = trimmed.includes("?") ? "&" : "?";
    return `${trimmed}${separator}text=${encodeURIComponent(message)}`;
  }

  let digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;

  // Normalize 11-digit Bangladeshi mobile numbers (01XXXXXXXXX -> 8801XXXXXXXXX)
  if (digits.length === 11 && digits.startsWith("01")) {
    digits = `88${digits}`;
  }

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function buildMessengerUrl(rawInput?: string): string | null {
  if (!rawInput || !rawInput.trim()) return null;
  const trimmed = rawInput.trim();

  if (/^https?:\/\/(www\.)?m\.me\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\/(www\.|m\.|web\.)?facebook\.com\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const profileId = parsed.searchParams.get("id");
      if (profileId) {
        return `https://m.me/${profileId.trim()}`;
      }
      const segments = parsed.pathname
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean);
      const pageHandle = segments[segments.length - 1];
      if (pageHandle && pageHandle.toLowerCase() !== "profile.php") {
        return `https://m.me/${pageHandle}`;
      }
    } catch {
      return trimmed;
    }
  }

  const cleanHandle = trimmed
    .replace(/^@/, "")
    .replace(/^m\.me\//i, "")
    .replace(/^facebook\.com\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();

  if (!cleanHandle) return null;
  return `https://m.me/${cleanHandle}`;
}

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.758.459 3.473 1.331 4.988L2 22l5.169-1.356a9.927 9.927 0 0 0 4.862 1.262h.004c5.515 0 9.969-4.453 9.969-9.969 0-2.663-1.037-5.168-2.92-7.051A9.905 9.905 0 0 0 12.031 2zm5.822 14.28c-.246.693-1.425 1.326-1.979 1.411-.506.077-1.147.109-1.852-.115-.428-.136-.977-.318-1.678-.621-2.952-1.275-4.881-4.246-5.028-4.443-.147-.197-1.2-1.597-1.2-3.047 0-1.45.759-2.163 1.029-2.458.27-.295.59-.369.786-.369.197 0 .393.002.565.01.181.009.424-.069.663.507.246.59.836 2.04.909 2.187.074.148.123.32.025.516-.098.197-.148.32-.295.492-.147.172-.31.384-.442.516-.148.147-.302.307-.13.602.172.295.764 1.26 1.64 2.041 1.127 1.004 2.077 1.316 2.372 1.463.295.148.467.123.639-.074.172-.197.737-.86.934-1.155.197-.295.393-.246.664-.148.27.098 1.721.811 2.016.959.295.147.492.221.565.344.074.123.074.713-.173 1.406z" />
  </svg>
);

const MessengerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.61.94 1.13.71l1.98-.87c.17-.07.36-.1.55-.06.91.25 1.87.38 2.88.38 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm5.95 7.56-2.93 4.65c-.47.74-1.47.92-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.93-4.65c.47-.74 1.47-.92 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChatBubbleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const SendArrowIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export default function FloatingChatWidget({
  chatWidget,
  storeName = "Store Support",
  primaryColor = "#5022C3",
}: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const isEnabled = Boolean(chatWidget?.enabled);
  const whatsappUrl = chatWidget?.whatsappEnabled
    ? buildWhatsAppUrl(chatWidget?.whatsappNumber, chatWidget?.whatsappMessage)
    : null;
  const messengerUrl = chatWidget?.messengerEnabled
    ? buildMessengerUrl(chatWidget?.messengerUsername)
    : null;

  const hasWhatsApp = Boolean(whatsappUrl);
  const hasMessenger = Boolean(messengerUrl);
  const activeCount = (hasWhatsApp ? 1 : 0) + (hasMessenger ? 1 : 0);

  useEffect(() => {
    if (!isEnabled || activeCount === 0) return;
    if (chatWidget?.autoOpen && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, activeCount, chatWidget?.autoOpen, hasAutoOpened]);

  // Conditional rendering: hide completely if disabled or no valid channel is configured
  if (!isEnabled || activeCount === 0) {
    return null;
  }

  const greetingText =
    chatWidget?.greetingText?.trim() || "Need help? Chat with us!";
  const displayStyle = chatWidget?.displayStyle || "expandable";

  // Mode 1: Direct Stacked Buttons in bottom-right corner
  if (displayStyle === "stacked") {
    return (
      <div
        data-nosnippet="true"
        className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-3"
      >
        {isOpen && (
          <div className="mb-0.5 bg-white text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{greetingText}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Dismiss greeting"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {hasMessenger && messengerUrl && (
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on Facebook Messenger"
            className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#006AFF] to-[#00B2FF] text-white shadow-[0_8px_25px_rgba(0,106,255,0.4)] hover:shadow-[0_10px_30px_rgba(0,106,255,0.55)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="hidden sm:block absolute right-16 whitespace-nowrap bg-gray-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md">
              Messenger
            </span>
            <MessengerIcon className="w-7 h-7" />
          </a>
        )}

        {hasWhatsApp && whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="hidden sm:block absolute right-16 whitespace-nowrap bg-gray-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md">
              WhatsApp
            </span>
            <WhatsAppIcon className="w-7 h-7" />
          </a>
        )}
      </div>
    );
  }

  // Mode 2: Expandable Popup Widget + Smart Direct Redirect
  const handleLauncherClick = () => {
    // If only 1 channel is enabled and autoOpen is false, redirect immediately on click
    if (activeCount === 1 && !chatWidget?.autoOpen) {
      const targetUrl = whatsappUrl || messengerUrl;
      if (targetUrl) {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
        return;
      }
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      data-nosnippet="true"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[9990] flex flex-col items-end"
    >
      {/* Popup Chat Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-[310px] sm:max-w-[330px] bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div
            className="px-4 py-3.5 text-white flex items-center justify-between"
            style={{
              background:
                hasWhatsApp && !hasMessenger
                  ? "linear-gradient(135deg, #128C7E, #25D366)"
                  : hasMessenger && !hasWhatsApp
                    ? "linear-gradient(135deg, #006AFF, #00B2FF)"
                    : `linear-gradient(135deg, ${primaryColor}, #1e1b4b)`,
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs shrink-0">
                <ChatBubbleIcon className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold truncate leading-tight">
                  {storeName}
                </h4>
                <p className="text-[11px] text-white/85 font-medium">
                  Online • Typically replies instantly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Close chat menu"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-gray-50/70 space-y-2.5">
            <div className="bg-white px-3.5 py-2.5 rounded-xl rounded-tl-xs border border-gray-100 shadow-2xs text-xs text-gray-700 font-medium leading-relaxed">
              {greetingText}
            </div>

            {hasWhatsApp && whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-gray-200/80 hover:border-emerald-300 transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      WhatsApp
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Chat with us on WhatsApp
                    </p>
                  </div>
                </div>
                <SendArrowIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            )}

            {hasMessenger && messengerUrl && (
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50/60 border border-gray-200/80 hover:border-blue-300 transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#006AFF] to-[#00B2FF] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <MessengerIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Messenger
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Message us on Facebook
                    </p>
                  </div>
                </div>
                <SendArrowIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Launcher Button */}
      <button
        type="button"
        onClick={handleLauncherClick}
        aria-label="Open customer support chat"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        style={{
          background: isOpen
            ? "#1f2937"
            : hasWhatsApp && !hasMessenger
              ? "#25D366"
              : hasMessenger && !hasWhatsApp
                ? "linear-gradient(135deg, #006AFF, #00B2FF)"
                : `linear-gradient(135deg, #25D366 0%, #0084FF 100%)`,
        }}
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>

        {isOpen ? (
          <CloseIcon className="w-6 h-6" />
        ) : hasWhatsApp && !hasMessenger ? (
          <WhatsAppIcon className="w-7 h-7" />
        ) : hasMessenger && !hasWhatsApp ? (
          <MessengerIcon className="w-7 h-7" />
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            <WhatsAppIcon className="w-5 h-5 -translate-x-1.5 -translate-y-1" />
            <MessengerIcon className="w-5 h-5 translate-x-1.5 translate-y-1" />
          </div>
        )}
      </button>
    </div>
  );
}
