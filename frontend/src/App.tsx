import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileSearch, Moon, Sparkles, Sun, X } from 'lucide-react'
import { analyzePdfs } from './api'
import { ResultGroup } from './components/ResultGroup'
import { UploadZone } from './components/UploadZone'
import type { AnalysisResponse } from './types'

export default function App() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [dark, setDark] = useState(false)

  const canAnalyze = files.length > 0 && !loading
  const totalKeys = result?.summary.unique_keys ?? 0

  const allKeys = useMemo(
    () => result?.groups.flatMap((group) => group.invoices.map((invoice) => invoice.access_key)).join('\n') || '',
    [result]
  )

  function addFiles(incoming: File[]) {
    setFiles((current) => {
      const map = new Map(current.map((file) => [`${file.name}-${file.size}`, file]))
      incoming.forEach((file) => map.set(`${file.name}-${file.size}`, file))
      return Array.from(map.values())
    })
    setResult(null)
    setError('')
  }

  async function handleAnalyze() {
    if (!canAnalyze) return
    setLoading(true)
    setError('')
    try {
      const data = await analyzePdfs(files)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado ao analisar os PDFs.')
    } finally {
      setLoading(false)
    }
  }

  async function copy(text: string, label = 'Copiado para a área de transferência') {
    await navigator.clipboard.writeText(text)
    setToast(label)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className={dark ? 'app theme-dark' : 'app'}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><ClipboardList size={19} /></span>
          <div>
            <strong>NF Extract</strong>
            <small>DANFE Analyzer</small>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="status-pill"><span className="status-dot" /> Processamento privado</span>
          <button className="icon-button theme-button" onClick={() => setDark((value) => !value)} aria-label="Alternar tema">
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div className="hero-badge"><Sparkles size={14} /> Extração inteligente de DANFE</div>
          <h1>Transforme PDFs de NF-e em dados prontos para copiar.</h1>
          <p>Envie seus DANFEs e receba as chaves de acesso organizadas automaticamente por <strong>carga</strong> e <strong>CNPJ do destinatário</strong>.</p>
        </section>

        <section className="workspace">
          <div className="left-column">
            <UploadZone
              files={files}
              onFiles={addFiles}
              onRemove={(index) => {
                setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
                setResult(null)
              }}
              disabled={loading}
            />

            <button className="primary-button analyze-button" disabled={!canAnalyze} onClick={handleAnalyze}>
              {loading ? <span className="spinner" /> : <FileSearch size={19} />}
              {loading ? 'Analisando PDFs...' : 'Analisar notas fiscais'}
              {!loading && <ArrowRight size={18} />}
            </button>

            {error && (
              <div className="error-box">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <aside className="side-card">
            <div className="side-icon"><Sparkles size={18} /></div>
            <h3>O que o sistema extrai</h3>
            <ul>
              <li><CheckCircle2 size={16} /> Chave de acesso de 44 dígitos</li>
              <li><CheckCircle2 size={16} /> Número da NF e série</li>
              <li><CheckCircle2 size={16} /> Carga do documento</li>
              <li><CheckCircle2 size={16} /> Destinatário e CNPJ</li>
              <li><CheckCircle2 size={16} /> Data, valor e página de origem</li>
              <li><CheckCircle2 size={16} /> Validação do dígito verificador</li>
            </ul>
            <p className="privacy-note">Os PDFs são processados em memória e não são salvos pelo backend desta versão.</p>
          </aside>
        </section>

        {result && (
          <section className="results-section">
            <div className="results-heading">
              <div>
                <span className="section-kicker">Análise concluída</span>
                <h2>{totalKeys} chaves únicas encontradas</h2>
              </div>
              <button className="secondary-button" onClick={() => copy(allKeys, 'Todas as chaves foram copiadas')}>
                Copiar todas as chaves
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><strong>{result.summary.files}</strong><span>PDFs</span></div>
              <div className="stat-card"><strong>{result.summary.cargas}</strong><span>Cargas</span></div>
              <div className="stat-card"><strong>{result.summary.recipient_cnpjs}</strong><span>CNPJs</span></div>
              <div className="stat-card"><strong>{result.summary.unique_keys}</strong><span>Chaves</span></div>
            </div>

            {result.warnings.length > 0 && (
              <div className="warning-box">
                <AlertTriangle size={17} />
                <div>{result.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>
              </div>
            )}

            <div className="groups-stack">
              {result.groups.map((group) => (
                <ResultGroup key={`${group.carga}-${group.recipient_cnpj}`} group={group} onCopy={copy} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">NF Extract • interface inspirada em produtos SaaS modernos, com identidade própria.</footer>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} /> {toast}
          <button onClick={() => setToast('')} aria-label="Fechar"><X size={15} /></button>
        </div>
      )}
    </div>
  )
}
