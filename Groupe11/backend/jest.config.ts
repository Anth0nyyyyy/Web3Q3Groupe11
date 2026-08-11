// /backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    // 1. Utiliser le preset de base pour ts-jest
    preset: 'ts-jest',

    // 2. Définir l'environnement
    testEnvironment: 'node',

    // 3. Transformer les imports ESM
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },

    // 4. Résoudre les extensions .js en .ts
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    extensionsToTreatAsEsm: ['.ts'],
};


export default config;