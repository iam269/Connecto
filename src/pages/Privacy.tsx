import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <Layout title="Privacy Policy" subtitle="Last updated: February 2026">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h2 className="text-xl font-semibold mb-4">Privacy Policy</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              At Connecto, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account information (username, email, password)</li>
              <li>Profile information (name, bio, profile picture)</li>
              <li>Content you post (posts, comments, stories)</li>
              <li>Communications with other users</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">2. How We Use Your Information</h3>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience</li>
              <li>Send you notifications and updates</li>
              <li>Protect against fraud and abuse</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">3. Information Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to outside parties. 
              We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service providers who assist in our operations</li>
              <li>Other users, as you choose through your activities</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">4. Data Security</h3>
            <p>
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">5. Your Rights</h3>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of certain data collection</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">6. Cookies and Tracking</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and 
              hold certain information. You can instruct your browser to refuse all cookies.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">7. Children's Privacy</h3>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">8. Changes to This Policy</h3>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">9. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: 
              privacy@connecto.app
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/auth">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
