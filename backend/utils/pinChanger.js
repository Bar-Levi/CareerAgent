const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Use bcryptjs

(async () => {
  try {
    // Generate a random 6-digit PIN
    const PIN = crypto.randomInt(100000, 999999);
    console.log('Generated PIN: ' + PIN);

    // Hash the PIN
    const hashedPin = await bcrypt.hash(PIN.toString(), 10);
    console.log('Hashed PIN: ' + hashedPin);
  } catch (error) {
    console.error('Error:', error);
  }
})();


// After validation, admins manually change the PIN code in the database.
