import npmName from "npm-name";

const availableProjectNames = [
  "Anchor",
  "Astride",
  "Aurora",
  "Beacon",
  "Beryl",
  "Blaze",
  "Bond",
  "Brimstone",
  "Cascade",
  "Cinder",
  "Cohort",
  "Cove",
  "Crown",
  "Current",
  "Diverge",
  "Echoes",
  "Eminence",
  "Ether",
  "Evoke",
  "Fable",
  "Flicker",
  "Flow",
  "Friction",
  "Glacier",
  "Glimmer",
  "Glitch",
  "Harbor",
  "Helix",
  "Horizon",
  "Inferno",
  "Lattice",
  "Luster",
  "Magnitude",
  "Mosaic",
  "Nimbus",
  "Nurture",
  "Orbit",
  "Outpost",
  "Paragon",
  "Pinnacle",
  "Primal",
  "Radiance",
  "Relay",
  "Reverie",
  "Sanctum",
  "Sentinel",
  "Silhouette",
  "Sonar",
  "Summit",
  "Verdant",
];

(async () => {
  const availabilityChecks = availableProjectNames.map(async (name) => {
    const isAvailable = await npmName(name.toLowerCase());
    return { name, isAvailable };
  });

  const results = await Promise.all(availabilityChecks);

  results.forEach(({ name, isAvailable }) => {
    if (isAvailable) {
      console.log(`✔ ${name} is available`);
    } else {
      //   console.log(`✖ ${name} is unavailable`);
    }
  });
})();
