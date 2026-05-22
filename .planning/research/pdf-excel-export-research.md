# PDF & Excel Export — React + Vite (2025)

**Target:** React + Vite app exporting a multi-section assessment form as branded PDF and structured Excel.  
**Researched:** 22 mai 2026  
**Confidence geral:** HIGH (dados de bundlephobia e docs oficiais verificados)

---

## PDF Options Comparison

| Critério                                  | `@react-pdf/renderer`                                 | `jsPDF + html2canvas`                                                                      | `window.print()` (CSS)                           | Puppeteer (server-side)                |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------- |
| **Bundle (min+gz)**                       | 460 kB                                                | 124 kB                                                                                     | 0 kB                                             | N/A (server)                           |
| **Versão atual**                          | 4.5.1                                                 | 4.2.1                                                                                      | —                                                | 22.x                                   |
| **Modelo mental**                         | Escreve PDF via JSX                                   | Tira screenshot do DOM e injeta no PDF                                                     | Browser nativo "Salvar como PDF"                 | Headless Chrome renderiza página       |
| **Fidelidade de layout**                  | Alta — layout próprio (Yoga/Flexbox)                  | Média — depende de canvas rasterizado (pixels, não vetores)                                | Alta — usa o engine do browser diretamente       | Muito alta — engine completo do Chrome |
| **Fontes customizadas**                   | Sim, via `Font.register()`                            | Limitado pelo canvas                                                                       | Sim, via `@font-face` na CSS                     | Sim                                    |
| **Imagens / logos**                       | Sim nativo                                            | Sim (parte do canvas)                                                                      | Sim (via CSS)                                    | Sim                                    |
| **Campos condicionais**                   | Excelente — renderiza só o que você passar como props | Ruim — renderiza o DOM atual, campos ocultos podem aparecer ou sumir de forma imprevisível | Bom — `display:none` na `@media print` funciona  | Excelente — controle total             |
| **Quebra de página**                      | Controle preciso via `break` props                    | Automático, difícil de controlar                                                           | `page-break-*` / `break-after` (CSS)             | Controlável via CSS                    |
| **Branding (cores, logo, header/footer)** | Total                                                 | Parcial — header/footer exige código extra                                                 | Bom, mas usuário pode sobrescrever margens       | Total                                  |
| **Dependência de servidor**               | Não                                                   | Não                                                                                        | Não                                              | **Sim**                                |
| **DX / manutenção**                       | Excelente — JSX familiar                              | Aceitável                                                                                  | Boa                                              | Alta complexidade operacional          |
| **Acessibilidade do arquivo**             | PDF real (texto selecionável)                         | PDF como imagem (não selecionável)                                                         | PDF real                                         | PDF real                               |
| **Quando usar**                           | PDF programático rico, relatórios dinâmicos           | Captura de UI legada, dashboards com charts                                                | Relatórios simples onde fidelidade de tela basta | Geração server-side em lote            |

**Ponto crítico:** `jsPDF + html2canvas` converte o DOM em bitmap — o resultado é uma imagem dentro do PDF, não texto. Isso quebra busca, acessibilidade e aumenta o tamanho do arquivo.

---

## Recommended PDF Approach

**Recomendação: `@react-pdf/renderer` para relatórios de formulário com branding.**

### Por quê

- Campos condicionais mapeiam diretamente para JSX condicional — zero risco de mostrar campos ocultos.
- Layout via Flexbox (Yoga) garante consistência entre browsers; não depende do CSS da aplicação.
- Texto é selecionável e indexável no PDF final.
- `PDFDownloadLink` integra com React sem boilerplate.
- Fonte customizada (ex: fontes da marca) registrada uma vez globalmente.

### Quando recuar para `window.print()`

Use `window.print()` como **fallback simplificado** se:

- O formulário for simples (1–2 páginas, sem branding pesado).
- Precisa de zero dependência extra no bundle.
- Aceita que o usuário controle orientação e margens via diálogo do browser.

### Quando considerar servidor (Puppeteer / Playwright)

Apenas se:

- Geração em lote (sem interação do usuário).
- O template HTML já existe e é complexo demais para reescrever em JSX.

---

## Excel with SheetJS

**Pacote:** `xlsx` (SheetJS CE, Apache 2.0) — 136 kB gzipped.  
**Instalação via CDN oficial** (a partir da v0.20+, pois o npm está em v0.18.x desatualizado):

```bash
# npm / pnpm / bun — versão mais recente via CDN do SheetJS
npm install https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz
```

Ou com versão pinada (recomendado para produção):

```bash
npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

### API essencial para formulários

```ts
import * as XLSX from 'xlsx';

function exportFormToXlsx(formData: Record<string, unknown>[]) {
  // 1. Array de objetos → worksheet
  const worksheet = XLSX.utils.json_to_sheet(formData);

  // 2. Renomear cabeçalhos (opcional)
  XLSX.utils.sheet_add_aoa(worksheet, [['Campo', 'Resposta', 'Seção']], {
    origin: 'A1',
  });

  // 3. Ajustar largura de colunas
  worksheet['!cols'] = [{ wch: 40 }, { wch: 60 }, { wch: 20 }];

  // 4. Workbook e sheet nomeada
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Avaliação');

  // 5. Download no browser (comprimido)
  XLSX.writeFile(workbook, 'relatorio.xlsx', { compression: true });
}
```

### Múltiplas seções → múltiplas abas

```ts
const wb = XLSX.utils.book_new();
sections.forEach(({ name, rows }) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, name); // uma aba por seção
});
XLSX.writeFile(wb, 'relatorio-completo.xlsx', { compression: true });
```

### Campos condicionais

Filtre o array **antes** de passar para `json_to_sheet` — só inclua campos que estejam visíveis/respondidos:

```ts
const rows = allFields
  .filter((field) => field.visible && field.value !== undefined)
  .map((field) => ({
    Campo: field.label,
    Resposta: field.value,
    Seção: field.section,
  }));
```

---

## Implementation Patterns

### Padrão 1 — Componente de documento PDF isolado

Crie o template PDF em arquivo separado para não inflar o bundle principal. Use `React.lazy` + `Suspense` para carregamento sob demanda:

```tsx
// PdfReport.tsx — importado lazily
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' });

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logo: { width: 80, height: 40 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a365d',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 4,
  },
  label: { width: '40%', fontSize: 10, color: '#4a5568' },
  value: { width: '60%', fontSize: 10 },
});

export function AssessmentPdf({
  data,
  logoUrl,
}: {
  data: FormData;
  logoUrl: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <Text style={{ fontSize: 10, color: '#718096' }}>
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>
        {data.sections
          .filter((s) => s.isVisible) // exclui seções condicionais ocultadas
          .map((section) => (
            <View key={section.id} wrap={false}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.fields.map((field) => (
                <View key={field.id} style={styles.row}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.value}>{field.value ?? '—'}</Text>
                </View>
              ))}
            </View>
          ))}
      </Page>
    </Document>
  );
}
```

### Padrão 2 — Botão de download com lazy load

```tsx
import React, { Suspense, lazy, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Carrega o componente PDF apenas quando o usuário clica
const AssessmentPdf = lazy(() =>
  import('./PdfReport').then((m) => ({ default: m.AssessmentPdf }))
);

function ExportButton({ formData, logoUrl }) {
  const [ready, setReady] = useState(false);

  return ready ? (
    <Suspense fallback={<span>Gerando PDF…</span>}>
      <PDFDownloadLink
        document={<AssessmentPdf data={formData} logoUrl={logoUrl} />}
        fileName="avaliacao.pdf"
      >
        {({ loading }) => (loading ? 'Preparando…' : 'Baixar PDF')}
      </PDFDownloadLink>
    </Suspense>
  ) : (
    <button onClick={() => setReady(true)}>Exportar PDF</button>
  );
}
```

### Padrão 3 — `window.print()` com CSS isolado (fallback leve)

```css
/* print.css */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-report,
  #printable-report * {
    visibility: visible;
  }
  #printable-report {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  .no-print {
    display: none !important;
  }
  @page {
    margin: 20mm;
    size: A4 portrait;
  }
}
```

```tsx
function PrintButton() {
  const handlePrint = () => {
    window.addEventListener(
      'afterprint',
      () => {
        /* cleanup */
      },
      { once: true }
    );
    window.print();
  };
  return (
    <button onClick={handlePrint} className="no-print">
      Imprimir / Salvar PDF
    </button>
  );
}
```

**Limitação:** O usuário controla o diálogo de impressão; branding pode ser descartado se ele desativar "Gráficos de fundo".

---

## Bundle Size & Performance

### Tamanhos verificados (Bundlephobia, mai 2026)

| Pacote                | Versão       | Minificado | Min + Gzip | Tree-shakeable     |
| --------------------- | ------------ | ---------- | ---------- | ------------------ |
| `@react-pdf/renderer` | 4.5.1        | 1.4 MB     | **460 kB** | Não (side-effects) |
| `jspdf`               | 4.2.1        | 391 kB     | **124 kB** | Parcial            |
| `xlsx`                | 0.18.5 (npm) | 402 kB     | **136 kB** | **Sim**            |
| `html2canvas`         | —            | ~57 kB     | ~20 kB     | —                  |

> `xlsx` é **tree-shakeable e side-effect free** — se você só usar `writeXLSX`, o custo gzipped cai para ~28 kB.

### Estratégia no Vite

**1. Code splitting com dynamic import**

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-engine': ['@react-pdf/renderer'],
          'xlsx-engine': ['xlsx'],
        },
      },
    },
  },
});
```

O chunk de PDF só é baixado quando o usuário clica em "Exportar PDF" — não bloqueia o carregamento inicial.

**2. Importação cirúrgica do SheetJS**

```ts
// Importa apenas o necessário — Vite tree-shakes o resto
import { utils, writeXLSX } from 'xlsx';
// evita: import * as XLSX from 'xlsx'  ← carrega tudo
```

**3. Evitar `html2canvas` no bundle principal**

jsPDF carrega `html2canvas` como optional dependency. Para evitar que o Vite inclua no bundle principal, declare como external se não for usar:

```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['html2canvas'], // não pré-bundleia
  },
});
```

### Resumo de impacto no First Load

| Abordagem                  | Custo no bundle inicial (com code splitting) |
| -------------------------- | -------------------------------------------- |
| `@react-pdf/renderer` lazy | ~0 kB inicial + 460 kB no clique             |
| `window.print()`           | 0 kB                                         |
| SheetJS (só `writeXLSX`)   | ~28 kB gzipped (tree-shaken)                 |
| SheetJS (`import *`)       | 136 kB gzipped                               |

**Conclusão operacional:** Para um formulário de avaliação com branding, use `@react-pdf/renderer` carregado via `dynamic import` + `Suspense` para PDF, e `xlsx` com importação cirúrgica para Excel. O custo total no First Load é desprezível; o peso de 460 kB do PDF só é pago quando o usuário exporta.
