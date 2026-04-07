export const QUESTION_BANK = [
  // OSI & TCP/IP
  { q: 'Which OSI layer is handling IP routing?', options: ['Layer 2', 'Layer 3', 'Layer 4', 'Layer 7'], answer: 1, difficulty: 'easy', topic: 'OSI' },
  { q: 'At which OSI layer does UDP operate?', options: ['Network', 'Transport', 'Data Link', 'Session'], answer: 1, difficulty: 'easy', topic: 'OSI' },
  { q: 'What is the PDU of the Data Link layer?', options: ['Segment', 'Packet', 'Frame', 'Bit'], answer: 2, difficulty: 'medium', topic: 'OSI' },
  { q: 'Which layer is responsible for end-to-end encryption like TLS?', options: ['Application', 'Presentation', 'Session', 'Transport'], answer: 1, difficulty: 'hard', topic: 'OSI' },
  { q: 'MAC addresses live at which layer of the OSI model?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], answer: 1, difficulty: 'easy', topic: 'OSI' },

  // TCP & UDP
  { q: 'How many steps are in the TCP handshake?', options: ['2', '3', '4', 'None'], answer: 1, difficulty: 'easy', topic: 'TCP' },
  { q: 'What flag is sent to forcefully terminate a TCP connection?', options: ['FIN', 'END', 'RST', 'TERM'], answer: 2, difficulty: 'medium', topic: 'TCP' },
  { q: 'Why is UDP considered "connectionless"?', options: ['It does not use IP addresses', 'It has no handshake or guaranteed delivery', 'It requires physical cables', 'It is only used locally'], answer: 1, difficulty: 'medium', topic: 'TCP' },
  { q: 'Which field in the TCP header ensures packets are reassembled in the correct order?', options: ['Sequence Number', 'Acknowledgment Number', 'Window Size', 'Checksum'], answer: 0, difficulty: 'hard', topic: 'TCP' },
  { q: 'What is the purpose of the Window Size field in TCP?', options: ['Security', 'Flow Control', 'Error Checking', 'Routing'], answer: 1, difficulty: 'hard', topic: 'TCP' },

  // Addressing & ARP
  { q: 'How many bits is an IPv4 address?', options: ['16', '32', '64', '128'], answer: 1, difficulty: 'easy', topic: 'Addressing' },
  { q: 'How many bits is an IPv6 address?', options: ['32', '64', '128', '256'], answer: 2, difficulty: 'easy', topic: 'Addressing' },
  { q: 'What does ARP resolve?', options: ['Domain Name to IP', 'IP to MAC', 'MAC to IP', 'Private IP to Public IP'], answer: 1, difficulty: 'medium', topic: 'Addressing' },
  { q: 'An ARP Request is sent as a...', options: ['Unicast', 'Multicast', 'Broadcast', 'Anycast'], answer: 2, difficulty: 'medium', topic: 'Addressing' },
  { q: 'Which protocol is used for SLAAC (Stateless Address Autoconfiguration) in IPv6 instead of ARP?', options: ['DHCPv6', 'NDP (Neighbor Discovery Protocol)', 'OSPFv3', 'ICMPv4'], answer: 1, difficulty: 'hard', topic: 'Addressing' },

  // DNS & DHCP
  { q: 'DNS primarily translates...', options: ['IPs to MACs', 'Domain names to IP addresses', 'Ports to protocols', 'Private to Public IPs'], answer: 1, difficulty: 'easy', topic: 'DNS' },
  { q: 'Which DNS record maps a domain to an IPv6 address?', options: ['A', 'CNAME', 'AAAA', 'MX'], answer: 2, difficulty: 'easy', topic: 'DNS' },
  { q: 'What port does DNS use?', options: ['TCP 80', 'UDP 67', 'UDP 53', 'TCP 25'], answer: 2, difficulty: 'medium', topic: 'DNS' },
  { q: 'What does DORA stand for in DHCP?', options: ['Discover, Offer, Request, Acknowledge', 'Domain, Origin, Record, Address', 'Data, Option, Route, Access', 'Detect, Open, Receive, Accept'], answer: 0, difficulty: 'easy', topic: 'DHCP' },
  { q: 'Why is a DHCP Discover sent as a broadcast?', options: ['For speed', 'Because the client lacks an IP and doesn\'t know the server IP', 'To bypass firewalls', 'To wake up the network'], answer: 1, difficulty: 'hard', topic: 'DHCP' },

  // Routing (Dijkstra, Distance Vector)
  { q: 'Dijkstra\'s algorithm is used by which routing protocol?', options: ['RIP', 'OSPF', 'BGP', 'EIGRP'], answer: 1, difficulty: 'medium', topic: 'Routing' },
  { q: 'Distance Vector routing protocols (like RIP) suffer from what major issue?', options: ['Key Distribution', 'Count-to-Infinity (Routing Loops)', 'Too much CPU usage', 'Lack of encryption'], answer: 1, difficulty: 'medium', topic: 'Routing' },
  { q: 'What metric does RIP use to determine the best path?', options: ['Bandwidth', 'Delay', 'Hop Count', 'Reliability'], answer: 2, difficulty: 'easy', topic: 'Routing' },
  { q: 'OSPF uses which metric type by default?', options: ['Hop Count', 'Cost (based on interface bandwidth)', 'Delay only', 'Ping time'], answer: 1, difficulty: 'hard', topic: 'Routing' },
  { q: 'What is BGP (Border Gateway Protocol) used for?', options: ['Routing inside a single company', 'Routing between different Autonomous Systems on the internet', 'Assigning IP addresses', 'Translating private IPs to public'], answer: 1, difficulty: 'hard', topic: 'Routing' },

  // Security (Firewalls, VPN, Encryption)
  { q: 'A Stateful Firewall makes decisions based on...', options: ['Only the source IP', 'The full connection state and context', 'Just the destination port', 'MAC addresses only'], answer: 1, difficulty: 'medium', topic: 'Security' },
  { q: 'What is the default policy for most firewalls if no rule matches?', options: ['Allow everything', 'Implicit Deny', 'Prompt the user', 'Route to DMZ'], answer: 1, difficulty: 'easy', topic: 'Security' },
  { q: 'IPsec primarily uses which protocol to encrypt the payload?', options: ['AH', 'ESP', 'TCP', 'UDP'], answer: 1, difficulty: 'hard', topic: 'Security' },
  { q: 'What is the fundamental challenge of Symmetric Encryption over the internet?', options: ['It is too slow', ' securely exchanging the secret key', 'It encrypts too much data', 'It doesn\'t support numbers'], answer: 1, difficulty: 'medium', topic: 'Security' },
  { q: 'Which is an example of an Asymmetric Encryption algorithm?', options: ['AES', 'DES', 'RSA', 'Caesar Cipher'], answer: 2, difficulty: 'hard', topic: 'Security' },

  // Application Layer & Basic Troubleshooting (HTTP, ICMP)
  { q: 'Which HTTP method is designed to retrieve data without modifying the server?', options: ['POST', 'PUT', 'GET', 'DELETE'], answer: 2, difficulty: 'easy', topic: 'Web' },
  { q: 'An HTTP status code of 404 means...', options: ['OK', 'Not Found', 'Internal Server Error', 'Redirect'], answer: 1, difficulty: 'easy', topic: 'Web' },
  { q: 'What protocol does the "ping" utility use?', options: ['TCP', 'UDP', 'ICMP', 'IGMP'], answer: 2, difficulty: 'medium', topic: 'Troubleshooting' },
  { q: 'What does TTL (Time to Live) prevent?', options: ['Data corruption', 'Packets looping endlessly', 'Authentication failures', 'Bandwidth throttling'], answer: 1, difficulty: 'medium', topic: 'Troubleshooting' },
  { q: 'The "traceroute" command works by exploiting and incrementing which IP header field?', options: ['Header Checksum', 'Source IP', 'TTL (Time To Live)', 'Fragment Offset'], answer: 2, difficulty: 'hard', topic: 'Troubleshooting' },

  // Diagram/Visual-Based Questions
  { q: 'Examine this topology: PC -> Switch -> Router. At which device does the MAC address of the frame change?', options: ['At the PC only', 'At the Switch', 'At the Router', 'It never changes'], answer: 2, difficulty: 'hard', topic: 'Diagram', isVisual: true },
  { q: 'If Host A (10.0.0.5/24) sends a packet to Host B (10.0.1.5/24), does it hit the Default Gateway?', options: ['Yes, they are on different subnets', 'No, they are on the same subnet', 'Only if the Switch enables it', 'It drops the packet'], answer: 0, difficulty: 'medium', topic: 'Diagram', isVisual: true },
  { q: 'In this packet: [ Ethernet | IP | TCP | HTTP ]. Which header contains the Source Port?', options: ['Ethernet', 'IP', 'TCP', 'HTTP'], answer: 2, difficulty: 'medium', topic: 'Diagram', isVisual: true },
  { q: 'A packet is blocked by rule: "DENY TCP Any Any 22". What service is being blocked?', options: ['Web (HTTP)', 'Email (SMTP)', 'SSH', 'DNS'], answer: 2, difficulty: 'easy', topic: 'Diagram', isVisual: true },
  { q: 'A routing table has: "192.168.1.0/24 via Eth0", "0.0.0.0/0 via 10.0.0.1". Where does a packet for 8.8.8.8 go?', options: ['Eth0', '10.0.0.1 (Default Route)', 'It is dropped', 'It broadcasts'], answer: 1, difficulty: 'hard', topic: 'Diagram', isVisual: true },
  
  // Extra General Networking
  { q: 'What does NAT (Network Address Translation) do?', options: ['Translates MACs to IPs', 'Translates Private IPs to Public IPs', 'Translates Domain names to IPs', 'Encrypts packets'], answer: 1, difficulty: 'medium', topic: 'Networking' },
  { q: 'Which layer is the "Switch" primarily associated with?', options: ['Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)', 'Physical (Layer 1)'], answer: 0, difficulty: 'easy', topic: 'Networking' },
  { q: 'Which topology connects all devices to a single central cable?', options: ['Star', 'Ring', 'Bus', 'Mesh'], answer: 2, difficulty: 'easy', topic: 'Networking' },
  { q: 'VLANs divide a network logically at which layer?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], answer: 1, difficulty: 'hard', topic: 'Networking' },
  { q: 'What does MTU stand for?', options: ['Maximum Transfer Unit', 'Minimum Transmission Usage', 'Multi-Terminal Uplink', 'Maximum Transmission Unit'], answer: 3, difficulty: 'medium', topic: 'Networking' },
  
  // Extra TCP/IP
  { q: 'How many bytes is an IPv4 header (without options)?', options: ['10 bytes', '20 bytes', '32 bytes', '64 bytes'], answer: 1, difficulty: 'hard', topic: 'TCP' },
  { q: 'What happens if a TCP sender receives three duplicate ACKs?', options: ['Closes the connection', 'Ignores them', 'Fast Retransmits the missing packet', 'Resets the router'], answer: 2, difficulty: 'hard', topic: 'TCP' },
  { q: 'Which Port is used by FTP Data Transfer?', options: ['20', '21', '22', '23'], answer: 0, difficulty: 'hard', topic: 'TCP' },
  { q: 'The "Well Known Ports" range is...', options: ['0 to 1023', '1024 to 49151', '49152 to 65535', '0 to 255'], answer: 0, difficulty: 'medium', topic: 'TCP' },
  { q: 'TCP uses what mechanism to prevent overwhelming the receiver?', options: ['Sliding Window (Flow Control)', 'Hashing', 'MAC Filtering', 'VLAN Tagging'], answer: 0, difficulty: 'medium', topic: 'TCP' },
];

export function getRandomQuestions(count = 20) {
  // Shuffle array using Fisher-Yates
  const shuffled = [...QUESTION_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // If count is greater than bank, return all
  if (count >= shuffled.length) return shuffled;
  
  // Try to get a good mix: 30% easy, 40% medium, 30% hard (roughly)
  const easy = shuffled.filter(q => q.difficulty === 'easy');
  const medium = shuffled.filter(q => q.difficulty === 'medium');
  const hard = shuffled.filter(q => q.difficulty === 'hard');
  
  const selected = [];
  
  // Pick desired ratio if possible
  const easyCount = Math.floor(count * 0.3);
  const mediumCount = Math.floor(count * 0.4);
  const hardCount = count - easyCount - mediumCount;
  
  selected.push(...easy.slice(0, easyCount));
  selected.push(...medium.slice(0, mediumCount));
  selected.push(...hard.slice(0, hardCount));
  
  // Shuffle the final selection again so difficulties are mixed
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  
  return selected;
}
