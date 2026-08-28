import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Tema escuro padrão para toda a aplicação web
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
