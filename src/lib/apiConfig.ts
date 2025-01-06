const baseURL = import.meta.env.VITE_API_BASE_URL;
const aplicationAmbient = import.meta.env.VITE_API_AMBIENT;

const apiBaseUrl =
  aplicationAmbient === "development"
    ? "http://127.0.0.1:5001/neres-bazar/us-central1/api/v1"
    : baseURL;

console.log(apiBaseUrl);

export default apiBaseUrl;
