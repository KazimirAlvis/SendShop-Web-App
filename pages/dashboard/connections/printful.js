import React from "react";

export default function PrintfulConnection() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_PRINTFUL_CLIENT_ID;
    const redirectUrl = `${window.location.origin}/oauth/callback`;
    window.location.href = `https://www.printful.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_url=${redirectUrl}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Connect to Printful</h1>
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        🔗 Connect to Printful
      </button>
      {/* Add Printful connection status, disconnect, etc. here */}
    </div>
  );
}