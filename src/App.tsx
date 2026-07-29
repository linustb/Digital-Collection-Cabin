import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, Download, Menu, Sparkles, X } from 'lucide-react'

type Scene = { src: string; label: string; alt: string; description: string }
type OralHistoryRecord = {
  id: string
  personName: string
  identity: string
  year: string
  place: string
  keywords: string
  summary: string
  quoteInput: string
  message: string
  authorized: string
  contact: string
  createdAt: string
  updatedAt?: string
}
type RecordForm = Omit<OralHistoryRecord, 'id' | 'createdAt' | 'updatedAt'>

const STORAGE_KEY = 'qinjing-oral-history-records'
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
const scenes: Scene[] = [
  { src: assetUrl('/public/images/hero/winter-campus.jpg'), label: '冬日雕像', alt: '雪中的北京科技大学校园雕像与纪念石', description: '雪落校园，雕像静静见证一代代北科人的成长。' },
  { src: assetUrl('/public/images/hero/spring-heritage.jpg'), label: '春日校史馆', alt: '春日绿荫掩映下的北京科技大学校史馆', description: '绿荫深处，校史馆收藏着北科人共同的来路。' },
  { src: assetUrl('/public/images/hero/star-trails.jpg'), label: '夜空星轨', alt: '星轨下北京科技大学校园里的鼎与建筑', description: '星河流转，校园里的鼎守望着未曾停歇的理想。' },
  { src: assetUrl('/public/images/hero/golden-library.jpg'), label: '秋日图书馆', alt: '金色银杏与北京科技大学图书馆前的鼎', description: '金秋银杏与图书馆相映，鼎前的光影记录求知的日常。' },
]
const navLinks = [{ label: '校史故事', href: '#story' }, { label: '四季光影', href: '#seasons' }, { label: '采录舱', href: '#start' }]
const stats = ['北京科技大学', '满井溯源', '秦京铸魂', '文化传承实践团']
const postcardPhotos = [
  assetUrl('/public/images/postcards/0X1A7231-HDR.jpg'),
  assetUrl('/public/images/postcards/2021.11.11体育馆星轨加强星点.jpg'),
  assetUrl('/public/images/postcards/WMZ_1614.jpg'),
  assetUrl('/public/images/postcards/WMZ_6959.jpg'),
  assetUrl('/public/images/postcards/golden-library.jpg'),
  assetUrl('/public/images/postcards/star-trails.jpg'),
]
const emptyForm: RecordForm = { personName: '', identity: '老校友', year: '', place: '', keywords: '', summary: '', quoteInput: '', message: '', authorized: 'yes', contact: '' }
const demoRecord: OralHistoryRecord = { id: 'demo-1952', personName: '李明远', identity: '老教师', year: '1952', place: '钢铁冶金系 / 学院路', keywords: '建校初期, 钢铁报国, 实验室建设', summary: '新中国工业建设急需钢铁人才。李老师随第一批教师来到学院路，在条件有限的教室和实验室里带领学生边学习、边试验、边服务国家重大需求。', quoteInput: '那时设备不多，但每个人心里都有一座炉火。我们相信，把钢炼好，就是把国家的骨骼立起来。', message: '希望青年学生把个人理想放进国家需要里，在真实问题中淬炼本领。', authorized: 'yes', contact: '示例数据', createdAt: '2026-07-04' }

function authorizationLabel(value: string) { return ({ yes: '已授权', pending: '待确认', private: '内部保存' }[value] || '待确认') }
function keywordsOf(value: string) { return value.split(/[，,]/).map((item) => item.trim()).filter(Boolean) }
function today() { return new Date().toISOString().slice(0, 10) }
function storyFor(record: RecordForm | OralHistoryRecord) {
  const keywords = keywordsOf(record.keywords).join(' / ') || '校史记忆'
  const quote = record.quoteInput ? `\n\n“${record.quoteInput}”` : ''
  const message = record.message ? `\n\n青年寄语：${record.message}` : ''
  return `【${record.personName}：${keywords}】\n\n${record.year || '某年'}，${record.identity || '亲历者'}${record.place ? `在${record.place}` : ''}留下了与北科大同行、与国家同行的珍贵记忆。${record.summary}${quote}${message}\n\n授权状态：${authorizationLabel(record.authorized)}。`
}

export default function App() {
  const [activeScene, setActiveScene] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [records, setRecords] = useState<OralHistoryRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<RecordForm>(emptyForm)
  const [query, setQuery] = useState('')
  const [storyText, setStoryText] = useState('')
  const [postcardPhoto, setPostcardPhoto] = useState(postcardPhotos[0])
  const [toast, setToast] = useState('')

  useEffect(() => {
    try { setRecords(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as OralHistoryRecord[]) } catch { setRecords([]) }
  }, [])
  useEffect(() => { if (toast) { const timer = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(timer) } }, [toast])

  const scene = scenes[activeScene]
  const filteredRecords = useMemo(() => {
    const value = query.trim().toLowerCase()
    return value ? records.filter((record) => Object.values(record).some((item) => String(item).toLowerCase().includes(value))) : records
  }, [query, records])
  const authorizedCount = records.filter((record) => record.authorized === 'yes').length
  const years = records.map((record) => Number(record.year)).filter(Number.isFinite)
  const yearSpan = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0

  const notify = (message: string) => setToast(message)
  const randomizePostcardPhoto = () => {
    setPostcardPhoto((current) => {
      const alternatives = postcardPhotos.filter((photo) => photo !== current)
      return alternatives[Math.floor(Math.random() * alternatives.length)] || postcardPhotos[0]
    })
  }
  const selectScene = (index: number) => {
    if (index === activeScene || isTransitioning) return
    setActiveScene(index); setIsTransitioning(true); window.setTimeout(() => setIsTransitioning(false), 1000)
  }
  const scrollToStart = () => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
  const updateField = (field: keyof RecordForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const persist = (next: OralHistoryRecord[]) => { setRecords(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
  const resetForm = () => { setForm(emptyForm); setSelectedId(null); setStoryText('') }
  const saveRecord = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.personName.trim() || !form.summary.trim()) { notify('请至少填写姓名和访谈摘要。'); return }
    if (selectedId) {
      const next = records.map((record) => record.id === selectedId ? { ...record, ...form, updatedAt: today() } : record)
      persist(next); notify('档案已更新。')
    } else {
      const record = { id: `${Date.now()}`, ...form, createdAt: today() }
      persist([record, ...records]); setSelectedId(record.id); notify('档案已保存到本地资料库。')
    }
    setStoryText(storyFor(form))
    randomizePostcardPhoto()
  }
  const selectRecord = (record: OralHistoryRecord) => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...values } = record
    setSelectedId(record.id); setForm(values); setStoryText(storyFor(record)); notify(`已选中：${record.personName}`)
  }
  const generateStory = () => {
    if (!form.personName.trim() || !form.summary.trim()) { notify('请先选择档案，或填写姓名和访谈摘要。'); return }
    setStoryText(storyFor(form)); randomizePostcardPhoto(); notify('已生成故事卡初稿。')
  }
  const copyStory = async () => {
    const text = storyText || (form.personName && form.summary ? storyFor(form) : '')
    if (!text) { notify('请先生成故事卡。'); return }
    setStoryText(text)
    try { await navigator.clipboard.writeText(text) } catch { const textarea = document.createElement('textarea'); textarea.value = text; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove() }
    notify('故事卡已复制到剪贴板。')
  }
  const deleteSelected = () => {
    if (!selectedId) { notify('请先选择要删除的档案。'); return }
    const record = records.find((item) => item.id === selectedId)
    if (!window.confirm(`确认删除“${record?.personName || '该'}”档案吗？`)) return
    persist(records.filter((recordItem) => recordItem.id !== selectedId)); resetForm(); notify('档案已删除。')
  }
  const loadDemo = () => {
    const next = records.some((record) => record.id === demoRecord.id) ? records : [demoRecord, ...records]
    persist(next); selectRecord(demoRecord); scrollToStart(); notify('示例档案已载入。')
  }
  const exportData = () => {
    if (!records.length) { notify('暂无可导出的档案。'); return }
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `qinjing-oral-history-${today()}.json`; link.click(); URL.revokeObjectURL(url); notify('档案 JSON 已导出。')
  }
  const downloadPostcard = () => {
    if (!storyText || !form.personName.trim()) { notify('请先生成故事卡。'); return }
    const canvas = document.createElement('canvas')
    canvas.width = 1400
    canvas.height = 900
    const context = canvas.getContext('2d')
    if (!context) { notify('当前浏览器无法生成明信片。'); return }
    const drawCard = () => {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
      background.addColorStop(0, '#fffaf0')
      background.addColorStop(0.55, '#f4ead7')
      background.addColorStop(1, '#ead7bd')
      context.fillStyle = background
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.strokeStyle = '#8c3f32'
      context.lineWidth = 5
      context.strokeRect(34, 34, canvas.width - 68, canvas.height - 68)
      context.setLineDash([3, 12])
      context.lineWidth = 2
      context.strokeRect(56, 56, canvas.width - 112, canvas.height - 112)
      context.setLineDash([])
      context.fillStyle = 'rgba(140, 63, 50, .08)'
      context.fillRect(760, 80, 1, 720)
      context.fillStyle = '#7b332b'
      context.font = '600 27px system-ui, sans-serif'
      context.fillText('北科光影志  ·  口述校史明信片', 92, 116)
      context.font = '22px system-ui, sans-serif'
      context.fillStyle = '#526052'
      context.fillText(`${scene.label}  /  ${form.year || '岁月留痕'}`, 92, 158)
      context.fillStyle = '#182c41'
      context.font = '500 58px Instrument Serif, serif'
      context.fillText(form.personName, 92, 254)
      context.font = '24px system-ui, sans-serif'
      context.fillStyle = '#7b332b'
      context.fillText(`${form.identity || '亲历者'}  ·  ${form.place || '北京科技大学'}`, 96, 298)
      context.fillStyle = '#4b554d'
      const storyTop = 342
      const storyBottom = 790
      const storyWidth = 620
      let storyFontSize = 23
      let storyLines: string[] = []
      const wrapStory = (fontSize: number) => {
        context.font = `${fontSize}px system-ui, sans-serif`
        const lines: string[] = []
        storyText.split('\n').forEach((paragraph) => {
          if (!paragraph) {
            lines.push('')
            return
          }
          let line = ''
          Array.from(paragraph).forEach((character) => {
            const candidate = line + character
            if (context.measureText(candidate).width > storyWidth && line) {
              lines.push(line)
              line = character
            } else {
              line = candidate
            }
          })
          if (line) lines.push(line)
        })
        return lines
      }
      while (storyFontSize > 12) {
        storyLines = wrapStory(storyFontSize)
        const lineHeight = Math.round(storyFontSize * 1.5)
        if (storyLines.length * lineHeight <= storyBottom - storyTop) break
        storyFontSize -= 1
      }
      storyLines = wrapStory(storyFontSize)
      const storyLineHeight = Math.round(storyFontSize * 1.5)
      storyLines.forEach((line, index) => context.fillText(line, 96, storyTop + index * storyLineHeight))
      const image = new Image()
      image.onload = () => {
        context.save()
        context.beginPath()
        context.rect(820, 210, 445, 315)
        context.clip()
        const scale = Math.max(445 / image.width, 315 / image.height)
        const width = image.width * scale
        const height = image.height * scale
        context.drawImage(image, 820 + (445 - width) / 2, 210 + (315 - height) / 2, width, height)
        context.restore()
        context.strokeStyle = '#8c3f32'
        context.lineWidth = 4
        context.strokeRect(820, 210, 445, 315)
        context.beginPath()
        context.arc(1100, 675, 74, 0, Math.PI * 2)
        context.strokeStyle = 'rgba(123, 51, 43, .65)'
        context.lineWidth = 4
        context.stroke()
        context.font = '600 21px system-ui, sans-serif'
        context.fillStyle = '#7b332b'
        context.textAlign = 'center'
        context.fillText('北科 · 记忆', 1100, 668)
        context.font = '18px system-ui, sans-serif'
        context.fillText('SINCE 1952', 1100, 698)
        context.textAlign = 'left'
        context.font = '23px system-ui, sans-serif'
        context.fillStyle = '#7b332b'
        context.fillText('一帧光影，一段校史；一封明信片，一份念想。', 92, 800)
        context.font = '18px system-ui, sans-serif'
        context.fillStyle = '#6a7569'
        context.fillText('QINJING ORAL HISTORY ARCHIVE', 92, 830)
        canvas.toBlob((blob) => {
          if (!blob) { notify('明信片导出失败。'); return }
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${form.personName}-北科故事明信片.png`
          link.click()
          URL.revokeObjectURL(url)
          notify('明信片图片已下载。')
        }, 'image/png')
      }
      image.onerror = () => notify('明信片图片生成失败，请稍后重试。')
      image.src = new URL(postcardPhoto, window.location.href).href
    }
    drawCard()
  }

  return <div className="showcase-page">
    <section className="relative h-screen w-full overflow-hidden bg-black" id="top">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {scenes.map((item, index) => <img key={item.src} src={item.src} alt={item.alt} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${index === activeScene ? 'opacity-100' : 'opacity-0'}`} />)}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <img className="train-bob pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover" src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" alt="" />
      <div className="relative z-[2] flex h-full flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-14 lg:py-8">
        <nav className="flex items-center justify-between" aria-label="主导航">
          <a href="#top" className="font-serif text-xl italic text-white sm:text-2xl" style={{ fontFamily: "'Instrument Serif', serif" }}>北科光影志</a>
          <div className="liquid-glass hidden items-center gap-1 rounded-full p-1.5 md:flex" style={{ fontFamily: 'system-ui, sans-serif' }}>{navLinks.map((link) => <a key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm text-white/90 hover:text-white">{link.label}</a>)}<button type="button" onClick={scrollToStart} className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#182C41]">开始采录</button></div>
          <button type="button" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="liquid-glass relative flex h-11 w-11 items-center justify-center rounded-full text-white md:hidden"><Menu className={`absolute transition-all duration-300 ${menuOpen ? 'rotate-90 scale-75 opacity-0' : 'opacity-100'}`} size={20} /><X className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-100' : '-rotate-90 scale-75 opacity-0'}`} size={20} /></button>
        </nav>
        <main className="flex flex-1 flex-col items-center justify-center pb-4 text-center text-white">
          <div className="liquid-glass rounded-full px-4 py-2 text-[11px] tracking-wide text-white/90 sm:text-xs" style={{ fontFamily: 'system-ui, sans-serif' }}>四季光影，记录每一段北科记忆</div>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.08] tracking-[-0.04em] sm:text-6xl md:text-8xl lg:text-[6rem]" style={{ fontFamily: "'Instrument Serif', serif" }}>在时间深处，<br />看见北科</h1>
          <p className="mt-5 max-w-xl px-3 text-sm leading-relaxed text-white/80 sm:text-base" style={{ fontFamily: 'system-ui, sans-serif' }}>{scene.description}</p>
          <button type="button" onClick={scrollToStart} className="liquid-glass mt-7 flex items-center gap-3 rounded-full px-5 py-2.5 text-sm text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>进入采录舱 <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><ArrowDown size={16} /></span></button>
        </main>
        <footer className="flex flex-col items-center gap-5" id="seasons">
          <div className="flex max-w-full items-center gap-3 overflow-x-auto pb-1 sm:gap-5" role="tablist" aria-label="切换校园影像" style={{ fontFamily: 'system-ui, sans-serif' }}>{scenes.map((item, index) => <button key={item.src} type="button" role="tab" aria-selected={activeScene === index} disabled={isTransitioning} onClick={() => selectScene(index)} className={`whitespace-nowrap border-b pb-1 text-xs transition-all sm:text-sm ${activeScene === index ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white/80'}`}>{item.label}</button>)}</div>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-xs text-white/70 sm:gap-x-5 sm:text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>{stats.map((stat, index) => <span key={stat} className="flex items-center gap-x-3 sm:gap-x-5">{index > 0 && <span className="hidden text-white/40 sm:inline">|</span>}{stat}</span>)}</div>
        </footer>
      </div>
      <div className="hero-warm-fade" aria-hidden="true" />
      <div className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-500 md:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}><div className="flex h-full flex-col items-center justify-center gap-7 px-8 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>{navLinks.map((link, index) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`text-3xl text-white transition-all duration-500 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${100 + index * 50}ms` }}>{link.label}</a>)}<button type="button" onClick={() => { setMenuOpen(false); scrollToStart() }} className={`mt-5 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#182C41] transition-all duration-500 ${menuOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`} style={{ transitionDelay: '300ms' }}>开始采录</button></div></div>
    </section>

    <div className="workspace-transition" aria-hidden="true">
      <span className="workspace-transition-line" />
      <span className="workspace-transition-label">从一帧光影，到一个人的故事</span>
      <span className="workspace-transition-line" />
    </div>

    <section className="workspace-section" id="start">
      <div className="workspace-backdrop" style={{ backgroundImage: `url(${scene.src})` }} aria-hidden="true" />
      <div className="workspace-shell liquid-glass-strong">
        <div className="workspace-header"><div><div className="eyebrow">Digital Collection Cabin</div><h2 className="workspace-title">口述校史数字采录舱</h2><p className="workspace-desc">在本地浏览器中录入访谈信息、建立人物档案、检索资料，并自动整理为可复制的人物故事卡。</p></div><div className="status-strip"><div className="stat-card liquid-glass"><strong>{records.length}</strong><span>已建档人物</span></div><div className="stat-card liquid-glass"><strong>{authorizedCount}</strong><span>已授权</span></div><div className="stat-card liquid-glass"><strong>{yearSpan}</strong><span>时间跨度</span></div></div></div>
        <div className="workspace-grid">
          <section className="panel-card liquid-glass"><h2>人物建档与访谈录入</h2><p className="panel-note">填写后点击“保存档案”。数据保存在当前浏览器 localStorage 中，不会上传到网络。</p><form className="capture-form" onSubmit={saveRecord}>
            <div className="form-row"><Field label="姓名" value={form.personName} onChange={(value) => updateField('personName', value)} required placeholder="如：张老师" /><SelectField label="身份" value={form.identity} onChange={(value) => updateField('identity', value)} options={['老校友', '老教师', '老职工', '亲历者家属', '其他']} /></div>
            <div className="form-row"><Field label="关键年份" value={form.year} onChange={(value) => updateField('year', value)} type="number" placeholder="如：1952" /><Field label="地点 / 院系" value={form.place} onChange={(value) => updateField('place', value)} placeholder="如：钢铁冶金系、学院路" /></div>
            <Field label="关键词" value={form.keywords} onChange={(value) => updateField('keywords', value)} placeholder="用逗号分隔，如：建校初期, 炼钢" /><TextField label="访谈摘要" value={form.summary} onChange={(value) => updateField('summary', value)} required placeholder="概括亲历者与学校、学科或时代同行的经历。" /><TextField label="口述片段 / 原话" value={form.quoteInput} onChange={(value) => updateField('quoteInput', value)} placeholder="记录最有温度的一段原话。" /><TextField label="青年寄语" value={form.message} onChange={(value) => updateField('message', value)} placeholder="给今天青年学生的一句话。" />
            <div className="form-row"><SelectField label="授权状态" value={form.authorized} onChange={(value) => updateField('authorized', value)} options={[['yes', '已授权整理展示'], ['pending', '待确认授权'], ['private', '仅内部保存']]} /><Field label="备注" value={form.contact} onChange={(value) => updateField('contact', value)} placeholder="可选，用于后续回访" /></div>
            <div className="form-actions"><button className="primary-button liquid-glass" type="submit">保存档案</button><button className="secondary-button liquid-glass" type="button" onClick={resetForm}>清空表单</button><button className="secondary-button liquid-glass" type="button" onClick={loadDemo}>载入示例</button></div>
          </form></section>
          <section className="panel-card liquid-glass"><h2>资料库检索与故事生成</h2><p className="panel-note">点击档案可回填编辑；选中档案后可生成故事卡、复制文本或导出 JSON 备份。</p><div className="searchbar"><Field label="检索人物 / 年份 / 地点 / 关键词" value={query} onChange={setQuery} placeholder="输入关键词筛选档案" /><div className="list-actions"><button className="secondary-button liquid-glass" type="button" onClick={exportData}><Download size={14} /> 导出</button><button className="danger-button liquid-glass" type="button" onClick={deleteSelected}>删除选中</button></div></div><div className="archive-list">{filteredRecords.length ? filteredRecords.map((record) => <button className={`archive-item ${selectedId === record.id ? 'active' : ''}`} key={record.id} type="button" onClick={() => selectRecord(record)}><div className="archive-head"><strong>{record.personName}</strong><span className="tag">{authorizationLabel(record.authorized)}</span></div><div className="archive-meta">{record.identity} · {record.year || '年份未填'} · {record.place || '地点未填'}</div><div className="archive-tags">{keywordsOf(record.keywords).slice(0, 4).map((keyword) => <span className="tag" key={keyword}>{keyword}</span>)}</div></button>) : <div className="empty-state">暂无匹配档案。请保存第一份访谈记录，或载入示例档案。</div>}</div>{storyText && <figure className="postcard-figure"><div className="postcard"><div className="postcard-copy"><div className="postcard-kicker">北科光影志 · 口述校史明信片</div><div className="postcard-scene">{scene.label} · {form.year || '岁月留痕'}</div><h3>{form.personName}</h3><div className="postcard-meta">{form.identity || '亲历者'} · {form.place || '北京科技大学'}</div><p>{storyText}</p><div className="postcard-footer">一帧光影，一段校史；一封明信片，一份念想。</div></div><div className="postcard-image"><img src={postcardPhoto} alt="从北科图片库随机抽取的明信片校园照片" onError={(event) => { event.currentTarget.src = postcardPhotos[0] }} /><div className="postmark"><strong>北科</strong><span>SINCE 1952</span></div></div></div><figcaption>故事生成后自动排版为校史明信片，可下载保存。</figcaption></figure>}<div className="story-card"><div className="story-meta">Oral History Story Card</div>{storyText ? <><h3>{form.personName}：{keywordsOf(form.keywords).join(' / ') || '校史记忆'}</h3><p>{storyText}</p></> : <><h3>请选择或保存一位受访者</h3><p>系统会根据人物信息、访谈摘要、口述片段与青年寄语，自动整理为故事卡。</p></>}</div><div className="card-actions"><button className="primary-button liquid-glass" type="button" onClick={generateStory}><Sparkles size={14} /> 生成故事卡</button>{storyText && <button className="secondary-button liquid-glass" type="button" onClick={downloadPostcard}><Download size={14} /> 下载明信片</button>}<button className="secondary-button liquid-glass" type="button" onClick={copyStory}>复制故事卡</button></div></section>
        </div>
      </div>
    </section>
    {toast && <div className="toast show" role="status">{toast}</div>}
  </div>
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) { return <label className="field"><span>{label}</span><input type={type} required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label> }
function TextField({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) { return <label className="field"><span>{label}</span><textarea required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label> }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: (string | [string, string])[] }) { return <label className="field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => { const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option]; return <option key={optionValue} value={optionValue}>{optionLabel}</option> })}</select></label> }
