import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    ".tmp/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/ui/**",
    "components/theme-provider.tsx",
    "hooks/**",
  ]),
])

export default eslintConfig
