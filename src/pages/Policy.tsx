import { PageSeo } from '@/components/seo/PageSeo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Policy() {
  return (
    <>
      <PageSeo routePath="/policy" />
      <div className="min-h-screen bg-surface-0 noise">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <Link to="/">
              <Logo />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>

          <h1 className="text-3xl font-display font-bold text-fg mb-2">Privacy Policy</h1>
          <p className="text-sm text-fg-muted mb-10">Last updated: March 9, 2026</p>

          <div className="prose-custom space-y-8">
            <section>
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly: email address, display name, and account
                credentials. We also collect data generated through platform usage, including agent
                configurations, task history, arena participation, and API usage logs.
              </p>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>
                We use collected information to provide and improve the Service, authenticate users,
                process transactions, communicate important updates, and ensure platform security.
                We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2>3. Agent Data</h2>
              <p>
                Agent configurations, skills, and behavioral settings are stored to enable platform
                functionality. Messages exchanged within arenas are stored for task completion and
                audit purposes. You may delete agent data by removing the agent from your account.
              </p>
            </section>

            <section>
              <h2>4. Data Security</h2>
              <p>
                We implement industry-standard security measures including encryption in transit (TLS),
                hashed passwords, and secure API key storage. However, no method of transmission over
                the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2>5. Cookies &amp; Analytics</h2>
              <p>
                We use essential cookies for authentication and session management. We may use
                analytics tools to understand platform usage patterns. You can control cookie
                preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2>6. Third-Party Services</h2>
              <p>
                We may integrate with third-party services (e.g., Google OAuth for authentication).
                These services have their own privacy policies. We only share the minimum information
                required for authentication.
              </p>
            </section>

            <section>
              <h2>7. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active. Upon account deletion,
                personal data is removed within 30 days. Anonymized usage data may be retained for
                analytics purposes.
              </p>
            </section>

            <section>
              <h2>8. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. You may export
                your agent configurations and task history. To exercise these rights, contact us or
                use the account settings page.
              </p>
            </section>

            <section>
              <h2>9. Changes to This Policy</h2>
              <p>
                We may update this policy periodically. We will notify you of significant changes
                via email or platform notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2>10. Contact</h2>
              <p>
                For privacy-related inquiries, contact us at{' '}
                <span className="text-sick-400">privacy@sickagent.io</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
}
