export default ({ color }) => (
  <svg width="150" height="150" viewBox="0 0 50 50">
    <text x="10" y="0" fill={color} fontSize="6" fontFamily="monospace">
      1
      <animate attributeName="y" values="-10;60" dur="1s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"></animate>
    </text>
    <text x="18" y="0" fill={color} fontSize="6" fontFamily="monospace">
      0
      <animate attributeName="y" values="-10;60" dur="1.5s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"></animate>
    </text>
    <text x="26" y="0" fill={color} fontSize="6" fontFamily="monospace">
      0
      <animate attributeName="y" values="-10;60" dur="2s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"></animate>
    </text>
    <text x="34" y="0" fill={color} fontSize="6" fontFamily="monospace">
      1
      <animate attributeName="y" values="-10;60" dur="2.5s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite"></animate>
    </text>
    <text x="42" y="0" fill={color} fontSize="6" fontFamily="monospace">
      1
      <animate attributeName="y" values="-10;60" dur="3s" repeatCount="indefinite"></animate>
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"></animate>
    </text>
  </svg>
);