// Test password validation logic
function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

console.log('Testing password validation:');
console.log('weak123:', validatePassword('weak123'));          // Should fail (no uppercase)
console.log('WEAK123:', validatePassword('WEAK123'));          // Should fail (no lowercase)
console.log('WeakPassword:', validatePassword('WeakPassword')); // Should fail (no number)
console.log('Weak12:', validatePassword('Weak12'));            // Should fail (too short)
console.log('Strong123:', validatePassword('Strong123'));      // Should pass
console.log('Password1:', validatePassword('Password1'));      // Should pass