import React from 'react';

export default function StatusBadge({ status }) {
  let colorClass = "bg-gray-100 text-gray-800";
  if (status === "FLAGGED") {
    colorClass = "bg-yellow-100 text-yellow-800";
  } else if (status === "INJECTED") {
    colorClass = "bg-red-100 text-red-800";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
