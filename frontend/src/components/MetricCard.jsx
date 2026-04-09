import React from 'react';

export default function MetricCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
