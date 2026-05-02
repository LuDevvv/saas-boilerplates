export default function PrivacyPage() {
  return (
    <div className="container py-24">
      <h1 className="text-4xl font-heading mb-8">Privacy Policy</h1>      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          At Node Stack, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
        </p>
        <h2 className="text-2xl font-heading text-gray-900 mt-12">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you join our waitlist or create an account.
        </p>
        <h2 className="text-2xl font-heading text-gray-900 mt-12">2. How We Use Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, and to communicate with you about updates and news.
        </p>
      </div>
    </div>
  );
}
