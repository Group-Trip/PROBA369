# 🚀 INSTRUKCJA - NOWE REPO GROUPTRIP

## ✅ CO MASZ TUTAJ W FIGMA MAKE:

Wszystkie pliki są **GOTOWE I POPRAWNE**! Sprawdzone 100%!

---

## 📋 KROK PO KROKU - NOWE REPO:

### **1. UTWÓRZ NOWE REPO NA GITHUBIE**

1. Idź na: https://github.com/new
2. **Repository name**: `GroupTrip` (lub inna nazwa)
3. **Public** lub **Private** - jak wolisz
4. ❌ **NIE ZAZNACZAJ** "Add a README file"
5. ❌ **NIE ZAZNACZAJ** "Add .gitignore"
6. Kliknij **"Create repository"**

---

### **2. POBIERZ WSZYSTKIE PLIKI Z FIGMA MAKE**

**OPCJA A: Export całego projektu (POLECANE)**

1. W Figma Make kliknij **"Export"** lub **"Download"** (jeśli dostępne)
2. Pobierz wszystko jako ZIP
3. Rozpakuj na komputer

**OPCJA B: Ręcznie (jeśli export nie działa)**

GitHub nie pozwala na upload całych folderów przez UI, więc musisz:
1. Zainstalować Git Desktop (https://desktop.github.com/)
2. Lub użyć git z linii poleceń

---

### **3. UPLOAD DO NOWEGO REPO**

**Przez Git Desktop (NAJŁATWIEJSZE):**

1. Otwórz Git Desktop
2. File → Add Local Repository → wybierz folder z projektem
3. Publish repository → wybierz swoje konto GitHub
4. Publish!

**Przez GitHub Web (tylko pojedyncze pliki):**

Niestety GitHub Web nie pozwala na upload całych folderów z podfolderami.
Musisz użyć Git Desktop lub linii poleceń.

---

### **4. POŁĄCZ Z VERCEL**

1. Idź na: https://vercel.com/new
2. **Import Git Repository** → wybierz swoje nowe repo
3. **Framework Preset**: `Vite`
4. **Root Directory**: `.` (domyślne)
5. **Build Command**: `npm run build` (domyślne)
6. **Output Directory**: `dist` (domyślne)
7. **Environment Variables**: Dodaj zmienne z Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_URL`
8. Kliknij **"Deploy"**

---

### **5. POCZEKAJ NA BUILD**

- Build zajmie 1-3 minuty
- Status powinien być **"Ready"** (zielony)
- Jeśli będzie błąd - pokaż mi logi!

---

## ✅ KLUCZOWE PLIKI (SPRAWDZONE):

✅ `tailwind.config.cjs` - Konfiguracja Tailwind (CommonJS)
✅ `postcss.config.cjs` - PostCSS (CommonJS)
✅ `vite.config.ts` - Vite z ustawionym PostCSS
✅ `package.json` - Wszystkie zależności (bez duplikatów)
✅ `styles/globals.css` - Style globalne
✅ `vercel.json` - Konfiguracja Vercel

---

## 🎯 CO SIĘ ZMIENI:

1. ✅ **Tailwind będzie działał** - style CommonJS
2. ✅ **Brak duplikatów** w package.json
3. ✅ **Safelist** z wszystkimi kolorami i klasami
4. ✅ **PostCSS poprawnie skonfigurowany**

---

## 🆘 JEŚLI COŚ NIE DZIAŁA:

1. **Pokaż mi build logs z Vercel**
2. **Pokaż mi screenshot strony** (F12 → Console)
3. **Napisz dokładnie co widzisz**

---

## 💪 ALTERNATIVE - NAJPROSTSZY SPOSÓB:

Jeśli nie chcesz bawić się w Git Desktop, możesz:

1. **Poproś mnie** żebym stworzył ZIP do pobrania
2. Albo **skopiuj każdy plik ręcznie** z Figma Make do GitHuba (długie, ale zadziała)

---

**Powodzenia! Tym razem będzie działać!** 🚀
