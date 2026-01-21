import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        <section className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 21, 2026
            </p>

            <div className="prose prose-neutral max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Web3 Jobs Institute's services, you agree to be bound by 
                  these Terms of Service and all applicable laws and regulations. If you do not 
                  agree with any of these terms, you are prohibited from using our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  2. Use of Services
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to use our services only for lawful purposes and in accordance with 
                  these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Use our services in any way that violates applicable laws</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Share your account credentials with others</li>
                  <li>Reproduce or redistribute course materials without permission</li>
                  <li>Use our platform for any commercial purpose without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  3. Scholarship Program
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enrollment in our scholarship program is subject to availability and eligibility 
                  requirements. We reserve the right to accept or reject applications at our 
                  discretion. Scholarship recipients must adhere to program guidelines and 
                  participation requirements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  4. Intellectual Property
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, including courses, materials, logos, and branding, is the property 
                  of Web3 Jobs Institute and is protected by intellectual property laws. You may 
                  not copy, modify, or distribute our content without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  5. User Content
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of any content you submit to our platform. By submitting 
                  content, you grant us a non-exclusive license to use, display, and distribute 
                  your content in connection with our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  6. Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are provided "as is" without warranties of any kind. We do not 
                  guarantee employment or income as a result of completing our courses or programs. 
                  Success depends on individual effort and market conditions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  7. Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Web3 Jobs Institute shall not be liable for any indirect, incidental, special, 
                  or consequential damages resulting from your use of our services or inability 
                  to access them.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  8. Changes to Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users 
                  of significant changes. Continued use of our services after changes constitutes 
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  9. Contact
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us through our 
                  official social channels or visit our Contact page.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
