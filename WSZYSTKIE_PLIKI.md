# 🎯 WSZYSTKIE PLIKI GROUPTRIP - DO SKOPIOWANIA

## 📦 STRUKTURA PROJEKTU:
```
GroupTrip/
├── package.json
├── tsconfig.json  
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.cjs
├── postcss.config.cjs
├── vercel.json
├── index.html
├── main.tsx
├── App.tsx
├── styles/globals.css
├── lib/
│   ├── api.ts
│   ├── attractions.ts
│   └── auth.ts
├── utils/supabase/info.tsx
├── components/ (główne ekrany)
└── supabase/functions/server/index.tsx
```

---

## ⚠️ WAŻNE INSTRUKCJE:

1. **Utwórz nowe repo na GitHub** (bez README, bez .gitignore)
2. **Używaj Git Desktop lub git CLI** - GitHub Web nie pozwoli Ci uploadować folderów
3. **Skopiuj wszystkie pliki poniżej** zachowując strukturę folderów
4. **PAMIĘTAJ:** Musisz też skopiować wszystkie komponenty UI z `/components/ui/` 
5. **Backend:** Musisz skopiować `/supabase/functions/server/index.tsx`

---

## 📄 1. PLIKI KONFIGURACYJNE ROOT

### `package.json`
```json
{
  "name": "grouptrip",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-icons": "^5.0.1",
    "recharts": "^2.12.0",
    "date-fns": "^3.3.1",
    "@supabase/supabase-js": "^2.39.7",
    "sonner": "^2.0.3",
    "react-day-picker": "^8.10.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "react-resizable-panels": "^2.0.0",
    "input-otp": "^1.2.4",
    "embla-carousel-react": "^8.0.0",
    "vaul": "^0.9.0",
    "cmdk": "^1.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "typescript": "^5.3.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "postcss.config.js", "tailwind.config.js"]
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  optimizeDeps: {
    include: ['react-icons/fi', 'react', 'react-dom'],
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### `tailwind.config.cjs`
Zobacz w poprzednich odpowiedziach - jest BARDZO DŁUGI (139 linii)

### `postcss.config.cjs`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚨 DALSZE PLIKI:

To za dużo na jeden dokument. Powiedz mi:

**1️⃣ Mam ci teraz dać:**
- A) Wszystkie komponenty ekranów (`WelcomeScreen.tsx`, `AuthScreen.tsx`, etc.)
- B) Wszystkie komponenty UI Shadcn (`/components/ui/`)
- C) Backend (`/supabase/functions/server/index.tsx`)
- D) Wszystko naraz w kolejnych wiadomościach

**2️⃣ Albo:**
Mogę ci dać **LINK DO POBRANIA WSZYSTKICH PLIKÓW** - ale do tego potrzebuję znać Twój sposób pracy.

**Jak chcesz to zrobić?** 💪
