// Base URL for backend
const BASE_URL = "${apiUrl}/api";

// A helper function to perform GET requests
export const get = async (path) => {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  } catch (error) {
    console.error("Fetch error: ", error);
    throw error;
  }
};
