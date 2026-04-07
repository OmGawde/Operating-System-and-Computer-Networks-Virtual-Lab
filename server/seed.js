const mongoose = require('mongoose');
require('dotenv').config();
const Flashcard = require('./models/Flashcard');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinetic-network';

const flashcards = [
  // Fundamentals
  { topic: 'fundamentals', question: 'What are the 7 layers of the OSI model?', answer: 'Physical, Data Link, Network, Transport, Session, Presentation, Application — from bottom to top.', difficulty: 'easy' },
  { topic: 'fundamentals', question: 'What is encapsulation in networking?', answer: 'Encapsulation is the process of wrapping data with protocol headers/trailers as it moves down the OSI layers. Data → Segment → Packet → Frame → Bits.', difficulty: 'medium' },
  { topic: 'fundamentals', question: 'What is the difference between a hub, switch, and router?', answer: 'Hub broadcasts to all ports (L1). Switch forwards based on MAC addresses (L2). Router forwards based on IP addresses (L3).', difficulty: 'easy' },
  { topic: 'fundamentals', question: 'What is DNS and how does it work?', answer: 'Domain Name System translates domain names to IP addresses. It uses a hierarchical system: Root → TLD → Authoritative DNS servers.', difficulty: 'medium' },
  { topic: 'fundamentals', question: 'What is DHCP?', answer: 'Dynamic Host Configuration Protocol automatically assigns IP addresses using the DORA process: Discover, Offer, Request, Acknowledge.', difficulty: 'easy' },
  { topic: 'fundamentals', question: 'What is the purpose of the Physical layer?', answer: 'The Physical layer is responsible for transmitting raw bit streams over a physical medium (cables, radio waves). It defines voltages, pin layouts, and data rates.', difficulty: 'easy' },
  { topic: 'fundamentals', question: 'Explain the difference between TCP and UDP.', answer: 'TCP is connection-oriented, reliable, and guarantees ordered delivery. UDP is connectionless, faster, but does not guarantee delivery or order.', difficulty: 'medium' },
  // Routing
  { topic: 'routing', question: 'Explain the core difference between OSPF and BGP.', answer: 'OSPF is an IGP that uses the Dijkstra SPF algorithm for intra-domain routing. BGP is an EGP that uses a Path-Vector algorithm focused on policies and AS hops.', difficulty: 'hard' },
  { topic: 'routing', question: 'What is Dijkstra\'s algorithm used for in networking?', answer: 'Dijkstra\'s algorithm finds the shortest path between nodes in a weighted graph. In OSPF, it computes the shortest path first (SPF) tree for routing.', difficulty: 'medium' },
  { topic: 'routing', question: 'How does the Distance Vector algorithm work?', answer: 'Each router shares its routing table with direct neighbors. Routers update their tables using the Bellman-Ford equation: D(v) = min{c(x,v) + D(v)} for all neighbors.', difficulty: 'hard' },
  { topic: 'routing', question: 'What is the count-to-infinity problem?', answer: 'In Distance Vector routing, routers can continuously increment a route\'s cost when a link fails, as they believe alternate paths exist through each other. Solved by split horizon and poison reverse.', difficulty: 'hard' },
  { topic: 'routing', question: 'What is a routing table?', answer: 'A routing table is a data structure in a router that lists routes to network destinations, including the next hop and metric (cost) for each destination.', difficulty: 'easy' },
  { topic: 'routing', question: 'What is the difference between Link State and Distance Vector routing?', answer: 'Link State (e.g., OSPF) floods link information to all routers, each computing shortest paths. Distance Vector (e.g., RIP) shares routing tables only with neighbors iteratively.', difficulty: 'medium' },
  // TCP/IP
  { topic: 'tcp', question: 'Describe the TCP 3-way handshake.', answer: '1) Client sends SYN with initial sequence number. 2) Server replies with SYN-ACK, acknowledging client\'s SYN. 3) Client sends ACK. Connection is established.', difficulty: 'medium' },
  { topic: 'tcp', question: 'What is the sliding window protocol?', answer: 'A flow control mechanism where the sender can transmit multiple packets without waiting for individual ACKs. The window size determines how many unacknowledged packets are allowed.', difficulty: 'medium' },
  { topic: 'tcp', question: 'What happens when a TCP packet is lost?', answer: 'The sender detects loss via timeout or triple duplicate ACKs. It retransmits the lost segment and may reduce the congestion window (slow start / congestion avoidance).', difficulty: 'hard' },
  { topic: 'tcp', question: 'What is TCP congestion control?', answer: 'TCP uses slow start, congestion avoidance, fast retransmit, and fast recovery to manage network congestion. The congestion window (cwnd) controls the sending rate.', difficulty: 'hard' },
  { topic: 'tcp', question: 'What is the difference between flow control and congestion control?', answer: 'Flow control prevents a fast sender from overwhelming a slow receiver (using receive window). Congestion control prevents network overload (using congestion window).', difficulty: 'medium' },
  { topic: 'tcp', question: 'What is MSS (Maximum Segment Size)?', answer: 'MSS is the maximum amount of data in bytes that TCP is willing to receive in a single segment. Typically 1460 bytes (MTU 1500 - 20 byte IP header - 20 byte TCP header).', difficulty: 'medium' },
  // Security
  { topic: 'security', question: 'What is the difference between symmetric and asymmetric encryption?', answer: 'Symmetric uses the same key for encryption/decryption (e.g., AES). Asymmetric uses a public key to encrypt and a private key to decrypt (e.g., RSA).', difficulty: 'medium' },
  { topic: 'security', question: 'How does a VPN work?', answer: 'A VPN creates an encrypted tunnel between devices over the internet. It uses protocols like IPsec or WireGuard to encapsulate and encrypt all traffic.', difficulty: 'medium' },
  { topic: 'security', question: 'What is a firewall?', answer: 'A firewall is a network security device that monitors and filters incoming/outgoing traffic based on predefined security rules (Access Control Lists).', difficulty: 'easy' },
  { topic: 'security', question: 'What is AES-256-GCM?', answer: 'AES-256-GCM is a symmetric encryption standard using 256-bit keys with Galois Counter Mode, providing both confidentiality and authenticated encryption.', difficulty: 'hard' },
  { topic: 'security', question: 'What are the three pillars of information security?', answer: 'Confidentiality (data privacy), Integrity (data accuracy), Availability (data accessibility) — known as the CIA triad.', difficulty: 'easy' },
  { topic: 'security', question: 'What is a man-in-the-middle attack?', answer: 'An attacker secretly intercepts and potentially alters communication between two parties who believe they are communicating directly with each other.', difficulty: 'medium' },
  // Application Layer
  { topic: 'application', question: 'What is the difference between HTTP and HTTPS?', answer: 'HTTP transmits data in plaintext on port 80. HTTPS encrypts data using TLS/SSL on port 443, providing confidentiality and integrity.', difficulty: 'easy' },
  { topic: 'application', question: 'What are the main HTTP methods?', answer: 'GET (retrieve data), POST (submit data), PUT (update/replace), PATCH (partial update), DELETE (remove resource), HEAD, OPTIONS.', difficulty: 'medium' },
  { topic: 'application', question: 'What is a REST API?', answer: 'REST (Representational State Transfer) is an architectural style for web APIs. It uses HTTP methods, is stateless, and represents resources as URIs.', difficulty: 'medium' },
  // Network Layer
  { topic: 'network-layer', question: 'What is ARP and why is it needed?', answer: 'Address Resolution Protocol maps IP addresses to MAC addresses. Before sending a frame, a host needs the destination\'s MAC address for the L2 header.', difficulty: 'medium' },
  { topic: 'network-layer', question: 'What is ICMP?', answer: 'Internet Control Message Protocol is used for diagnostic/error reporting. The ping command uses ICMP Echo Request/Reply to test connectivity.', difficulty: 'easy' },
  { topic: 'network-layer', question: 'How does an ARP broadcast work?', answer: 'The source sends an ARP request to FF:FF:FF:FF:FF:FF (broadcast). All hosts on the LAN receive it. Only the host with the matching IP responds with its MAC address.', difficulty: 'medium' },
  { topic: 'network-layer', question: 'What is TTL (Time To Live)?', answer: 'TTL is a field in the IP header that limits packet lifetime. Each router decrements it by 1. When TTL reaches 0, the packet is discarded to prevent infinite loops.', difficulty: 'easy' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    await Flashcard.deleteMany({});
    console.log('Cleared existing flashcards');
    await Flashcard.insertMany(flashcards);
    console.log(`Seeded ${flashcards.length} flashcards`);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
