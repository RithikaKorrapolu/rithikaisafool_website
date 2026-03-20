"use client";

import { useState } from 'react';

export default function LegalPage() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [mobileTermsOpen, setMobileTermsOpen] = useState(false);

  return (
    <main className="min-h-screen pt-[140px] md:pt-[145px] lg:pt-[155px] pb-20 px-6 font-[family-name:var(--font-inter)]" style={{ backgroundColor: '#F2F2F2', color: 'black' }}>
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <h1 className="text-center mb-4 md:mb-8" style={{ fontSize: '3.38rem', fontWeight: 'bold' }}>Legal + FAQ Document</h1>

        {/* Introduction */}
        <p className="text-lg mb-8">
          Hi, this is a small, independent run creative studio - basically just a lady (me) doing weird shit in her apartment. If you have any questions or are upset, please do reach out at <a href="mailto:support@rithikaisafool.com" className="underline hover:text-gray-600">support@rithikaisafool.com</a> and I'll try to get back to you ASAP. Generally, I'm a big fan of talking things through and trying to make things right so hopefully we can sort out everything you need.
        </p>

        {/* Shipping Section */}
        <h2 className="text-2xl font-bold mb-4">Shipping</h2>
        <ul className="list-disc ml-8 mb-8 text-lg space-y-2">
          <li>We currently <strong>ship to the United States.</strong></li>
          <li>Orders are typically processed within 3-5 business days.</li>
          <li>You'll receive a confirmation email with tracking once your order ships.</li>
          <li>We're not responsible for delays or packages marked as delivered but lost or stolen after delivery, though we'll always try to help.</li>
        </ul>

        {/* Returns & Refunds Section */}
        <h2 className="text-2xl font-bold mb-4">Returns & Refunds</h2>
        <ul className="list-disc ml-8 mb-8 text-lg space-y-2">
          <li><strong>All sales are final</strong> due to the limited, handmade nature of our items.</li>
          <li>If your order arrives damaged or incorrect, email us within 7 days of delivery with photos. Approved issues will be refunded or replaced at our discretion.</li>
        </ul>

        {/* Privacy Section */}
        <h2 className="text-2xl font-bold mb-4">Privacy</h2>
        <p className="text-lg mb-2">We keep this simple.</p>
        <ul className="list-disc ml-8 mb-8 text-lg space-y-2">
          <li>We collect only what's needed to process orders or send emails (name, email, address).</li>
          <li>Payments are handled securely by Shopify and Stripe — we don't store your payment details.</li>
          <li>We don't sell your data.</li>
          <li>You can unsubscribe from emails anytime.</li>
        </ul>

        {/* FAQ Section */}
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <ol className="ml-8 mb-8 text-lg space-y-4">
          <li>
            <strong>Are items limited edition?</strong>
            <br />
            Often, yes. Many pieces are one-of-a-kind or produced in small runs.
          </li>
          <li>
            <strong>Do you take custom orders?</strong>
            <br />
            Sometimes — email us and we'll let you know.
          </li>
          <li>
            <strong>Can I change or cancel my order?</strong>
            <br />
            If it hasn't shipped yet, email us ASAP and we'll try.
          </li>
          <li>
            <strong>How can I contact you?</strong>
            <br />
            Email support@rithikaisafool.com
          </li>
        </ol>

        {/* Terms Section */}
        <h2 className="text-2xl font-bold mb-4">Terms</h2>
        <p className="text-lg mb-2">By using this site or purchasing from us, you agree to the following:</p>
        <ul className="list-disc ml-8 mb-8 text-lg space-y-2">
          <li>All content and products belong to Rithika is a Fool unless stated otherwise.</li>
          <li>Purchases are for personal use only.</li>
          <li>We may update these terms or site content at any time.</li>
          <li>We reserve the right to refuse service or cancel orders when necessary.</li>
        </ul>

        {/* Full Privacy Policy Section - Collapsible */}
        <div className="mb-8">
          <button
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="flex items-center justify-between w-full text-left text-2xl font-bold py-4 border-t border-gray-300"
          >
            <span>Full Privacy Policy</span>
            <span className="text-3xl font-light">{privacyOpen ? '−' : '+'}</span>
          </button>

          {privacyOpen && (
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4">Last updated: January 7, 2026</p>

              <p className="text-lg mb-6">
          Rithika is a Fool! operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). Rithika is a Fool! is powered by Shopify, which enables us to provide the Services to you. This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our Terms of Service and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
        </p>

        <p className="text-lg mb-6">
          Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described in this Privacy Policy.
        </p>

        <h3 className="text-xl font-bold mb-3">Personal Information We Collect or Process</h3>
        <p className="text-lg mb-4">
          When we use the term "personal information," we are referring to information that identifies or can reasonably be linked to you or another person. Personal information does not include information that is collected anonymously or that has been de-identified, so that it cannot identify or be reasonably linked to you. We may collect or process the following categories of personal information, including inferences drawn from this personal information, depending on how you interact with the Services, where you live, and as permitted or required by applicable law:
        </p>
        <ul className="list-disc ml-8 mb-6 text-lg space-y-2">
          <li><strong>Contact details</strong> including your name, address, billing address, shipping address, phone number, and email address.</li>
          <li><strong>Financial information</strong> including credit card, debit card, and financial account numbers, payment card information, financial account information, transaction details, form of payment, payment confirmation and other payment details.</li>
          <li><strong>Account information</strong> including your username, password, security questions, preferences and settings.</li>
          <li><strong>Transaction information</strong> including the items you view, put in your cart, add to your wishlist, or purchase, return, exchange or cancel and your past transactions.</li>
          <li><strong>Communications with us</strong> including the information you include in communications with us, for example, when sending a customer support inquiry.</li>
          <li><strong>Device information</strong> including information about your device, browser, or network connection, your IP address, and other unique identifiers.</li>
          <li><strong>Usage information</strong> including information regarding your interaction with the Services, including how and when you interact with or navigate the Services.</li>
        </ul>

        <h3 className="text-xl font-bold mb-3">Personal Information Sources</h3>
        <p className="text-lg mb-4">We may collect personal information from the following sources:</p>
        <ul className="list-disc ml-8 mb-6 text-lg space-y-2">
          <li><strong>Directly from you</strong> including when you create an account, visit or use the Services, communicate with us, or otherwise provide us with your personal information;</li>
          <li><strong>Automatically through the Services</strong> including from your device when you use our products or services or visit our websites, and through the use of cookies and similar technologies;</li>
          <li><strong>From our service providers</strong> including when we engage them to enable certain technology and when they collect or process your personal information on our behalf;</li>
          <li><strong>From our partners or other third parties.</strong></li>
        </ul>

        <h3 className="text-xl font-bold mb-3">How We Use Your Personal Information</h3>
        <p className="text-lg mb-4">Depending on how you interact with us or which of the Services you use, we may use personal information for the following purposes:</p>
        <ul className="list-disc ml-8 mb-6 text-lg space-y-2">
          <li><strong>Provide, Tailor, and Improve the Services.</strong> We use your personal information to provide you with the Services, including to perform our contract with you, to process your payments, to fulfill your orders, to remember your preferences and items you are interested in, to send notifications to you related to your account, to process purchases, returns, exchanges or other transactions, to create, maintain and otherwise manage your account, to arrange for shipping, to facilitate any returns and exchanges, to enable you to post reviews, and to create a customized shopping experience for you, such as recommending products related to your purchases. This may include using your personal information to better tailor and improve the Services.</li>
          <li><strong>Marketing and Advertising.</strong> We use your personal information for marketing and promotional purposes, such as to send marketing, advertising and promotional communications by email, text message or postal mail, and to show you online advertisements for products or services on the Services or other websites, including based on items you previously have purchased or added to your cart and other activity on the Services.</li>
          <li><strong>Security and Fraud Prevention.</strong> We use your personal information to authenticate your account, to provide a secure payment and shopping experience, detect, investigate or take action regarding possible fraudulent, illegal, unsafe, or malicious activity, protect public safety, and to secure our services. If you choose to use the Services and register an account, you are responsible for keeping your account credentials safe. We highly recommend that you do not share your username, password or other access details with anyone else.</li>
          <li><strong>Communicating with You.</strong> We use your personal information to provide you with customer support, to be responsive to you, to provide effective services to you and to maintain our business relationship with you.</li>
          <li><strong>Legal Reasons.</strong> We use your personal information to comply with applicable law or respond to valid legal process, including requests from law enforcement or government agencies, to investigate or participate in civil discovery, potential or actual litigation, or other adversarial legal proceedings, and to enforce or investigate potential violations of our terms or policies.</li>
        </ul>

        <h3 className="text-xl font-bold mb-3">How We Disclose Personal Information</h3>
        <p className="text-lg mb-4">In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:</p>
        <ul className="list-disc ml-8 mb-6 text-lg space-y-2">
          <li>With Shopify, vendors and other third parties who perform services on our behalf (e.g. IT management, payment processing, data analytics, customer support, cloud storage, fulfillment and shipping).</li>
          <li>With business and marketing partners to provide marketing services and advertise to you. For example, we use Shopify to support personalized advertising with third-party services based on your online activity with different merchants and websites. Our business and marketing partners will use your information in accordance with their own privacy notices. Depending on where you reside, you may have a right to direct us not to share information about you to show you targeted advertisements and marketing based on your online activity with different merchants and websites.</li>
          <li>When you direct, request us or otherwise consent to our disclosure of certain information to third parties, such as to ship you products or through your use of social media widgets or login integrations.</li>
          <li>With our affiliates or otherwise within our corporate group.</li>
          <li>In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service or policies, and to protect or defend the Services, our rights, and the rights of our users or others.</li>
        </ul>

        <h3 className="text-xl font-bold mb-3">Relationship with Shopify</h3>
        <p className="text-lg mb-6">
          The Services are hosted by Shopify, which collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in countries other than where you reside, in order to provide and improve the Services for you. In addition, to help protect, grow, and improve our business, we use certain Shopify enhanced features that incorporate data and information obtained from your interactions with our Store, along with other merchants and with Shopify. To provide these enhanced features, Shopify may make use of personal information collected about your interactions with our store, along with other merchants, and with Shopify. In these circumstances, Shopify is responsible for the processing of your personal information, including for responding to your requests to exercise your rights over use of your personal information for these purposes. To learn more about how Shopify uses your personal information and any rights you may have, you can visit the <a href="https://www.shopify.com/legal/privacy" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Shopify Consumer Privacy Policy</a>. Depending on where you live, you may exercise certain rights with respect to your personal information at the <a href="https://privacy.shopify.com" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">Shopify Privacy Portal</a>.
        </p>

        <h3 className="text-xl font-bold mb-3">Third Party Websites and Links</h3>
        <p className="text-lg mb-6">
          The Services may provide links to websites or other online platforms operated by third parties. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
        </p>

        <h3 className="text-xl font-bold mb-3">Children's Data</h3>
        <p className="text-lg mb-6">
          The Services are not intended to be used by children, and we do not knowingly collect any personal information about children under the age of majority in your jurisdiction. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted. As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we "share" or "sell" (as those terms are defined in applicable law) personal information of individuals under 16 years of age.
        </p>

        <h3 className="text-xl font-bold mb-3">Security and Retention of Your Information</h3>
        <p className="text-lg mb-6">
          Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee "perfect security." In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us. How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide you with Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
        </p>

        <h3 className="text-xl font-bold mb-3">Your Rights and Choices</h3>
        <p className="text-lg mb-4">Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.</p>
        <ul className="list-disc ml-8 mb-6 text-lg space-y-2">
          <li><strong>Right to Access / Know.</strong> You may have a right to request access to personal information that we hold about you.</li>
          <li><strong>Right to Delete.</strong> You may have a right to request that we delete personal information we maintain about you.</li>
          <li><strong>Right to Correct.</strong> You may have a right to request that we correct inaccurate personal information we maintain about you.</li>
          <li><strong>Right of Portability.</strong> You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions.</li>
          <li><strong>Right to Opt out of Sale or Sharing for Targeted Advertising.</strong> Depending on where you reside, you may have a right to opt out of the "sale" or "share" of your personal information or to opt out of the processing of your personal information for purposes considered to be "targeted advertising", as defined in applicable privacy laws. Please note that if you visit our website with the Global Privacy Control opt-out preference signal enabled, depending on where you are, we will automatically treat this as a request to opt-out for the device and browser that you use to visit the website. If we are able to associate the device sending the signal to a Shopify account, we will apply the opt out request to the account as well. To learn more about Global Privacy Control, you can visit <a href="https://globalprivacycontrol.org/" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">https://globalprivacycontrol.org/</a>. Other than the Global Privacy Control, we do not recognize other "Do Not Track" signals that may be sent from your web browser or device.</li>
          <li><strong>Managing Communication Preferences.</strong> We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or orders that you have made.</li>
        </ul>
        <p className="text-lg mb-6">
          You may exercise any of these rights where indicated on the Services or by contacting us using the contact details provided below. To learn more about how Shopify uses your personal information and any rights you may have, including rights related to data processed by Shopify, you can visit <a href="https://privacy.shopify.com/en" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">https://privacy.shopify.com/en</a>. We will not discriminate against you for exercising any of these rights. We may need to verify your identity before we can process your requests, as permitted or required under applicable law. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
        </p>

        <h3 className="text-xl font-bold mb-3">Complaints</h3>
        <p className="text-lg mb-6">
          If you have complaints about how we process your personal information, please contact us using the contact details provided below. Depending on where you live, you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority.
        </p>

        <h3 className="text-xl font-bold mb-3">International Transfers</h3>
        <p className="text-lg mb-6">
          Please note that we may transfer, store and process your personal information outside the country you live in. If we transfer your personal information out of the European Economic Area or the United Kingdom, we will rely on recognized transfer mechanisms like the European Commission's Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
        </p>

        <h3 className="text-xl font-bold mb-3">Changes to This Privacy Policy</h3>
        <p className="text-lg mb-6">
          We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on this website, update the "Last updated" date and provide notice as required by applicable law.
        </p>

        <h3 className="text-xl font-bold mb-3">Contact</h3>
              <p className="text-lg mb-8">
                Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please email us at <a href="mailto:rkrox24@gmail.com" className="underline hover:text-gray-600">rkrox24@gmail.com</a> or contact us at 10 Eisenhower Drive, Robbinsville Township, NJ, 08691, US.
              </p>
            </div>
          )}
        </div>

        {/* Mobile Terms of Service Section - Collapsible */}
        <div className="mb-8">
          <button
            onClick={() => setMobileTermsOpen(!mobileTermsOpen)}
            className="flex items-center justify-between w-full text-left text-2xl font-bold py-4 border-t border-gray-300"
          >
            <span>Mobile Terms of Service</span>
            <span className="text-3xl font-light">{mobileTermsOpen ? '−' : '+'}</span>
          </button>

          {mobileTermsOpen && (
            <div className="pt-4">
              <p className="text-lg font-bold mb-2">Rithika is a Fool!</p>
              <p className="text-sm text-gray-600 mb-4">Last updated: Feb. 5, 2026</p>

              <p className="text-lg mb-6">
                The Rithika is a Fool! mobile message service (the "Service") is operated by Rithika is a Fool! ("Rithika is a Fool!", "we", or "us"). Your use of the Service constitutes your agreement to these terms and conditions ("Mobile Terms"). We may modify or cancel the Service or any of its features without notice. To the extent permitted by applicable law, we may also modify these Mobile Terms at any time and your continued use of the Service following the effective date of any such changes shall constitute your acceptance of such changes.
              </p>

              <p className="text-lg mb-6">
                By consenting to Rithika is a Fool!'s SMS/text messaging service, you agree to receive recurring SMS/text messages from and on behalf of Rithika is a Fool! through your wireless provider to the mobile number you provided, even if your mobile number is registered on any state or federal Do Not Call list. Text messages may be sent using an automatic telephone dialing system or other technology. Service-related messages may include updates, alerts, and information (e.g., order updates, account alerts, etc.). Promotional messages may include promotions, specials, and other marketing offers (e.g., cart reminders).
              </p>

              <p className="text-lg mb-6">
                You understand that you do not have to sign up for this program in order to make any purchases, and your consent is not a condition of any purchase with Rithika is a Fool!. Your participation in this program is completely voluntary.
              </p>

              <p className="text-lg mb-6">
                We do not charge for the Service, but you are responsible for all charges and fees associated with text messaging imposed by your wireless provider. Message frequency varies. Message and data rates may apply. Check your mobile plan and contact your wireless provider for details. You are solely responsible for all charges related to SMS/text messages, including charges from your wireless provider.
              </p>

              <p className="text-lg mb-6">
                You may opt-out of the Service at any time. Text the single keyword command STOP to +18559451273 or click the unsubscribe link (where available) in any text message to cancel. You'll receive a one-time opt-out confirmation text message. No further messages will be sent to your mobile device, unless initiated by you. If you have subscribed to other Rithika is a Fool! mobile message programs and wish to cancel, except where applicable law requires otherwise, you will need to opt out separately from those programs by following the instructions provided in their respective mobile terms.
              </p>

              <p className="text-lg mb-6">
                For Service support or assistance, text HELP to +18559451273 or email <a href="mailto:support@rithikaisafool.com" className="underline hover:text-gray-600">support@rithikaisafool.com</a>.
              </p>

              <p className="text-lg mb-6">
                We may change any short code or telephone number we use to operate the Service at any time and will notify you of these changes. You acknowledge that any messages, including any STOP or HELP requests, you send to a short code or telephone number we have changed may not be received and we will not be responsible for honoring requests made in such messages.
              </p>

              <p className="text-lg mb-6">
                The wireless carriers supported by the Service are not liable for delayed or undelivered messages. You agree to provide us with a valid mobile number. If you get a new mobile number, you will need to sign up for the program with your new number.
              </p>

              <p className="text-lg mb-6">
                To the extent permitted by applicable law, you agree that we will not be liable for failed, delayed, or misdirected delivery of any information sent through the Service, any errors in such information, and/or any action you may or may not take in reliance on the information or Service.
              </p>

              <p className="text-lg mb-8">
                We respect your right to privacy. To see how we collect and use your personal information, please see our Privacy Notice.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
