import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <Layout title="Terms of Service" subtitle="Last updated: February 2026">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome to Connecto. By accessing or using our platform, you agree to be bound by these 
              Terms of Service. If you disagree with any part of these terms, you may not access our service.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">1. Acceptance of Terms</h3>
            <p>
              By creating an account, accessing, or using Connecto, you accept and agree to be bound 
              by the terms and provisions of this agreement.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">2. User Accounts</h3>
            <p>
              When you create an account with us, you must provide accurate, complete, and updated information. 
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">3. User Conduct</h3>
            <p>
              You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Post harmful, threatening, or offensive content</li>
              <li>Engage in harassment, hate speech, or discrimination</li>
              <li>Distribute spam, malware, or viruses</li>
              <li>Impersonate others or provide false information</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-6">4. Content You Post</h3>
            <p>
              You retain ownership of content you post on Connecto. By posting content, you grant us 
              a worldwide, non-exclusive, royalty-free license to use, display, and reproduce your content.
            </p>
            <p className="mt-2">
              You represent and warrant that you own the content you post and have the right to grant this license.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">5. Intellectual Property</h3>
            <p>
              The Connecto platform, including its design, logos, and functionality, is owned by Connecto 
              and is protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">6. Termination</h3>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason, including breach of these Terms.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">7. Limitation of Liability</h3>
            <p>
              In no event shall Connecto, its officers, directors, employees, or agents be liable for 
              any indirect, incidental, special, consequential, or punitive damages arising out of 
              your use of the service.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">8. Disclaimer</h3>
            <p>
              The service is provided "as is" without warranty of any kind. We do not guarantee that 
              the service will be uninterrupted, secure, or error-free.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">9. Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, 
              without regard to its conflict of law provisions.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">10. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of 
              significant changes. Your continued use of the platform after such changes constitutes 
              acceptance of the new terms.
            </p>

            <h3 className="text-base font-medium text-foreground mt-6">11. Contact Information</h3>
            <p>
              For questions about these Terms of Service, please contact us at: 
              legal@connecto.app
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

export default Terms;
