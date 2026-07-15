/**
 * Authentication Debugging Utility
 * Copy this code to your browser console to diagnose token issues
 */

function checkAuthToken() {
  console.log("===== AUTHENTICATION DEBUGGING =====");

  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("❌ No token found in localStorage!");
    return false;
  }

  console.log("✅ Token found in localStorage");

  // Check token format
  console.log("Token format check:");
  if (token.startsWith(" ") || token.endsWith(" ")) {
    console.log("⚠️ Token has whitespace at beginning/end");
  }

  // Check token structure (should be JWT with 3 parts separated by dots)
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.log(
      "❌ Token is not in valid JWT format (should have 3 parts separated by dots)"
    );
    return false;
  }

  console.log("✅ Token has valid JWT structure (3 parts)");

  // Try to parse the JWT payload
  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log("✅ Token payload decoded successfully:", payload);

    // Check expiration
    if (payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      if (expiryDate < now) {
        console.log("❌ Token has EXPIRED at:", expiryDate.toLocaleString());
        return false;
      }
      console.log(
        "✅ Token is still valid until:",
        expiryDate.toLocaleString()
      );
    }
  } catch (e) {
    console.log("❌ Failed to decode token payload:", e);
  }

  // Check stored user
  const user = localStorage.getItem("user");
  if (!user) {
    console.log("⚠️ No user data found in localStorage");
  } else {
    try {
      const userData = JSON.parse(user);
      console.log("✅ User data found:", userData);
    } catch (e) {
      console.log("❌ User data is not valid JSON:", e);
    }
  }

  console.log("===== END DEBUGGING =====");
  console.log("To test API call with your token, run:");
  console.log(`fetch("http://localhost:5000/api/auth/me", {
    headers: {
      "Authorization": "Bearer ${token}"
    }
  }).then(res => {
    console.log("Status:", res.status);
    return res.json();
  }).then(data => console.log(data)).catch(err => console.error(err));`);

  return true;
}

// Export for use in other files if needed
export default checkAuthToken;
