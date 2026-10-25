import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, Accessibility, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3,
  Bell, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Code2, Download,
  ExternalLink, FileCheck2, FileClock, FileText, Gauge, Globe2, LayoutDashboard,
  Menu, Play, Plus, Search, Settings2, ShieldCheck, Sparkles, Target, Trash2,
  TriangleAlert, X, Zap
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const initialIssues = [
  { id: 1, title: 'Images missing alternative text', category: 'Accessibility', severity: 'High', page: '/products', status: 'Open', detail: 'Add descriptive alt text to meaningful images so screen-reader users can understand their purpose.' },
  { id: 2, title: 'Low contrast text detected', category: 'Accessibility', severity: 'Medium', page: '/pricing', status: 'Open', detail: 'Increase foreground/background contrast to improve readability. Aim for at least 4.5:1 for normal text.' },
  { id: 3, title: 'Large JavaScript bundle', category: 'Performance', severity: 'High', page: '/', status: 'Open', detail: 'Consider code splitting and lazy-loading routes to reduce the initial JavaScript payload.' },
  { id: 4, title: 'Page title could be more descriptive', category: 'SEO', severity: 'Low', page: '/about', status: 'Open', detail: 'Write a unique, descriptive page title that explains the page content.' },
  { id: 5, title: 'Form input has no label', category: 'Accessibility', severity: 'High', page: '/contact', status: 'Open', detail: 'Associate each form control with a visible label or an accessible name.' },
  { id: 6, title: 'Images could use modern formats', category: 'Performance', severity: 'Medium', page: '/', status: 'Open', detail: 'Serve appropriately sized WebP or AVIF images where supported.' },
  { id: 7, title: 'Missing meta description', category: 'SEO', severity: 'Low', page: '/blog', status: 'Open', detail: 'Add a concise summary of the page to help search engines describe the result.' },
]

const chartData = [
  { day: 'Mon', score: 64 }, { day: 'Tue', score: 68 }, { day: 'Wed', score: 66 },
  { day: 'Thu', score: 73 }, { day: 'Fri', score: 70 }, { day: 'Sat', score: 79 },
  { day: 'Sun', score: 84 },
]

const initialReports = [
  { id: 'DL-1048', site: 'sample-store.dev', date: 'Today, 10:42 AM', score: 84, status: 'Completed' },
  { id: 'DL-1042', site: 'portfolio-demo.dev', date: 'Yesterday, 4:18 PM', score: 76, status: 'Completed' },
  { id: 'DL-1036', site: 'docs-example.dev', date: 'Oct 21, 2:05 PM', score: 91, status: 'Completed' },
]

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [issues, setIssues] = useState(() => readStorage('devlens-issues', initialIssues))
  const [reports, setReports] = useState(() => readStorage('devlens-reports', initialReports))
  const [auditUrl, setAuditUrl] = useState('https://sample-store.dev')
  const [auditRunning, setAuditRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('All severities')
  const [category, setCategory] = useState('All categories')
  const [contrastFg, setContrastFg] = useState('#202638')
  const [contrastBg, setContrastBg] = useState('#ffffff')
  const [snippet, setSnippet] = useState('<img src="hero.png">')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => localStorage.setItem('devlens-issues', JSON.stringify(issues)), [issues])
  useEffect(() => localStorage.setItem('devlens-reports', JSON.stringify(reports)), [reports])
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3200)
    return () => clearTimeout(id)
  }, [notice])

  const runAudit = () => {
    if (!auditUrl.trim()) {
      setNotice('Enter a website URL to run the demo audit.')
      return
    }
    setAuditRunning(true)
    setNotice('')
    // This is intentionally a demo audit: no external website is scanned.
    window.setTimeout(() => {
      const newReport = {
        id: `DL-${Math.floor(1000 + Math.random() * 8999)}`,
        site: auditUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        score: 72 + Math.floor(Math.random() * 24),
        status: 'Completed',
      }
      setReports(prev => [newReport, ...prev])
      setAuditRunning(false)
      setNotice('Demo audit complete — report saved to your browser.')
      navigate('/reports')
    }, 900)
  }

  const toggleIssue = id => {
    setIssues(prev => prev.map(issue => issue.id === id
      ? { ...issue, status: issue.status === 'Resolved' ? 'Open' : 'Resolved' }
      : issue))
  }

  const filteredIssues = useMemo(() => issues.filter(issue => {
    const matchesSearch = `${issue.title} ${issue.page} ${issue.category}`.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severity === 'All severities' || issue.severity === severity
    const matchesCategory = category === 'All categories' || issue.category === category
    return matchesSearch && matchesSeverity && matchesCategory
  }), [issues, search, severity, category])

  const exportReport = report => {
    const blob = new Blob([JSON.stringify({ ...report, demoData: true, issues }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.id.toLowerCase()}-report.json`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Report exported as JSON.')
  }

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/audits', label: 'Website audits', icon: Gauge },
    { to: '/issues', label: 'Issues', icon: TriangleAlert, count: issues.filter(i => i.status === 'Open').length },
    { to: '/accessibility', label: 'Accessibility lab', icon: Accessibility },
    { to: '/reports', label: 'Reports & history', icon: FileText },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Activity size={21} strokeWidth={2.8} /></div>
          <span>dev<span className="brand-accent">lens</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="workspace">
          <div className="workspace-icon"><Code2 size={17}/></div>
          <div><strong>Frontend Studio</strong><small>Personal workspace</small></div>
          <ChevronDown size={15} className="muted-icon"/>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map(item => {
            const Icon = item.icon
            return <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18}/><span>{item.label}</span>{item.count > 0 && <b className="nav-count">{item.count}</b>}
            </NavLink>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Sparkles size={17}/></div>
            <strong>Quality starts here</strong>
            <p>Small fixes can make a big difference to every visitor.</p>
            <button onClick={() => navigate('/accessibility')}>Explore tools <ArrowRight size={14}/></button>
          </div>
          <button className="nav-item settings-link" onClick={() => setNotice('Settings are not required for this frontend demo.')}><Settings2 size={18}/><span>Settings</span></button>
          <div className="profile-row"><div className="avatar">D</div><div><strong>Demo Developer</strong><small>Free workspace</small></div><button className="icon-button" onClick={() => setNotice('This is a local demo workspace.')} aria-label="Profile info"><CircleHelp size={17}/></button></div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{navItems.find(n => n.to === location.pathname)?.label || 'Overview'}</strong></div>
          <div className="top-actions"><span className="status-pill"><span className="status-dot"/> All systems normal</span><button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice('You’re all caught up!')}><Bell size={18}/><i/></button><div className="top-avatar">D</div></div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Overview reports={reports} issues={issues} auditUrl={auditUrl} setAuditUrl={setAuditUrl} runAudit={runAudit} auditRunning={auditRunning} navigate={navigate} />} />
            <Route path="/audits" element={<Audits auditUrl={auditUrl} setAuditUrl={setAuditUrl} runAudit={runAudit} auditRunning={auditRunning} reports={reports} exportReport={exportReport} />} />
            <Route path="/issues" element={<Issues issues={filteredIssues} allIssues={issues} search={search} setSearch={setSearch} severity={severity} setSeverity={setSeverity} category={category} setCategory={setCategory} toggleIssue={toggleIssue} />} />
            <Route path="/accessibility" element={<AccessibilityLab contrastFg={contrastFg} setContrastFg={setContrastFg} contrastBg={contrastBg} setContrastBg={setContrastBg} snippet={snippet} setSnippet={setSnippet} setNotice={setNotice} />} />
            <Route path="/reports" element={<Reports reports={reports} exportReport={exportReport} setReports={setReports} setNotice={setNotice} />} />
            <Route path="*" element={<Overview reports={reports} issues={issues} auditUrl={auditUrl} setAuditUrl={setAuditUrl} runAudit={runAudit} auditRunning={auditRunning} navigate={navigate} />} />
          </Routes>
          <footer className="footer"><span>© 2026 DevLens Studio</span><span><span className="demo-dot"/> Frontend demo · Data stays in this browser</span><a href="https://www.w3.org/WAI/" target="_blank" rel="noreferrer">Accessibility resources <ExternalLink size={12}/></a></footer>
        </div>
      </main>
      {notice && <div className="toast" role="status"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function ScoreRing({ score, size = 112 }) {
  const radius = 43
  const circumference = 2 * Math.PI * radius
  return <div className="score-ring" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="50" cy="50" r={radius} className="ring-track"/>
      <circle cx="50" cy="50" r={radius} className="ring-progress" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - score / 100) }} />
    </svg>
    <div className="ring-label"><strong>{score}</strong><span>out of 100</span></div>
  </div>
}

function Overview({ reports, issues, auditUrl, setAuditUrl, runAudit, auditRunning, navigate }) {
  const openCount = issues.filter(i => i.status === 'Open').length
  const latestScore = reports[0]?.score ?? 84
  return <>
    <PageHeading eyebrow="MONDAY, OCTOBER 26, 2026" title="Website quality overview" description="A clearer view of your site's performance, accessibility and overall health." action={<button className="button button-secondary" onClick={() => navigate('/reports')}><FileClock size={16}/> View reports</button>} />
    <section className="welcome-banner">
      <div className="welcome-glow"/>
      <div className="welcome-copy"><div className="banner-label"><Sparkles size={14}/> YOUR QUALITY WORKSPACE</div><h2>Build a better web,<br/><span>one fix at a time.</span></h2><p>Run a demo audit, explore issues, and find practical ways to improve your website.</p>
        <form className="audit-form" onSubmit={e => { e.preventDefault(); runAudit() }}><Globe2 size={18}/><input value={auditUrl} onChange={e => setAuditUrl(e.target.value)} aria-label="Website URL" placeholder="https://yourwebsite.com"/><button className="button button-primary" disabled={auditRunning}>{auditRunning ? <><span className="spinner"/> Auditing</> : <><Play size={15} fill="currentColor"/> Run demo audit</>}</button></form>
        <div className="demo-note"><ShieldCheck size={13}/> Demo mode: uses sample data and does not scan the live website.</div>
      </div>
      <div className="banner-visual"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-core"><Gauge size={38}/></div><div className="float-tag tag-top"><Zap size={14}/> Fast insights</div><div className="float-tag tag-bottom"><CheckCircle2 size={14}/> Actionable fixes</div></div>
    </section>

    <div className="section-title-row"><div><h2>At a glance</h2><p>Your latest quality indicators</p></div><span className="updated-label"><span className="status-dot"/> Updated just now</span></div>
    <section className="stats-grid">
      <StatCard icon={Gauge} label="Overall quality" value={`${latestScore}`} suffix="/100" change="+8 pts" positive detail="Latest demo report" tone="purple"/>
      <StatCard icon={TriangleAlert} label="Open issues" value={openCount} change={`${issues.filter(i => i.severity === 'High' && i.status === 'Open').length} high priority`} detail="Across all sample pages" tone="orange"/>
      <StatCard icon={Accessibility} label="Accessibility" value="82" suffix="/100" change="+5 pts" positive detail="Demo score" tone="blue"/>
      <StatCard icon={FileCheck2} label="Saved reports" value={reports.length} change="View history" detail="Stored in this browser" tone="green"/>
    </section>

    <section className="dashboard-grid">
      <div className="panel score-panel">
        <div className="panel-heading"><div><h3>Quality score trend</h3><p>Illustrative weekly progress</p></div><button className="select-like" onClick={() => navigate('/reports')}>This week <ChevronDown size={14}/></button></div>
        <div className="chart-legend"><span><i className="legend-dot"/> Quality score</span><span className="chart-summary">+20 points <ArrowUpRight size={14}/></span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c6cf2" stopOpacity={0.23}/><stop offset="95%" stopColor="#7c6cf2" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e9edf4"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a94a7', fontSize: 11 }} dy={10}/><YAxis domain={[50,100]} axisLine={false} tickLine={false} tick={{ fill: '#8a94a7', fontSize: 11 }}/><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e6eaf1', fontSize: 12 }} formatter={v => [`${v}/100`, 'Quality score']}/><Area type="monotone" dataKey="score" stroke="#7666e8" strokeWidth={2.5} fill="url(#scoreFill)" activeDot={{ r: 5, strokeWidth: 0 }}/></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="panel category-panel">
        <div className="panel-heading"><div><h3>Quality categories</h3><p>Demo audit breakdown</p></div><button className="icon-button" onClick={() => navigate('/audits')} aria-label="Open audits"><ArrowUpRight size={17}/></button></div>
        <CategoryScore icon={Zap} label="Performance" score={78} color="purple"/>
        <CategoryScore icon={Accessibility} label="Accessibility" score={82} color="blue"/>
        <CategoryScore icon={ShieldCheck} label="Best practices" score={91} color="green"/>
        <CategoryScore icon={Search} label="SEO" score={88} color="orange"/>
        <button className="text-link" onClick={() => navigate('/audits')}>Explore audit details <ArrowRight size={15}/></button>
      </div>
    </section>

    <section className="panel issues-panel">
      <div className="panel-heading"><div><h3>Issues to look at</h3><p>Prioritized suggestions from the sample audit</p></div><button className="text-link" onClick={() => navigate('/issues')}>View all issues <ArrowRight size={15}/></button></div>
      <div className="table-wrap"><table><thead><tr><th>ISSUE</th><th>CATEGORY</th><th>SEVERITY</th><th>PAGE</th><th>STATUS</th></tr></thead><tbody>{issues.filter(i => i.status === 'Open').slice(0,4).map(issue => <tr key={issue.id}><td><div className="issue-title-cell"><span className={`issue-symbol ${issue.severity.toLowerCase()}`}><TriangleAlert size={15}/></span><strong>{issue.title}</strong></div></td><td><span className="category-text">{issue.category}</span></td><td><Severity severity={issue.severity}/></td><td><code>{issue.page}</code></td><td><span className="open-status"><i/> Open</span></td></tr>)}</tbody></table></div>
    </section>
  </>
}

function StatCard({ icon: Icon, label, value, suffix, change, positive, detail, tone }) {
  return <div className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={19}/></span><span className={`stat-change ${positive ? 'positive' : ''}`}>{positive && <ArrowUpRight size={13}/>} {change}</span></div><div className="stat-value">{value}<small>{suffix}</small></div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div></div>
}

function CategoryScore({ icon: Icon, label, score, color }) {
  return <div className="category-score-row"><span className={`category-icon ${color}`}><Icon size={16}/></span><span className="category-name">{label}</span><div className="mini-progress"><i className={color} style={{ width: `${score}%` }}/></div><strong>{score}</strong></div>
}

function Severity({ severity }) {
  return <span className={`severity ${severity.toLowerCase()}`}><i/>{severity}</span>
}

function Audits({ auditUrl, setAuditUrl, runAudit, auditRunning, reports, exportReport }) {
  return <>
    <PageHeading eyebrow="AUDIT CENTER" title="Website audits" description="Run a guided demo audit and review quality signals in one place." />
    <section className="panel audit-start-panel"><div className="audit-start-icon"><Gauge size={25}/></div><div className="audit-start-content"><h2>Start a website audit</h2><p>Enter a URL to create a sample report. This prototype does not fetch or scan external websites.</p><form className="audit-form audit-form-light" onSubmit={e => { e.preventDefault(); runAudit() }}><Globe2 size={18}/><input value={auditUrl} onChange={e => setAuditUrl(e.target.value)} placeholder="https://yourwebsite.com" aria-label="Website URL"/><button className="button button-primary" disabled={auditRunning}>{auditRunning ? <><span className="spinner"/> Running</> : <><Play size={15} fill="currentColor"/> Run demo audit</>}</button></form></div></section>
    <div className="info-banner"><CircleHelp size={17}/><div><strong>Why demo mode?</strong><p>A browser-only app cannot reliably audit arbitrary websites due to cross-origin security restrictions. The demo uses generated sample scores and predefined issue examples.</p></div></div>
    <section className="panel reports-panel"><div className="panel-heading"><div><h3>Recent audit runs</h3><p>Your saved demo reports</p></div><span className="count-chip">{reports.length} reports</span></div><div className="table-wrap"><table><thead><tr><th>REPORT ID</th><th>WEBSITE</th><th>DATE</th><th>SCORE</th><th>STATUS</th><th/></tr></thead><tbody>{reports.map(report => <tr key={report.id}><td><code>{report.id}</code></td><td><strong>{report.site}</strong></td><td>{report.date}</td><td><span className={`score-pill ${report.score >= 85 ? 'good' : report.score >= 70 ? 'medium' : 'low'}`}>{report.score}/100</span></td><td><span className="completed-status"><CheckCircle2 size={14}/> Completed</span></td><td><button className="icon-button" onClick={() => exportReport(report)} aria-label={`Export ${report.id}`}><Download size={16}/></button></td></tr>)}</tbody></table></div></section>
  </>
}

function Issues({ issues, allIssues, search, setSearch, severity, setSeverity, category, setCategory, toggleIssue }) {
  const [expanded, setExpanded] = useState(null)
  return <>
    <PageHeading eyebrow="QUALITY BACKLOG" title="Issues & recommendations" description="Explore findings, understand their impact and track your fixes." action={<span className="count-chip">{allIssues.filter(i => i.status === 'Open').length} open issues</span>} />
    <section className="filter-panel"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues, pages, categories..." aria-label="Search issues"/></div><select value={severity} onChange={e => setSeverity(e.target.value)} aria-label="Filter severity"><option>All severities</option><option>High</option><option>Medium</option><option>Low</option></select><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter category"><option>All categories</option><option>Accessibility</option><option>Performance</option><option>SEO</option></select><span className="filter-result">{issues.length} results</span></section>
    <div className="issue-list">{issues.map(issue => <article className={`issue-card ${issue.status === 'Resolved' ? 'resolved-card' : ''}`} key={issue.id}><button className="issue-card-main" onClick={() => setExpanded(expanded === issue.id ? null : issue.id)}><span className={`issue-symbol ${issue.severity.toLowerCase()}`}>{issue.status === 'Resolved' ? <Check size={16}/> : <TriangleAlert size={16}/>}</span><span className="issue-card-copy"><strong>{issue.title}</strong><small>{issue.category} <span>·</span> <code>{issue.page}</code></small></span><Severity severity={issue.severity}/><span className={`issue-status ${issue.status.toLowerCase()}`}>{issue.status}</span><ChevronDown size={17} className={`expand-icon ${expanded === issue.id ? 'expanded' : ''}`}/></button>{expanded === issue.id && <div className="issue-expanded"><p>{issue.detail}</p><div className="issue-expanded-actions"><span className="recommendation-label"><Sparkles size={14}/> Suggested next step</span><button className={`button ${issue.status === 'Resolved' ? 'button-secondary' : 'button-primary'}`} onClick={() => toggleIssue(issue.id)}>{issue.status === 'Resolved' ? 'Reopen issue' : <><Check size={15}/> Mark as resolved</>}</button></div></div>}</article>)}{issues.length === 0 && <div className="empty-state"><Search size={26}/><h3>No issues found</h3><p>Try a different search term or change your filters.</p></div>}</div>
  </>
}

function AccessibilityLab({ contrastFg, setContrastFg, contrastBg, setContrastBg, snippet, setSnippet, setNotice }) {
  const [checkSnippet, setCheckSnippet] = useState(false)
  const ratio = useMemo(() => contrastRatio(contrastFg, contrastBg), [contrastFg, contrastBg])
  const passesAA = ratio >= 4.5
  const passesLarge = ratio >= 3
  const snippetFindings = useMemo(() => {
    const findings = []
    if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(snippet)) findings.push({ title: 'Image missing alt attribute', desc: 'Add alt text to informative images, or alt="" for decorative images.' })
    if (/<input\b(?![^>]*\b(aria-label|id)\s*=)[^>]*>/i.test(snippet)) findings.push({ title: 'Input may need an accessible name', desc: 'Associate the input with a label or an accessible name.' })
    if (!/<html\b/i.test(snippet) && snippet.trim()) findings.push({ title: 'Snippet context is limited', desc: 'This checker only inspects a few patterns in the pasted HTML snippet.' })
    return findings
  }, [snippet])
  return <>
    <PageHeading eyebrow="ACCESSIBILITY TOOLKIT" title="Accessibility lab" description="Try small, practical checks that can make interfaces easier to use." action={<span className="beta-chip"><Sparkles size={13}/> Interactive tools</span>} />
    <section className="lab-grid">
      <div className="panel contrast-panel"><div className="panel-heading"><div><h3>Color contrast checker</h3><p>Check text readability against WCAG contrast thresholds.</p></div><span className="tool-icon"><Accessibility size={19}/></span></div>
        <div className="color-inputs"><label>Text color<div className="color-control"><input type="color" value={contrastFg} onChange={e => setContrastFg(e.target.value)}/><code>{contrastFg.toUpperCase()}</code></div></label><label>Background color<div className="color-control"><input type="color" value={contrastBg} onChange={e => setContrastBg(e.target.value)}/><code>{contrastBg.toUpperCase()}</code></div></label></div>
        <div className="contrast-preview" style={{ color: contrastFg, backgroundColor: contrastBg }}><span>LIVE PREVIEW</span><strong>Readable by design.</strong><p>Accessible interfaces work better for more people.</p><small>Regular text · Sample UI</small></div>
        <div className="contrast-result"><div><span className="result-label">Contrast ratio</span><strong className="ratio-value">{ratio.toFixed(2)}:1</strong></div><div className="wcag-badges"><span className={passesAA ? 'pass' : 'fail'}>{passesAA ? <CheckCircle2 size={13}/> : <X size={13}/>} AA normal</span><span className={passesLarge ? 'pass' : 'fail'}>{passesLarge ? <CheckCircle2 size={13}/> : <X size={13}/>} AA large</span></div></div>
        <p className="helper-text">WCAG 2.2 AA generally requires 4.5:1 for normal text and 3:1 for large text. This calculator is a learning aid.</p>
      </div>
      <div className="panel snippet-panel"><div className="panel-heading"><div><h3>HTML snippet inspector</h3><p>Paste a small HTML snippet to check a few common patterns.</p></div><span className="tool-icon"><Code2 size={19}/></span></div>
        <label className="field-label" htmlFor="html-snippet">HTML snippet</label><textarea id="html-snippet" className="code-textarea" spellCheck="false" value={snippet} onChange={e => { setSnippet(e.target.value); setCheckSnippet(false) }}/>
        <button className="button button-primary full-button" onClick={() => setCheckSnippet(true)}><Search size={15}/> Inspect snippet</button>
        {checkSnippet && <div className="snippet-results"><div className="snippet-results-heading">{snippetFindings.length ? `${snippetFindings.length} observation${snippetFindings.length > 1 ? 's' : ''}` : 'No flagged patterns'}<span className={snippetFindings.length ? 'finding-dot' : 'good-dot'}/></div>{snippetFindings.length ? snippetFindings.map((finding, i) => <div className="finding-row" key={i}><TriangleAlert size={15}/><div><strong>{finding.title}</strong><p>{finding.desc}</p></div></div>) : <p className="success-copy">No issues detected by these basic checks. This is not a full accessibility audit.</p>}</div>}
        <div className="snippet-tip"><Sparkles size={15}/><p><strong>Remember:</strong> automated checks can catch some issues, but keyboard and screen-reader testing still matter.</p></div>
      </div>
    </section>
  </>
}

function contrastRatio(hex1, hex2) {
  const luminance = hex => {
    const values = hex.replace('#', '').match(/.{2}/g)
    if (!values || values.length !== 3) return 0
    const rgb = values.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
  }
  const a = luminance(hex1)
  const b = luminance(hex2)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function Reports({ reports, exportReport, setReports, setNotice }) {
  const clearReports = () => {
    if (window.confirm('Clear all saved demo reports from this browser?')) {
      setReports([])
      setNotice('Saved reports cleared.')
    }
  }
  return <>
    <PageHeading eyebrow="REPORT LIBRARY" title="Reports & history" description="Review previous demo audits and export reports for your records." action={<button className="button button-secondary" onClick={clearReports}><Trash2 size={15}/> Clear history</button>} />
    <div className="reports-summary"><div className="panel report-summary-card"><span className="stat-icon purple"><FileText size={19}/></span><div><strong>{reports.length}</strong><span>Total reports</span></div></div><div className="panel report-summary-card"><span className="stat-icon green"><CheckCircle2 size={19}/></span><div><strong>{reports.filter(r => r.status === 'Completed').length}</strong><span>Completed audits</span></div></div><div className="panel report-summary-card"><span className="stat-icon blue"><BarChart3 size={19}/></span><div><strong>{reports.length ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length) : '—'}</strong><span>Average score</span></div></div></div>
    <section className="panel reports-panel"><div className="panel-heading"><div><h3>All reports</h3><p>Reports are saved locally in this browser</p></div><span className="count-chip">{reports.length} total</span></div>{reports.length ? <div className="table-wrap"><table><thead><tr><th>REPORT ID</th><th>WEBSITE</th><th>DATE CREATED</th><th>QUALITY SCORE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{reports.map(report => <tr key={report.id}><td><code>{report.id}</code></td><td><strong>{report.site}</strong></td><td>{report.date}</td><td><span className={`score-pill ${report.score >= 85 ? 'good' : report.score >= 70 ? 'medium' : 'low'}`}>{report.score}/100</span></td><td><span className="completed-status"><CheckCircle2 size={14}/> Completed</span></td><td><button className="icon-button" onClick={() => exportReport(report)} aria-label={`Export ${report.id}`}><Download size={16}/></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><FileText size={27}/><h3>No saved reports</h3><p>Run a demo audit to create your first report.</p></div>}</section>
    <div className="info-banner"><ShieldCheck size={17}/><div><strong>Local-first by design</strong><p>Your saved reports are stored in localStorage on this device. Clearing browser data may remove them.</p></div></div>
  </>
}

export default App
