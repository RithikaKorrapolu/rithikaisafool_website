"use client";

export default function LegalPage() {
  return (
    <main className="min-h-screen pt-[140px] md:pt-[145px] lg:pt-[155px] pb-20 px-6" style={{ backgroundColor: '#F2F2F2', fontFamily: 'Times New Roman, serif', color: 'black' }}>
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <h1 className="text-center mb-4 md:mb-8 underline" style={{ fontSize: '3.38rem', fontWeight: 'bold' }}>Legal + FAQ Document</h1>

        {/* Introduction */}
        <p className="text-lg mb-8">
          Generally, if you have any support questions, just email support@rithikaisafool.com with your order number and we'll try to get back to you ASAP.
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
      </div>
    </main>
  );
}
