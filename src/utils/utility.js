const { APIError } = require("./responseHandler");

// Helper function to generate a 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Helper function to validate a mobile number
const isValidMobileNumber = (mobile) => /^[6-9]\d{9}$/.test(mobile);

const handleError = (res, error) => {
  console.error("[ERROR]: ", error);
  const statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected error occurred.";
  if (statusCode === 500) {
    message = "Internal Server Error.";
  }

  return res
    .status(statusCode || 500)
    .json(
      new APIError(
        statusCode || 500,
        message || "Internal Server Error."
      ).toJson()
    );
};

function calculateAge(dateOfBirth, referenceDate) {
  // Convert inputs to Date objects
  const dob = new Date(dateOfBirth);
  const refDate = new Date(referenceDate);

  // Calculate the age
  let age = refDate.getFullYear() - dob.getFullYear();

  // Adjust if the birthday hasn't occurred yet this year
  const hasBirthdayOccurred =
    refDate.getMonth() > dob.getMonth() ||
    (refDate.getMonth() === dob.getMonth() &&
      refDate.getDate() >= dob.getDate());

  if (!hasBirthdayOccurred) {
    age -= 1;
  }

  return age;
}

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = {
  generateOTP,
  isValidMobileNumber,
  handleError,
  calculateAge,
  fisherYatesShuffle,
};
