export default function CookiePolicy() {
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
          Cookie Policy
        </h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <p className="text-gray-600 text-lg mb-8">
            Last updated: February 2, 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-600">
              Cookies are small text files stored on your device when you visit a website. They help 
              websites remember your preferences and improve your experience. This policy explains 
              how Anthist uses cookies and similar technologies.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Cookie Philosophy</h2>
            <p className="text-gray-600 mb-4">
              Consistent with our mission to respect your attention and privacy, we use the absolute 
              minimum cookies necessary to provide our service. We do not use cookies for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Advertising or ad targeting</li>
              <li>Cross-site tracking</li>
              <li>Selling data to third parties</li>
              <li>Building marketing profiles</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies We Use</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the website and app to function. They cannot be disabled.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-900">Cookie</th>
                    <th className="text-left py-2 font-semibold text-gray-900">Purpose</th>
                    <th className="text-left py-2 font-semibold text-gray-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2">auth_token</td>
                    <td className="py-2">Keeps you logged in</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Maintains your session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">Security protection</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Preference Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies remember your preferences for a better experience.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-900">Cookie</th>
                    <th className="text-left py-2 font-semibold text-gray-900">Purpose</th>
                    <th className="text-left py-2 font-semibold text-gray-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2">theme</td>
                    <td className="py-2">Remembers your theme preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2">font_size</td>
                    <td className="py-2">Remembers text size preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600">
              We do not use third-party cookies for analytics or advertising. Any third-party services 
              we use (such as AWS Cognito for authentication) only set strictly necessary cookies 
              required for their functionality.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mobile App</h2>
            <p className="text-gray-600">
              Our mobile app uses local storage instead of cookies to store your preferences and 
              authentication state. This data never leaves your device except when syncing with 
              our servers, which is always encrypted.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings. Note that disabling essential 
              cookies may prevent the website from functioning properly.
            </p>
            <p className="text-gray-600">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time. Any changes will be posted on 
              this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about our use of cookies, please contact us at:<br />
              <a href="mailto:privacy@anthist.com" className="text-indigo-600 hover:underline">privacy@anthist.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
