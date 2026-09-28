# NF Extract

Aplicação full-stack para analisar DANFE/NF-e em PDF, extrair chaves de acesso e organizar os resultados por **carga** e **CNPJ do destinatário**.

A interface tem uma estética SaaS moderna inspirada no tipo de acabamento visual do Lovable (cards leves, gradientes discretos, cantos arredondados e foco em simplicidade), mas com identidade própria.

## O que já funciona

- Upload de vários PDFs de uma vez.
- Extração de chave de acesso NF-e/NFC-e de 44 dígitos.
- Validação do dígito verificador da chave.
- Extração do número da NF, série e modelo pela própria chave.
- Extração de carga (`CARGA:`) por página.
- Extração do destinatário e CNPJ na seção `DESTINATÁRIO/REMETENTE`.
- Data de emissão e valor total quando o DANFE disponibiliza esses campos em texto.
- Remoção automática de chaves repetidas em notas com mais de uma página.
- Agrupamento por carga + CNPJ.
- Cópia de uma chave, de todas as chaves de uma carga ou do bloco completo.
- Exportação TXT por grupo.
- Processamento em memória; a aplicação não persiste os PDFs nesta versão.
- Tema claro/escuro e layout responsivo.

## Estrutura

```text
nfe-analyzer/
├─ backend/
│  ├─ app/
│  │  ├─ main.py
│  │  └─ parser.py
│  ├─ tests/
│  ├─ requirements.txt
│  └─ Dockerfile
├─ frontend/
│  ├─ src/
│  ├─ package.json
│  ├─ vite.config.ts
│  └─ Dockerfile
├─ docker-compose.yml
└─ .env.example
```

## Rodar no Windows (desenvolvimento)

### 1) Backend

Abra um terminal na pasta `backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

A API ficará em `http://localhost:8000` e a documentação automática em `http://localhost:8000/docs`.

### 2) Frontend

Abra outro terminal na pasta `frontend`:

```powershell
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Rodar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`

## API

### `POST /api/analyze`

Campo multipart: `files` (um ou mais PDFs).

Resposta simplificada:

```json
{
  "summary": {
    "files": 2,
    "unique_keys": 45,
    "groups": 2,
    "cargas": 2,
    "recipient_cnpjs": 2
  },
  "groups": [
    {
      "carga": "212898",
      "recipient_cnpj": "27.013.873/0008-61",
      "recipient_name": "REDE BOM COMERCIO LTDA",
      "key_count": 21,
      "invoices": []
    }
  ]
}
```

## Limitação importante: PDF escaneado

A versão atual usa **PyMuPDF** para extrair o texto já embutido no PDF. Isso funciona muito bem com DANFEs digitais como os arquivos usados no desenvolvimento. Se o PDF for apenas uma imagem escaneada, a API retorna um aviso informando que não encontrou chave válida. O próximo passo é adicionar OCR como fallback (Tesseract, Google Document AI, AWS Textract ou serviço equivalente).

## Segurança e privacidade

- O backend não grava o PDF em disco por padrão.
- Limite padrão: 25 MB por arquivo e 30 arquivos por análise.
- Apenas arquivos PDF são processados.
- Em produção, coloque o backend atrás de HTTPS e limite o CORS ao domínio real do frontend.

## Deploy recomendado

Como o backend usa PyMuPDF nativo, ele é mais simples de hospedar em **Render, Railway, Fly.io, VPS ou container Docker**. O frontend pode ficar em Vercel, Netlify ou Cloudflare Pages. Se quiser manter tudo em um único servidor, use os Dockerfiles incluídos.

## Evoluções recomendadas

1. Login e perfis de usuário.
2. Histórico de análises em Supabase/PostgreSQL.
3. OCR automático para PDFs escaneados.
4. Exportação CSV/XLSX.
5. Extração de volume/peso e outros campos específicos por fornecedor/layout.
6. Tela de regras por emitente para ajustar padrões sem alterar código.
7. Armazenamento opcional dos PDFs em bucket privado.
