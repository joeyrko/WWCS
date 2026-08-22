import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of WWC+.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl uppercase tracking-wide text-white">{title}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-wwc-grey-300">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated August 22, 2026"
        centered
        className="border-transparent bg-transparent"
      />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Section title="Agreement to terms">
          <p>
            These terms govern your access to and use of WWC+ (&quot;the Service&quot;),
            operated by World Wrestling Council (&quot;WWC,&quot; &quot;we,&quot; &quot;us&quot;)
            at wwcnow.com. By creating an account or subscribing, you agree to these terms. If you
            don&apos;t agree, please don&apos;t use the Service.
          </p>
        </Section>

        <Section title="Accounts">
          <p>
            You must provide accurate information when creating an account and keep your login
            credentials confidential. You&apos;re responsible for all activity that happens under
            your account. Let us know right away if you believe your account has been
            compromised.
          </p>
        </Section>

        <Section title="Subscriptions and billing">
          <p>
            Access to WWC+&apos;s live events and on-demand library requires an active paid
            subscription. Subscriptions renew automatically at the interval and price shown at
            checkout until canceled. You can cancel anytime from your account page — your access
            continues until the end of the billing period you&apos;ve already paid for.
          </p>
          <p>
            All charges are processed by Stripe. Prices are listed in U.S. dollars and are subject
            to change with notice on the Pricing page. Except where required by law, payments are
            non-refundable.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5">
            <li>Share your account credentials or resell access to the Service</li>
            <li>Copy, redistribute, or publicly broadcast content from the Service</li>
            <li>Attempt to circumvent access controls or payment requirements</li>
            <li>Use the Service in any way that violates applicable law</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these terms, with or without
            notice.
          </p>
        </Section>

        <Section title="Content">
          <p>
            All video content, footage, branding, and materials made available through WWC+ are
            owned by World Wrestling Council or its licensors and are protected by copyright and
            other intellectual property laws. Your subscription grants you a personal,
            non-transferable license to stream this content for personal, non-commercial viewing
            — nothing more.
          </p>
        </Section>

        <Section title="Disclaimers and limitation of liability">
          <p>
            The Service is provided &quot;as is,&quot; without warranties of any kind. We don&apos;t
            guarantee uninterrupted or error-free access. To the fullest extent permitted by law,
            WWC isn&apos;t liable for any indirect, incidental, or consequential damages arising
            from your use of the Service.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time. If we make material changes,
            we&apos;ll update the &quot;Last updated&quot; date above. Continuing to use the
            Service after a change means you accept the updated terms.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about these terms? Email us at{" "}
            <a href="mailto:support@wwcnow.com" className="text-wwc-red hover:underline">
              support@wwcnow.com
            </a>
            .
          </p>
        </Section>
      </div>
    </>
  );
}
