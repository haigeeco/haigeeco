import { whatsappHref } from "@/lib/seo";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat WhatsApp"
      aria-label="Chat WhatsApp Gee Co."
      className="fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition hover:scale-105 hover:bg-[#1ebe5b] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:bottom-6 sm:right-6 print:hidden"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M16.04 4C9.96 4 5 8.95 5 15.03c0 2.12.6 4.1 1.64 5.79L5 28l7.36-1.93a11 11 0 0 0 3.68.63h.01c6.08 0 11.03-4.95 11.03-11.03C27.08 8.95 22.12 4 16.04 4zm0 20.13h-.01a9.1 9.1 0 0 1-4.64-1.27l-.33-.2-4.37 1.15 1.17-4.26-.21-.34a9.06 9.06 0 0 1-1.39-4.82c0-5.03 4.1-9.12 9.13-9.12 2.44 0 4.73.95 6.45 2.67a9.06 9.06 0 0 1 2.67 6.46c0 5.03-4.09 9.12-9.12 9.12zm5.01-6.83c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.62.14-.18.27-.71.89-.87 1.07-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.21-1.36-.82-.73-1.37-1.63-1.53-1.9-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.54-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.52-.08 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.11-.25-.18-.52-.32z" />
      </svg>
    </a>
  );
}
