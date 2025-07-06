// test-models.js
const connectDB = require('./config/connectDB');
const User = require('./models/user');

(async () => {
  await connectDB();

  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password_hash: 'secure123',
    role: 'learner'
  });

  console.log('✅ Created user:', user);
  process.exit(0);
})();
