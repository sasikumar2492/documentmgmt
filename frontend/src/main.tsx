import { createRoot } from "react-dom/client";
import { registerLicense } from '@syncfusion/ej2-base';
import App from "./App.tsx";
import "./index.css";

// Register Syncfusion license key
const licenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (licenseKey) {
  registerLicense(licenseKey);
}

createRoot(document.getElementById("root")!).render(<App />);
  