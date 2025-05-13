const bcrypt = require('bcrypt');

const hashPassword = async () => {
  const password = 'admin'; // Replace with the password you want to hash
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
};

hashPassword();