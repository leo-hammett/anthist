export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </a>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <p className="text-gray-600 text-lg mb-8">
            Last updated: February 2, 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              Anthist ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              mobile application and website (collectively, the "Service").
            </p>
            <p className="text-gray-600">
              We believe privacy is a fundamental right, not a premium feature. As an open-source project, 
              our code is publicly auditable, and we operate with full transparency.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Account Information:</strong> Email address when you create an account</li>
              <li><strong>Content:</strong> URLs and content you choose to save to your anthology</li>
              <li><strong>Preferences:</strong> Theme selections and reading preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Usage Data:</strong> How you interact with content (reading time, skips) to power your personal algorithm</li>
              <li><strong>Device Information:</strong> Device type and operating system for app compatibility</li>
              <li><strong>Log Data:</strong> Error logs to improve the service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information exclusively to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Personalize your content feed based on your engagement patterns</li>
              <li>Process content you import via email or share functionality</li>
              <li>Send important service updates (you can opt out anytime)</li>
              <li>Improve the Service based on aggregated, anonymized usage patterns</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Don't Do</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We <strong>never</strong> sell your personal data</li>
              <li>We <strong>never</strong> share your reading habits with third parties</li>
              <li>We <strong>never</strong> use your data for advertising</li>
              <li>We <strong>never</strong> track you across other apps or websites</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
            <p className="text-gray-600 mb-4">
              Your data is stored securely on Amazon Web Services (AWS) infrastructure with encryption 
              at rest and in transit. We use industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>TLS encryption for all data transmission</li>
              <li>Encrypted database storage</li>
              <li>Regular security audits</li>
              <li>Minimal data retention policies</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-600 mb-4">We use the following third-party services:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>AWS:</strong> Cloud infrastructure and authentication</li>
              <li><strong>OpenAI:</strong> Content embeddings for personalization (content is processed, not stored by OpenAI)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Delete:</strong> Request deletion of your account and all associated data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Correct:</strong> Update or correct your personal information</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@anthist.com" className="text-indigo-600 hover:underline">privacy@anthist.com</a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-600">
              Our Service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:<br />
              <a href="mailto:privacy@anthist.com" className="text-indigo-600 hover:underline">privacy@anthist.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
