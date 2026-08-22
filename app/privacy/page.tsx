import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How World Wrestling Council collects, uses, and protects your information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl uppercase tracking-wide text-white">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-wwc-grey-300">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated August 22, 2026"
        centered
        className="border-transparent bg-transparent"
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Section title="Overview">
          <p>
            This policy explains what information World Wrestling Council (&quot;WWC,&quot;
            &quot;we,&quot; &quot;us&quot;) collects when you use WWC+ at wwcnow.com, how we use
            it, and who we share it with. Creating an account or subscribing means you&apos;ve
            read and agree to this policy.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            <strong className="text-white">Account information.</strong> When you sign up, we
            collect your name, email address, and password. Your password is never stored in
            plain text — we store a salted, one-way hash of it and cannot recover the original.
          </p>
          <p>
            <strong className="text-white">Google sign-in.</strong> If you choose &quot;Continue
            with Google,&quot; Google shares your name, email address, and profile photo with us.
            We never see or store your Google password.
          </p>
          <p>
            <strong className="text-white">Payment and subscription information.</strong> Card
            details are entered directly into forms hosted by Stripe, our payment processor —
            they pass through Stripe&apos;s systems and never touch our servers. We store your
            subscription plan, its renewal date, a Stripe-issued customer reference, and a record
            of your billing history (item, amount, date, status).
          </p>
          <p>
            <strong className="text-white">Session and security data.</strong> Signing in sets a
            signed, encrypted session cookie so you stay logged in — it identifies your session,
            not you personally, to any third party. If you request a password reset, we
            temporarily store a hashed, single-use reset token that expires after 30 minutes.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>We use the information above to:</p>
          <ul className="list-disc pl-5">
            <li>Create and maintain your account, and keep you signed in</li>
            <li>Process subscription payments and renewals, and grant access accordingly</li>
            <li>Send transactional email, such as password reset links</li>
            <li>Respond to support requests</li>
            <li>Detect and prevent fraud or misuse of the service</li>
          </ul>
          <p>
            We do not sell your personal information, and we do not use third-party advertising
            or analytics trackers on this site.
          </p>
        </Section>

        <Section title="Who we share information with">
          <p>We share information only with the service providers that power WWC+:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-white">Stripe</strong> — payment processing and subscription
              billing
            </li>
            <li>
              <strong className="text-white">Supabase</strong> — our database provider, which
              stores your account and order records
            </li>
            <li>
              <strong className="text-white">Resend</strong> — delivery of transactional email
              (e.g. password resets)
            </li>
            <li>
              <strong className="text-white">Google</strong> — only if you choose to sign in with
              Google
            </li>
          </ul>
          <p>
            Each of these providers only receives what it needs to perform its function, and is
            bound by its own privacy and security obligations. We don&apos;t share your
            information with anyone else, except when required by law.
          </p>
        </Section>

        <Section title="Data retention and deletion">
          <p>
            We keep your account and billing records for as long as your account is active, and
            for a reasonable period afterward to meet legal and accounting obligations. You can
            request deletion of your account and associated personal data at any time by
            contacting us — some billing records may be retained longer where required by law
            (e.g. tax records).
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can review and update your account details from your account page at any time.
            You may also request a copy of the personal information we hold about you, or request
            that we delete it, by contacting us at the address below.
          </p>
        </Section>

        <Section title="Children's privacy">
          <p>
            WWC+ is not directed at children under 13, and we do not knowingly collect personal
            information from children under 13.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy from time to time. If we make material changes, we&apos;ll
            update the &quot;Last updated&quot; date above.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about this policy or your data? Email us at{" "}
            <a href="mailto:privacy@wwcnow.com" className="text-wwc-red hover:underline">
              privacy@wwcnow.com
            </a>
            .
          </p>
        </Section>
      </div>
    </>
  );
}
