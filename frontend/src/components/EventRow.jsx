import React from 'react';
import StatusBadge from './StatusBadge';

export default function EventRow({ event, onClick }) {
  const date = new Date(event.timestamp);
  const timeString = date.toLocaleTimeString([], { hour12: false });
  const shortSession = event.session_id ? event.session_id.substring(0, 8) + '...' : 'N/A';
  
  let borderClass = 'border-l-4 border-transparent';
  let bgClass = 'hover:bg-gray-50';
  
  if (event.status === 'FLAGGED') {
    borderClass = 'border-l-4 border-yellow-400';
    bgClass = 'bg-yellow-50 hover:bg-yellow-100/50';
  } else if (event.status === 'INJECTED') {
    borderClass = 'border-l-4 border-red-500';
    bgClass = 'bg-red-50 hover:bg-red-100/50';
  }

  return (
    <tr 
      onClick={() => onClick(event)}
      className={`border-b border-gray-100 cursor-pointer transition-colors ${borderClass} ${bgClass}`}
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{timeString}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900" title={event.session_id}>{shortSession}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600">{event.tool_name}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{event.latency_ms} ms</td>
      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={event.status} /></td>
    </tr>
  );
}
