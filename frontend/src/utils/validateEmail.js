export default function validateEmail(email) {
  // Regular expression for basic email validation
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,4}$/;
  if (emailPattern.test(email)) return true;
  return false;
}
