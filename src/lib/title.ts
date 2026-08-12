const roleBanks: Array<{ match: RegExp; lead: string[]; trail: string[] }> = [
  {
    match: /ai|ml|llm|data|python/i,
    lead: ["Context", "Model", "Signal", "Vector", "Inference"],
    trail: ["Cartographer", "Whisperer", "Tuner", "Prospector", "Pilot"],
  },
  {
    match: /design|ux|ui|figma|product/i,
    lead: ["Interface", "Pixel", "Taste", "Flow", "System"],
    trail: ["Weather-Maker", "Tide Shaper", "Composer", "Cartographer", "Alchemist"],
  },
  {
    match: /front|react|next|web|javascript|typescript/i,
    lead: ["Viewport", "Interaction", "Motion", "Component", "Browser"],
    trail: ["Surfer", "Choreographer", "Rigger", "Gardener", "Magician"],
  },
  {
    match: /back|node|api|go|rust|java|database/i,
    lead: ["Latency", "Endpoint", "Runtime", "Query", "Protocol"],
    trail: ["Hunter", "Navigator", "Architect", "Mechanic", "Nomad"],
  },
  {
    match: /devops|cloud|infra|sre|security|cyber/i,
    lead: ["Infra", "Uptime", "Terminal", "Deploy", "Packet"],
    trail: ["Surfer", "Guardian", "Astronaut", "Tactician", "Keeper"],
  },
  {
    match: /mobile|ios|android|flutter|react native/i,
    lead: ["Pocket", "Gesture", "Pocket-Sized", "Touch", "Offline"],
    trail: ["Pilot", "Cartographer", "Shipper", "Dreamer", "Tuner"],
  },
  {
    match: /founder|product|growth|market|community/i,
    lead: ["Momentum", "Problem", "Signal", "Market", "Launch"],
    trail: ["Catalyst", "Finder", "Translator", "Maker", "Instigator"],
  },
];

const universal = {
  lead: ["Terminal", "Ocean", "Build", "Midnight", "Ship-It", "Chaos", "Signal"],
  trail: ["Nomad", "Cartographer", "Tactician", "Surfer", "Alchemist", "Navigator", "Rigger"],
};

function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pick<T>(items: T[], number: number) {
  return items[number % items.length];
}

export function makeBuilderTitle(name: string, role: string, seed = 0) {
  const bank = roleBanks.find((entry) => entry.match.test(role)) ?? universal;
  const value = hash(`${name.trim().toLowerCase()}|${role.trim().toLowerCase()}|${seed}`);
  return `${pick(bank.lead, value)} ${pick(bank.trail, Math.floor(value / 17))}`;
}

export function compactName(name: string, fallback = "YOUR NAME") {
  const cleaned = name.trim().replace(/\s+/g, " ");
  return cleaned ? cleaned.slice(0, 28).toUpperCase() : fallback;
}

export function compactRole(role: string, fallback = "FULL-STACK / BUILDER") {
  const cleaned = role.trim().replace(/\s+/g, " ");
  return cleaned ? cleaned.slice(0, 42).toUpperCase() : fallback;
}
