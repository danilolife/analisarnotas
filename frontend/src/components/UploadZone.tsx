import { useRef, useState } from 'react'
import { FileText, Plus, Trash2, UploadCloud } from 'lucide-react'

interface Props {
  files: File[]
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
  disabled?: boolean
}

export function UploadZone({ files, onFiles, onRemove, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)

  function addFromList(list: FileList | null) {
    if (!list) return
    const pdfs = Array.from(list).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
    onFiles(pdfs)
  }

  return (
    <section className="upload-card">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          addFromList(event.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          hidden
          disabled={disabled}
          onChange={(event) => {
            addFromList(event.target.files)
            event.currentTarget.value = ''
          }}
        />
        <div className="upload-icon"><UploadCloud size={24} /></div>
        <h2>Envie seus DANFEs em PDF</h2>
        <p>Arraste os arquivos aqui ou clique para selecionar. Você pode enviar vários PDFs de uma vez.</p>
        <button className="secondary-button" type="button" disabled={disabled}>
          <Plus size={17} /> Selecionar PDFs
        </button>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div className="file-row" key={`${file.name}-${file.size}-${index}`}>
              <div className="file-main">
                <span className="file-icon"><FileText size={18} /></span>
                <div>
                  <strong>{file.name}</strong>
                  <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
              </div>
              <button className="icon-button" type="button" onClick={() => onRemove(index)} aria-label="Remover arquivo" disabled={disabled}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
