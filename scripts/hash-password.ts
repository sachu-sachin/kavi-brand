import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password "your-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Escape `$` as `\$` so Next.js .env loading does not treat it as expansion.
const escaped = hash.replace(/\$/g, "\\$");

console.log("\nAdd this line to your .env (already escaped for Next.js):\n");
console.log(`ADMIN_PASSWORD_HASH="${escaped}"\n`);
