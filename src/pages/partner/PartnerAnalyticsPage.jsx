import React from 'react';

export default function PartnerAnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Partner Analytics</h1>
      <div className="w-full h-[calc(100vh-8rem)]">
        <iframe
          title="DalScooter Partner Analytics"
          src="https://lookerstudio.google.com/embed/reporting/1385ac9d-e61e-4463-b25c-453ce649356b/page/Wc1SF"
          className="w-full h-full border-0 rounded-lg shadow"
        />
      </div>
    </div>
  );
}
