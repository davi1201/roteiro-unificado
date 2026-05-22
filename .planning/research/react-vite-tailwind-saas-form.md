# React + Vite + Tailwind v4 — SaaS Form App Research

**Date:** 2026-05-22  
**Scope:** Multi-tenant SaaS form application, multi-step forms with tabs/sections

---

## Stack Setup

### Bootstrapping (2025-2026)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install tailwindcss @tailwindcss/vite
npm install react-hook-form @hookform/resolvers zod
npm install zustand          # optional — for cross-step global state
```

**Node.js requirement:** 20.19+ or 22.12+. The `react-ts` Vite template ships with React 19.

### `vite.config.ts` — use the Vite plugin, not PostCSS

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
});
```

> **Why Vite plugin over PostCSS?** The `@tailwindcss/vite` plugin gives significantly better incremental rebuild performance (microsecond no-op rebuilds) vs. PostCSS integration.

### `tsconfig.json` — required for Zod

```json
{ "compilerOptions": { "strict": true } }
```

---

## Tailwind v4 Key Changes

### 1. No more `tailwind.config.js`

Configuration moved entirely to CSS. Delete the config file; customize in `src/index.css`:

```css
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', sans-serif;
  --color-brand-500: oklch(0.62 0.19 250);
  --color-brand-600: oklch(0.52 0.21 250);
  --radius-card: 0.75rem;
}
```

All `@theme` tokens are automatically emitted as CSS custom properties on `:root`.

### 2. No more `@tailwind` directives

```css
/* v3 — DELETE THIS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 — ONE LINE */
@import 'tailwindcss';
```

### 3. Dark mode — `@custom-variant` in CSS

```css
/* v3 equivalent of darkMode: 'class' */
@custom-variant dark (&:where(.dark, .dark *));

/* OR with data-attribute (good for multi-tenant themes) */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Toggle in JS: `document.documentElement.classList.toggle('dark')` with `localStorage` persistence.

### 4. Automatic content detection

No `content: []` array needed. Tailwind scans files not in `.gitignore` automatically. If you have a UI library outside git, add explicitly:

```css
@source "../node_modules/@my-company/ui-lib";
```

### 5. Dynamic utilities — stop extending config for trivial values

```html
<!-- v3: had to add gridTemplateColumns in config -->
<!-- v4: just works -->
<div class="grid grid-cols-15">...</div>
<div class="w-17 mt-29">...</div>
```

### 6. Container queries — built-in, no plugin

```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3">...</div>
</div>
```

### 7. Color palette — OKLCH / P3

Default palette is now OKLCH. When using brand colors, prefer `oklch()` values for maximum gamut. CSS variable approach is recommended for multi-tenant theming:

```css
/* Tenant theme override */
[data-tenant='acme'] {
  --color-brand-500: oklch(0.62 0.19 140); /* green */
}
```

### v3 → v4 migration cheatsheet

| v3                                      | v4                           |
| --------------------------------------- | ---------------------------- |
| `tailwind.config.js`                    | `@theme {}` in CSS           |
| `darkMode: 'class'`                     | `@custom-variant dark (...)` |
| `content: ['./src/**']`                 | auto-detected                |
| `@tailwind base/components/utilities`   | `@import "tailwindcss"`      |
| `theme.extend.colors`                   | `--color-*` in `@theme {}`   |
| `@tailwindcss/container-queries` plugin | Built-in `@container`        |

---

## Form Architecture Patterns

### Recommended stack: React Hook Form + Zod + (Zustand for global state)

React Hook Form (RHF) is the right choice for large forms because it uses **uncontrolled inputs** — re-renders are isolated to fields with errors, not the whole form. Zod 4 (stable) is the ideal validator.

### Multi-step form pattern

```tsx
// 1. Define per-step schemas
const step1Schema = z.object({
  companyName: z.string().min(1, 'Required'),
  cnpj: z.string().regex(/^\d{14}$/, 'Invalid CNPJ'),
});
const step2Schema = z.object({
  contactName: z.string().min(1),
  email: z.string().email(),
});
// Full schema = union of all steps
const fullSchema = step1Schema.merge(step2Schema); // ...merge more

type FormValues = z.infer<typeof fullSchema>;
```

```tsx
// 2. Single form instance wrapping all steps
function MultiStepForm() {
  const [step, setStep] = useState(0);
  const methods = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: { companyName: '', cnpj: '', contactName: '', email: '' },
    mode: 'onTouched',
    shouldUnregister: false, // IMPORTANT: preserve values on tab switch
  });

  const stepSchemas = [step1Schema, step2Schema];

  const nextStep = async () => {
    // validate only fields on current step
    const fields = Object.keys(stepSchemas[step].shape) as (keyof FormValues)[];
    const valid = await methods.trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {step === 0 && <Step1 />}
        {step === 1 && <Step2 />}
        <StepNav
          step={step}
          onNext={nextStep}
          onBack={() => setStep((s) => s - 1)}
        />
      </form>
    </FormProvider>
  );
}

// 3. Child steps read form from context — no prop drilling
function Step1() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();
  return (
    <div>
      <input {...register('companyName')} />
      {errors.companyName && <p>{errors.companyName.message}</p>}
    </div>
  );
}
```

### When to add Zustand

Add Zustand **alongside** RHF (not instead of) when you need:

- **Draft auto-save** to localStorage / API between sessions
- **Progress tracking** (which steps are complete) displayed in a sidebar
- **Cross-form shared state** (e.g., tenant context affecting form defaults)
- **Wizard orchestration state** (step count, navigation guards)

```ts
// stores/formDraftStore.ts
interface DraftStore {
  draft: Partial<FormValues>;
  saveDraft: (data: Partial<FormValues>) => void;
  clearDraft: () => void;
}
const useFormDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      draft: {},
      saveDraft: (data) => set({ draft: data }),
      clearDraft: () => set({ draft: {} }),
    }),
    { name: 'form-draft' }
  )
);
```

### RHF key configuration choices for large forms

| Option             | Recommended value     | Reason                                                 |
| ------------------ | --------------------- | ------------------------------------------------------ |
| `mode`             | `'onTouched'`         | Validate on first blur, then on change — UX sweet spot |
| `shouldUnregister` | `false` (default)     | Preserve values when tabs unmount                      |
| `criteriaMode`     | `'all'`               | Show all field errors at once                          |
| `resolver`         | `zodResolver(schema)` | Type-safe, single source of truth                      |
| `defaultValues`    | explicit object       | Prevents uncontrolled→controlled flicker               |

---

## Recommended Folder Structure

```
src/
├── assets/              # static files (fonts, images)
├── components/
│   ├── ui/              # pure, headless, reusable atoms (Button, Input, Select…)
│   └── forms/           # form-specific composed components (FieldGroup, StepNav…)
├── features/
│   └── onboarding/      # one folder per domain/feature
│       ├── components/  # feature-local components
│       ├── hooks/       # feature-local hooks
│       ├── schemas/     # Zod schemas for this feature
│       └── OnboardingForm.tsx
├── hooks/               # global shared hooks
├── lib/
│   ├── api.ts           # API client (axios/fetch wrapper)
│   └── utils.ts         # general utilities (cn(), formatCNPJ…)
├── stores/              # Zustand stores
├── types/               # shared TypeScript types / generated API types
├── index.css            # Tailwind @import + @theme tokens
└── main.tsx
```

**Reasoning:**

- `features/` colocation keeps domain logic together; avoids giant `components/` folders
- `components/ui/` contains only generic, tenant-agnostic primitives
- Schemas live in `features/<name>/schemas/` — co-located with the form that uses them, not a global `schemas/` folder
- Stores in top-level `stores/` because they are often cross-feature

---

## Gotchas & Pitfalls

### Tailwind v4

1. **`tailwind.config.js` is silently ignored** — if you accidentally leave one from a v3 project, Tailwind v4 ignores it without errors. Always configure in `@theme {}` in CSS.

2. **PostCSS vs Vite plugin conflict** — don't install both `@tailwindcss/postcss` and `@tailwindcss/vite`. The Vite plugin is sufficient and faster; using both causes double processing.

3. **`@custom-variant dark` must come after `@import "tailwindcss"`** — order matters in the CSS file.

4. **Removed `bg-opacity-*`, `text-opacity-*`, etc.** — v4 uses `bg-black/50` modifier syntax. The upgrade tool handles this automatically: `npx @tailwindcss/upgrade`.

5. **OKLCH colors in older browsers** — OKLCH has ~95% global support (mid-2025). For older Safari, Tailwind's Lightning CSS integration auto-adds fallbacks. Don't manually add `rgb()` fallbacks; Tailwind handles it.

### React Hook Form

6. **Don't spread the entire `methods` object** into `useEffect` deps — it causes infinite loops. Destructure only the methods you need (`const { reset } = useForm()`).

7. **`shouldUnregister: false` (default) is what you want for multi-step** — setting it to `true` erases field values when a step unmounts. Only use `true` for genuinely optional sections.

8. **Validate step fields with `trigger(fieldNames[])`**, not `handleSubmit()`, when advancing steps. `handleSubmit` validates the entire form and won't let you proceed if later steps are empty.

9. **`<Controller>` vs `register()`** — use `register` for native HTML inputs. Use `<Controller>` (or `useController`) for custom components, date pickers, select libraries, etc.

### Multi-tenant theming

10. **Tenant theme isolation via CSS variables** — don't use JS to swap class names for themes; set a `data-tenant` attribute on `<html>` and override `--color-brand-*` variables per tenant in CSS. This requires zero JS re-renders.

11. **Zustand + `persist` for drafts** — always namespace draft keys per tenant: `{ name: \`form-draft-${tenantId}\` }`. Otherwise tenants share draft state in the same browser.

### Performance

12. **Large forms with 50+ fields** — RHF is re-render-safe by default. The main risk is using `watch()` broadly; `watch()` without field names subscribes to every change. Use `watch(['specificField'])` or `useWatch({ name: 'specificField' })` for targeted subscriptions.

13. **Virtualize long lists inside forms** — if a form section has a dynamic `useFieldArray` with potentially 100+ rows (e.g., a product table), use `@tanstack/virtual` to virtualize the rows. RHF + TanStack Virtual is well-documented.

14. **Code-split steps** — `React.lazy()` each step component so the bundle for step 4 isn't loaded when the user is on step 1.

```tsx
const Step4 = lazy(() => import('./steps/Step4'));
// wrap with <Suspense fallback={<StepSkeleton />}>
```
