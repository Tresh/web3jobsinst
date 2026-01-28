import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WJIReferralTerms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        <section className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              WJI Referral Program – Terms & Conditions
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 28, 2026
            </p>

            <div className="prose prose-neutral max-w-none space-y-10">
              {/* 1. Introduction Section */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The WJI Referral Program is a rewards initiative operated by Web3 Jobs Institute 
                  that allows approved scholarship participants to earn WJI (Web3 Jobs Institute credits) 
                  by referring new users to the platform.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This program is designed for active scholarship participants who wish to contribute 
                  to the growth of the Web3 Jobs Institute community while earning additional rewards.
                </p>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  By participating in the WJI Referral Program, you acknowledge that you have read, 
                  understood, and agreed to be bound by these Terms & Conditions. If you do not agree 
                  to these terms, you must not participate in the program.
                </p>
              </section>

              {/* 2. Full Terms & Conditions */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Terms & Conditions
                </h2>

                {/* Eligibility */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    1. Eligibility
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>You must be an approved scholarship participant with an active account in good standing.</li>
                    <li>You must have completed at least one approved scholarship task to activate your referral code.</li>
                    <li>You must be at least 18 years of age or the age of majority in your jurisdiction.</li>
                    <li>Employees, contractors, and affiliates of Web3 Jobs Institute may be excluded from participation.</li>
                    <li>Web3 Jobs Institute reserves the right to determine eligibility at its sole discretion.</li>
                  </ul>
                </div>

                {/* How Referrals Work */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    2. How Referrals Work
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Each eligible participant receives a unique referral code and shareable referral link.</li>
                    <li>New users must sign up using your referral link or enter your referral code during registration.</li>
                    <li>Referrals are tracked automatically by our system and appear on your referral dashboard.</li>
                    <li>Referral status progresses through stages: Pending → Approved or Failed.</li>
                    <li>You can share your referral link via social media, messaging apps, email, or any legitimate channel.</li>
                  </ul>
                </div>

                {/* Approval Rules */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    3. Referral Approval Rules
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>A referral is considered "Pending" once the referred user signs up using your code.</li>
                    <li>A referral is "Approved" only when the referred user completes their first approved scholarship task.</li>
                    <li>Referrals that do not complete any tasks remain in Pending status indefinitely.</li>
                    <li>Referrals flagged for fraud, abuse, or policy violations will be marked as "Failed" and will not generate rewards.</li>
                    <li>Web3 Jobs Institute has final authority on all referral approval decisions.</li>
                  </ul>
                </div>

                {/* WJI Rewards */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    4. WJI Rewards
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>You earn 1 WJI for each approved referral.</li>
                    <li>WJI is awarded automatically when a referred user's first task is approved.</li>
                    <li>WJI rewards are credited to your WJI balance and recorded in your transaction history.</li>
                    <li>WJI is an in-app credit system and has no cash value or guaranteed exchange rate.</li>
                    <li>WJI cannot be transferred between users, sold, or exchanged for fiat currency.</li>
                    <li>Future use cases for WJI will be announced by Web3 Jobs Institute at its discretion.</li>
                  </ul>
                </div>

                {/* Fraud & Abuse */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    5. Fraud & Abuse Prevention
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Web3 Jobs Institute employs automated and manual fraud detection systems. The following activities are strictly prohibited:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Creating fake accounts or referring yourself using multiple accounts.</li>
                    <li>Using bots, scripts, or automated systems to generate referrals.</li>
                    <li>Incentivizing signups through cash payments, gift cards, or other inducements not authorized by the program.</li>
                    <li>Referring users from the same IP address, device, or household without disclosure.</li>
                    <li>Manipulating referral tracking systems or exploiting technical vulnerabilities.</li>
                    <li>Providing false information during the signup or referral process.</li>
                    <li>Any other activity deemed fraudulent or abusive by Web3 Jobs Institute.</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    Violations may result in: referral rejection, WJI clawback, account suspension, or permanent ban from the platform.
                  </p>
                </div>

                {/* Program Modification Rights */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    6. Program Modification Rights
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Web3 Jobs Institute reserves the right to modify, suspend, or terminate the WJI Referral Program at any time without prior notice.</li>
                    <li>Changes to reward amounts, eligibility criteria, or program rules may occur at any time.</li>
                    <li>Continued participation after changes are posted constitutes acceptance of the modified terms.</li>
                    <li>Web3 Jobs Institute is not obligated to honor pending referrals if the program is terminated.</li>
                  </ul>
                </div>

                {/* Limitation of Liability */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    7. Limitation of Liability
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To the maximum extent permitted by applicable law:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Web3 Jobs Institute provides the referral program "as is" without warranties of any kind.</li>
                    <li>We do not guarantee uninterrupted access to the program or accurate tracking at all times.</li>
                    <li>We are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your participation.</li>
                    <li>Our total liability, if any, shall not exceed the value of WJI rewards you have earned.</li>
                    <li>You agree to indemnify and hold harmless Web3 Jobs Institute from any claims arising from your participation or violation of these terms.</li>
                  </ul>
                </div>

                {/* Governing Law */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    8. Governing Law
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms & Conditions are governed by and construed in accordance with applicable laws. 
                    Any disputes arising from or relating to the WJI Referral Program shall be resolved 
                    through binding arbitration or in the courts of competent jurisdiction, at the sole 
                    discretion of Web3 Jobs Institute. By participating, you waive any right to participate 
                    in class action lawsuits or class-wide arbitration.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    9. Contact Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions, concerns, or reports related to the WJI Referral Program, please contact 
                    us through our official social channels or visit our Contact page. Response times may 
                    vary and are not guaranteed.
                  </p>
                </div>
              </section>

              {/* 3. Risks & Disclaimers Section */}
              <section className="bg-secondary/30 border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Risks & Important Disclaimers
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Please read the following carefully before participating in the WJI Referral Program:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-3">
                  <li>
                    <strong>WJI is an in-app reward only.</strong> WJI is not money, not cryptocurrency, 
                    and not a financial instrument. It has no intrinsic monetary value.
                  </li>
                  <li>
                    <strong>No guarantee of rewards.</strong> Participation does not guarantee rewards, 
                    approval, or continued access to the program.
                  </li>
                  <li>
                    <strong>Referrals may be rejected or revoked.</strong> If fraud, abuse, or manipulation 
                    is detected, referrals may be rejected and previously awarded WJI may be clawed back.
                  </li>
                  <li>
                    <strong>Same-IP/device detection.</strong> Referrals from the same IP address or device 
                    may be recorded but are subject to additional scrutiny and may not be approved.
                  </li>
                  <li>
                    <strong>No guaranteed future value.</strong> WJI has no guaranteed future value, utility, 
                    or exchange rate. Future use cases are at the sole discretion of Web3 Jobs Institute.
                  </li>
                  <li>
                    <strong>Program rules may change.</strong> These terms, reward amounts, and program 
                    structure may change at any time without prior notice.
                  </li>
                  <li>
                    <strong>Participate at your own discretion.</strong> Users participate in the WJI Referral 
                    Program voluntarily and at their own risk.
                  </li>
                  <li>
                    <strong>Web3 Jobs Institute is not responsible for:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Loss of expected rewards due to program changes or termination</li>
                      <li>Technical errors, system downtime, or tracking failures</li>
                      <li>Account suspension or termination due to policy violations</li>
                      <li>Any financial or other losses arising from participation</li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* 4. Acceptance Notice */}
              <section className="border-t border-border pt-8">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                  <p className="text-foreground font-medium leading-relaxed">
                    By participating in the WJI Referral Program, you acknowledge that you have read, 
                    understood, and agreed to these Terms & Conditions and associated risks.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WJIReferralTerms;
