"use client";

import { Mail } from "@/components/mail/mail";
import { accounts, mails } from "@/components/mail/data";

export default function MailPage() {
  return (
    <div className="h-screen flex flex-col">
      <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />
    </div>
  );
}