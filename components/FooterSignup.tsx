"use client";

export default function FooterSignup() {
  return (
    <div className="mb-6 flex justify-center">
      <div className="border border-white/30 rounded-xl p-5 py-6 w-full max-w-5xl">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const firstNameInput = form.elements.namedItem('footerFirstName') as HTMLInputElement;
            const emailInput = form.elements.namedItem('footerEmail') as HTMLInputElement;
            const phoneInput = form.elements.namedItem('footerPhone') as HTMLInputElement;
            const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            const errorDiv = form.querySelector('.error-message') as HTMLDivElement;
            const successDiv = form.querySelector('.success-message') as HTMLDivElement;
            const formContent = form.querySelector('.form-content') as HTMLDivElement;

            if (!emailInput.value && !phoneInput.value) {
              if (errorDiv) errorDiv.textContent = 'Please enter an email or phone number';
              return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Joining...';
            if (errorDiv) errorDiv.textContent = '';

            try {
              const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firstName: firstNameInput.value,
                  email: emailInput.value,
                  phone: phoneInput.value,
                }),
              });

              if (response.ok) {
                if (successDiv && formContent) {
                  successDiv.style.display = 'flex';
                  formContent.style.display = 'none';
                }
              }
            } catch (error) {
              console.error('Subscription error:', error);
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Join';
            }
          }}
        >
          <div className="form-content">
            <p className="error-message text-red-500 text-sm mb-2 text-center"></p>
            {/* Desktop: Title left aligned above inputs */}
            <div className="hidden md:flex flex-col gap-4">
              <span className="text-white font-semibold text-2xl text-left font-[family-name:var(--font-inter)] -mt-1">For cool, secret things</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="footerFirstName"
                  placeholder="First name"
                  className="min-w-0 flex-1 px-4 py-3 border border-white outline-none text-white placeholder:text-white/50 text-base rounded-full bg-transparent"
                />
                <input
                  type="email"
                  name="footerEmail"
                  placeholder="Email"
                  className="min-w-0 flex-1 px-4 py-3 border border-white outline-none text-white placeholder:text-white/50 text-base rounded-full bg-transparent"
                />
                <div className="flex items-center px-4 py-3 border border-white rounded-full bg-transparent shrink-0">
                  <span className="mr-1 text-base">🇺🇸</span>
                  <span className="text-white text-base mr-1">+1</span>
                  <input
                    type="tel"
                    name="footerPhone"
                    placeholder="Phone"
                    className="w-24 text-white placeholder:text-white/50 text-base focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#dcff73] text-black font-bold hover:bg-white transition-colors text-base rounded-full whitespace-nowrap shrink-0"
                >
                  Join
                </button>
              </div>
            </div>
            {/* Mobile: Stacked layout */}
            <div className="flex flex-col gap-2 md:hidden">
              <span className="text-white font-semibold text-xl text-left font-[family-name:var(--font-inter)] mb-2">For cool, secret things</span>
              <input
                type="text"
                name="footerFirstName"
                placeholder="First name"
                className="w-full px-4 py-3.5 border border-white outline-none text-white placeholder:text-white/50 text-base rounded-full bg-transparent"
              />
              <input
                type="email"
                name="footerEmail"
                placeholder="Email"
                className="w-full px-4 py-3.5 border border-white outline-none text-white placeholder:text-white/50 text-base rounded-full bg-transparent"
              />
              <div className="flex items-center px-4 py-3.5 border border-white rounded-full bg-transparent">
                <span className="mr-1 text-base">🇺🇸</span>
                <span className="text-white text-base mr-1">+1</span>
                <input
                  type="tel"
                  name="footerPhone"
                  placeholder="Phone (optional)"
                  className="flex-1 text-white placeholder:text-white/50 text-base focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#dcff73] text-black font-bold hover:bg-white transition-colors text-base rounded-full"
              >
                Join
              </button>
            </div>
          </div>

          <div className="success-message hidden items-center justify-center py-2">
            <p className="text-[#dcff73] font-bold text-lg">Thank you! You're now part of the world.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
