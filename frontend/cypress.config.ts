// /frontend/cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: 'http://127.0.0.1:5173',
        setupNodeEvents(on, config) {
            // On peut laisser ça vide pour l'instant
        },
    },
});