export default function TermsPage() {
  return (
    <div className="container py-24">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          By using Node Stack, you agree to these terms. Please read them carefully.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-12">1. Use of Service</h2>
        <p>
          You must follow any policies made available to you within the Service.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-12">2. Liability</h2>
        <p>
          Node Stack is provided "as is" without any warranties of any kind.
        </p>
      </div>
    </div>
  );
}
