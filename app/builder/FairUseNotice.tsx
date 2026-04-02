'use client';

/**
 * Fair Use Notice Component
 * 
 * This component displays trademark disclaimers and fair use notices
 * for third-party tools mentioned on the site.
 * 
 * Legal Guidelines Followed:
 * - Nominative Fair Use: Using names to describe compatibility/comparison
 * - No logos without permission
 * - No implied affiliation or endorsement
 * - Fact-based, truthful claims only
 */

export default function FairUseNotice() {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-xs text-gray-400">
      <h4 className="text-gray-300 font-semibold mb-2">⚖️ Trademark Notice</h4>
      <p className="mb-2">
        All third-party trademarks, logos, and brand names are the property of their respective owners.
      </p>
      <p className="mb-2">
        HarshAI is not affiliated with, endorsed by, or sponsored by any of the mentioned companies.
        Product names are used for identification and comparison purposes only under Nominative Fair Use.
      </p>
      <p className="mb-2">
        <strong>Our Policy:</strong>
      </p>
      <ul className="list-disc list-inside space-y-1 text-gray-500">
        <li>We use plain text names, not logos</li>
        <li>All claims are fact-based and verifiable</li>
        <li>No implied affiliation or endorsement</li>
        <li>Comparisons are honest and truthful</li>
      </ul>
    </div>
  );
}
