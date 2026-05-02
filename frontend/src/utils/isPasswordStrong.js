export default function isPasswordStrong(pass) {
  const mediumPassword = new RegExp(
    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  );
  const strongPassword = new RegExp(
    "((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))"
  );
  const isStrong = strongPassword.test(pass);
  const isMedium = mediumPassword.test(pass);
  if (isStrong) return { sec: "strong", status: true };
  if (isMedium) return { sec: "medium", status: true };
  let message = "Try using a stronger password";
  // const hasNumber = new RegExp("([0-9])").test(pass);
  // const hasUppercase = new RegExp("([A-Z])").test(pass);
  // const hasLowercase = new RegExp("([a-z])").test(pass);
  // if (pass.length < 3) message = "Password should be at least 8 characters";
  // if (!hasNumber) message += ", add a number";
  // if (!hasUppercase) message += ", add an uppercase letter";
  // if (!hasLowercase) message += ", add a lowercase letter";
  //  "(e.g. use uppercase letters, lowercase letters, numbers, and special characters)";
  return { status: true, message };
}
