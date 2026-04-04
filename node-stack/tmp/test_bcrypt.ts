import * as bcrypt from 'bcrypt';

async function test() {
  const password = 'Password123!';
  const hash = '$2b$10$YW0gU44WpESDiQAGPxWrY.5CHZHh.HCq3C4bbYCJSJQOWkyNYMn7u'; // admin hash from DB
  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
}

test();
