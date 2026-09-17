const TOC = [
  { id: 'introduction', num: '1', label: 'Introduction' },
  { id: 'base-url', num: '2', label: 'Base URL' },
  { id: 'authentication', num: '3', label: 'Authentication' },
  { id: 'endpoints', num: '4', label: 'Endpoints' },
  { id: 'ep-vehicle-logs', num: '4.1', label: 'GET /external/vehicle-logs', sub: true },
  { id: 'req-params', num: '4.1.1', label: 'Request Parameters', sub: true, deep: true },
  { id: 'req-constraints', num: '4.1.2', label: 'Request Constraints', sub: true, deep: true },
  { id: 'example-request', num: '4.1.3', label: 'Example Request', sub: true, deep: true },
  { id: 'response-format', num: '4.1.4', label: 'Response Format', sub: true, deep: true },
  { id: 'response-single', num: '4.1.5', label: 'Response Example (Single)', sub: true, deep: true },
  { id: 'response-multi', num: '4.1.6', label: 'Response Example (Multiple)', sub: true, deep: true },
  { id: 'error-handling', num: '5', label: 'Error Handling' },
  { id: 'error-codes', num: '5.1', label: 'Common Error Codes', sub: true },
];

const CodeBlock = ({ label, tone = 'request', children }) => {
  const dot = { request: 'bg-blue-400', response: 'bg-emerald-400', error: 'bg-rose-400' }[tone];
  const bar = { request: 'bg-slate-800', response: 'bg-emerald-950/60', error: 'bg-rose-950/60' }[tone];
  return (
    <div className="rounded-lg overflow-hidden bg-slate-900 shadow-sm mb-5 border border-slate-800">
      <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wide text-slate-200 ${bar}`}>
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        {label}
      </div>
      <pre className="px-5 py-4 overflow-x-auto text-[13px] leading-relaxed text-slate-100">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const K = ({ children }) => <span className="text-sky-300">{children}</span>;
const S = ({ children }) => <span className="text-emerald-300">{children}</span>;

const ParamTable = ({ rows }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
    <table className="w-full text-sm min-w-[560px]">
      <thead>
        <tr className="bg-gray-50 dark:bg-slate-700/50">
          <th className="text-left font-bold text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700">Field</th>
          <th className="text-left font-bold text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700">Type</th>
          <th className="text-left font-bold text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 dark:border-slate-700/60 last:border-b-0">
            <td className="px-4 py-2.5 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap align-top">{r.field}</td>
            <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap align-top">{r.type}</td>
            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 align-top">{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ErrorRow = ({ status, tone, title, desc }) => {
  const chip = {
    ok: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    warn: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    err: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  }[tone];
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-slate-700/60 last:border-b-0">
      <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md flex-shrink-0 ${chip}`}>{status}</span>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span> — {desc}
      </p>
    </div>
  );
};

const Section = ({ id, num, title, children }) => (
  <section id={id} className="mb-14 scroll-mt-24">
    <h2 className="flex items-baseline gap-2.5 text-2xl font-bold text-gray-900 dark:text-white pb-3 mb-5 border-b-2 border-gray-200 dark:border-slate-700">
      <span className="text-orange-600 dark:text-orange-400 text-lg font-mono">{num}</span>
      {title}
    </h2>
    {children}
  </section>
);

const SubSection = ({ id, num, title, children }) => (
  <div id={id} className="mb-7 scroll-mt-24">
    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white mb-3">
      <span className="text-gray-400 dark:text-gray-500 font-mono text-sm">{num}</span>
      {title}
    </h3>
    {children}
  </div>
);

const ExternalApiDocumentation = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Top bar */}
      <header className="bg-gray-900 dark:bg-slate-950 border-b border-gray-800 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl tracking-tight" style={{ fontFamily: "'Audiowide', sans-serif" }}>
                <span className="text-white">Road</span>
                <span className="text-orange-400" style={{ marginLeft: '-4px' }}>Pulse</span>
              </h1>
              <div className="text-[9px] font-medium text-gray-400 tracking-wide -mt-1">
                Powered by Transline Technologies
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-300">
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">API Reference</span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">v1.0</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 flex items-start gap-10">
        {/* TOC */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-8 self-start max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3 px-1">Contents</div>
          <nav className="space-y-0.5">
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block rounded-md px-2.5 py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors ${
                  item.deep ? 'pl-6' : item.sub ? 'pl-4 font-medium text-gray-800 dark:text-gray-200' : 'font-bold text-gray-900 dark:text-white mt-3 first:mt-0'
                }`}
              >
                <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px] mr-1.5">{item.num}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          <div className="mb-10 pb-8 border-b border-gray-200 dark:border-slate-700">
            <div className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-3">API Reference</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">RoadPulse External API Documentation</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Company-scoped, read-only access to ANPR vehicle detection data for partner integrations.
            </p>
            <div className="flex gap-6 mt-5 text-xs text-gray-400 dark:text-gray-500">
              <span><strong className="text-gray-600 dark:text-gray-300 font-semibold">Version</strong> &nbsp;1.0</span>
              <span><strong className="text-gray-600 dark:text-gray-300 font-semibold">Updated</strong> &nbsp;August 2026</span>
            </div>
          </div>

          {/* 1. Introduction */}
          <Section id="introduction" num="1" title="Introduction">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 max-w-2xl">
              The RoadPulse External API gives partner systems programmatic, read-only access to a company's own
              ANPR (Automatic Number Plate Recognition) vehicle detection data across its checkpoints and locations.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
              Authentication is required via an API key provided in the Bearer Token. A key can only ever access
              the data belonging to the company it was issued to — never another company's vehicles, checkpoints, or watchlist.
            </p>
          </Section>

          {/* 2. Base URL */}
          <Section id="base-url" num="2" title="Base URL">
            <p className="text-gray-700 dark:text-gray-300 mb-4">The base URL for all API requests is:</p>
            <CodeBlock label="BASE URL" tone="request">{'[BASE_URL]'}</CodeBlock>
            <p className="text-sm text-gray-500 dark:text-gray-400">Replace <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">[BASE_URL]</code> with the host provided for your integration.</p>
          </Section>

          {/* 3. Authentication */}
          <Section id="authentication" num="3" title="Authentication">
            <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
              All API requests require authentication using an API key provided via the <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Authorization</code> header
              with a Bearer Token. The API key is unique to your company and associates every request with your company code.
            </p>
            <CodeBlock label="Authentication Header" tone="request">
              Authorization: Bearer <S>[API_KEY]</S>
            </CodeBlock>
            <div className="flex gap-3 p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 max-w-2xl">
              <span className="text-lg leading-none">🔑</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Keep your key secret.</strong> It is shown once at creation
                time and cannot be recovered afterward. Store it server-side only — never in client-side code or a
                public repository.
              </p>
            </div>
          </Section>

          {/* 4. Endpoints */}
          <Section id="endpoints" num="4" title="Endpoints">
            <div id="ep-vehicle-logs" className="mb-8 scroll-mt-24">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-1">
                <span className="text-gray-400 dark:text-gray-500 font-mono text-sm">4.1</span>
              </h3>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">GET</span>
                <span className="font-mono text-base font-semibold text-gray-900 dark:text-white">/external/vehicle-logs</span>
                <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700">Bearer required</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
                Returns vehicle detection logs across the authenticated company's own locations and checkpoints, newest first.
              </p>

              <SubSection id="req-params" num="4.1.1" title="Request Parameters">
                <ParamTable rows={[
                  { field: 'start_date', type: 'datetime — required', desc: <>Start of the window, inclusive. Format <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">YYYY-MM-DDTHH:MM:SS</code> (full date and time — date-only is not accepted).</> },
                  { field: 'end_date', type: 'datetime — required', desc: <>End of the window, inclusive. Same format as <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">start_date</code>.</> },
                  { field: 'checkpoint_id', type: 'integer — optional', desc: "Restrict results to one checkpoint. Must belong to your company." },
                  { field: 'plate_number', type: 'string — optional', desc: 'Exact plate match, case-insensitive.' },
                  { field: 'is_blacklisted', type: 'boolean — optional', desc: "Only vehicles currently on your company's blacklist." },
                  { field: 'is_whitelisted', type: 'boolean — optional', desc: "Only vehicles currently on your company's whitelist." },
                  { field: 'direction', type: 'string — optional', desc: <>One of <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">in</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">out</code>.</> },
                  { field: 'expand_history', type: 'boolean — default false', desc: 'See note below.' },
                  { field: 'page', type: 'integer — default 1', desc: '1-indexed page number.' },
                  { field: 'page_size', type: 'integer — default 50', desc: 'Maximum 200.' },
                ]} />
                <div className="flex gap-3 p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 max-w-2xl mb-2">
                  <span className="text-lg leading-none">🕓</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">expand_history.</strong> When <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">false</code> (default),
                    the API returns one row per vehicle log using its latest detection; if that log actually holds multiple
                    detections, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">is_multiple_detections</code> is <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">true</code> and
                    the full detail for every detection is nested in a <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">timeline</code> array, oldest first. When <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">true</code>,
                    the API instead returns one top-level row per individual detection, already paginated at that level
                    (<code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">timeline</code> is then always empty, since each row already is one detection).
                  </p>
                </div>
              </SubSection>

              <SubSection id="req-constraints" num="4.1.2" title="Request Constraints">
                <ul className="space-y-2 max-w-2xl mb-2">
                  {[
                    <><code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">start_date</code> and <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">end_date</code> are both required — the request is rejected if either is missing.</>,
                    <><code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">end_date</code> must be strictly after <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">start_date</code>.</>,
                    <>The maximum allowed range between <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">start_date</code> and <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">end_date</code> is <strong className="text-gray-900 dark:text-white">24 hours</strong>.</>,
                    <>This endpoint allows at most <strong className="text-gray-900 dark:text-white">1 call per minute</strong> per API key, independent of the account's overall daily quota.</>,
                    <>Every call is also subject to the account's daily call quota (see the <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">X-RateLimit-Limit</code> / <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">X-RateLimit-Remaining</code> response headers).</>,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-orange-500 dark:text-orange-400 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </SubSection>

              <SubSection id="example-request" num="4.1.3" title="Example Request">
                <CodeBlock label="Request" tone="request">
{`GET `}<K>[BASE_URL]</K>{`/external/vehicle-logs?start_date=2026-08-13T00:00:00&end_date=2026-08-13T23:59:59&is_blacklisted=true&direction=in
Authorization: Bearer `}<S>[API_KEY]</S>
                </CodeBlock>
              </SubSection>

              <SubSection id="response-format" num="4.1.4" title="Response Format">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                  The response is a top-level JSON object with a <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">data</code> array and a <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">meta</code> object
                  describing pagination (<code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">page</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">page_size</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">total</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">total_pages</code>).
                  Each entry in <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">data</code> has the following fields:
                </p>
                <ParamTable rows={[
                  { field: 'plate_number', type: 'string', desc: 'Detected plate.' },
                  { field: 'location_name', type: 'string | null', desc: 'Site name.' },
                  { field: 'checkpoint_name', type: 'string | null', desc: 'Gate/checkpoint name.' },
                  { field: 'is_blacklisted', type: 'boolean', desc: 'Watchlist status at time of read.' },
                  { field: 'is_whitelisted', type: 'boolean', desc: 'Watchlist status at time of read.' },
                  { field: 'direction', type: 'string | null', desc: <><code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">in</code> or <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">out</code>, when known.</> },
                  { field: 'vehicle_type', type: 'string | null', desc: 'e.g. Car, Truck, Bike — when classified.' },
                  { field: 'is_multiple_detections', type: 'boolean', desc: 'True if this vehicle was seen more than once in this log.' },
                  { field: 'timestamp', type: 'datetime', desc: 'ISO 8601.' },
                  { field: 'first_seen / last_seen', type: 'datetime | null', desc: 'ISO 8601.' },
                  { field: 'vehicle_image_url', type: 'string | null', desc: 'Ready-to-render, time-limited image link.' },
                  { field: 'plate_image_url', type: 'string | null', desc: 'Ready-to-render, time-limited image link.' },
                  { field: 'evidence_image_urls', type: 'string[]', desc: 'Trigger-camera evidence for this detection, if any.' },
                  { field: 'timeline', type: 'array', desc: <>Non-empty only when <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">is_multiple_detections</code> is true. Each item carries <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">location_name</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">checkpoint_name</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">time</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">direction</code>, <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">vehicle_type</code>, and the same image fields as above — oldest first.</> },
                ]} />
              </SubSection>

              <SubSection id="response-single" num="4.1.5" title="Response Example (Single Detection)">
                <CodeBlock label="200 Response" tone="response">
{`{
  `}<K>"data"</K>{`: [
    {
      `}<K>"plate_number"</K>{`: `}<S>"UP32AB1234"</S>{`,
      `}<K>"location_name"</K>{`: `}<S>"Khalilabad Old Factory"</S>{`,
      `}<K>"checkpoint_name"</K>{`: `}<S>"Main Gate"</S>{`,
      `}<K>"is_blacklisted"</K>{`: false,
      `}<K>"is_whitelisted"</K>{`: true,
      `}<K>"direction"</K>{`: `}<S>"in"</S>{`,
      `}<K>"vehicle_type"</K>{`: `}<S>"Car"</S>{`,
      `}<K>"is_multiple_detections"</K>{`: false,
      `}<K>"timestamp"</K>{`: `}<S>"2026-08-13T09:14:22"</S>{`,
      `}<K>"first_seen"</K>{`: `}<S>"2026-08-13T09:14:22"</S>{`,
      `}<K>"last_seen"</K>{`: `}<S>"2026-08-13T09:14:22"</S>{`,
      `}<K>"vehicle_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
      `}<K>"plate_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
      `}<K>"evidence_image_urls"</K>{`: [],
      `}<K>"timeline"</K>{`: []
    }
  ],
  `}<K>"meta"</K>{`: { `}<K>"page"</K>{`: 1, `}<K>"page_size"</K>{`: 50, `}<K>"total"</K>{`: 1, `}<K>"total_pages"</K>{`: 1 }
}`}
                </CodeBlock>
              </SubSection>

              <SubSection id="response-multi" num="4.1.6" title="Response Example (Multiple Detections / Timeline)">
                <CodeBlock label="200 Response" tone="response">
{`{
  `}<K>"data"</K>{`: [
    {
      `}<K>"plate_number"</K>{`: `}<S>"DL1LT3091"</S>{`,
      `}<K>"location_name"</K>{`: `}<S>"Kapila Agro"</S>{`,
      `}<K>"checkpoint_name"</K>{`: `}<S>"Weighbridge Gate"</S>{`,
      `}<K>"is_blacklisted"</K>{`: false,
      `}<K>"is_whitelisted"</K>{`: false,
      `}<K>"direction"</K>{`: `}<S>"out"</S>{`,
      `}<K>"vehicle_type"</K>{`: `}<S>"Truck"</S>{`,
      `}<K>"is_multiple_detections"</K>{`: true,
      `}<K>"timestamp"</K>{`: `}<S>"2026-08-13T16:42:03"</S>{`,
      `}<K>"first_seen"</K>{`: `}<S>"2026-08-13T12:16:10"</S>{`,
      `}<K>"last_seen"</K>{`: `}<S>"2026-08-13T16:42:03"</S>{`,
      `}<K>"vehicle_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
      `}<K>"plate_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
      `}<K>"evidence_image_urls"</K>{`: [
        `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`
      ],
      `}<K>"timeline"</K>{`: [
        {
          `}<K>"location_name"</K>{`: `}<S>"Kapila Agro"</S>{`,
          `}<K>"checkpoint_name"</K>{`: `}<S>"Weighbridge Gate"</S>{`,
          `}<K>"time"</K>{`: `}<S>"2026-08-13T12:16:10"</S>{`,
          `}<K>"direction"</K>{`: `}<S>"in"</S>{`,
          `}<K>"vehicle_type"</K>{`: `}<S>"Truck"</S>{`,
          `}<K>"vehicle_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
          `}<K>"plate_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
          `}<K>"evidence_image_urls"</K>{`: []
        },
        {
          `}<K>"location_name"</K>{`: `}<S>"Kapila Agro"</S>{`,
          `}<K>"checkpoint_name"</K>{`: `}<S>"Weighbridge Gate"</S>{`,
          `}<K>"time"</K>{`: `}<S>"2026-08-13T16:42:03"</S>{`,
          `}<K>"direction"</K>{`: `}<S>"out"</S>{`,
          `}<K>"vehicle_type"</K>{`: `}<S>"Truck"</S>{`,
          `}<K>"vehicle_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
          `}<K>"plate_image_url"</K>{`: `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`,
          `}<K>"evidence_image_urls"</K>{`: [
            `}<S>"https://cdn-anpr.ttpltech.in/anpr/...&Expires=..."</S>{`
          ]
        }
      ]
    }
  ],
  `}<K>"meta"</K>{`: { `}<K>"page"</K>{`: 1, `}<K>"page_size"</K>{`: 50, `}<K>"total"</K>{`: 1, `}<K>"total_pages"</K>{`: 1 }
}`}
                </CodeBlock>
              </SubSection>
            </div>
          </Section>

          {/* 5. Error Handling */}
          <Section id="error-handling" num="5" title="Error Handling">
            <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
              Errors return a standard HTTP status code with a JSON body containing a single <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">detail</code> field
              describing what went wrong. There is no <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">success</code> / <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">api_provider</code> / <code className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-1 rounded">metadata</code> envelope
              — the shape below is the complete error response.
            </p>
            <CodeBlock label="429 Response" tone="error">
{`{
  `}<K>"detail"</K>{`: `}<S>"This endpoint allows at most 1 call per minute"</S>{`
}`}
            </CodeBlock>

            <SubSection id="error-codes" num="5.1" title="Common Error Codes">
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-4">
                <ErrorRow status="422" tone="warn" title="Unprocessable Entity" desc="missing or invalid parameters (e.g. start_date not provided, end_date not a valid datetime, direction not in/out)." />
                <ErrorRow status="400" tone="warn" title="Bad Request" desc="end_date not after start_date, or the range exceeds 24 hours." />
                <ErrorRow status="401" tone="err" title="Unauthorized" desc="API key missing, invalid, or disabled." />
                <ErrorRow status="403" tone="err" title="Forbidden" desc="external API access is not enabled for this company." />
                <ErrorRow status="429" tone="warn" title="Too Many Requests" desc="the daily quota or the 1-call-per-minute limit was exceeded — see the Retry-After response header for seconds until it's safe to retry." />
                <ErrorRow status="500" tone="err" title="Internal Server Error" desc="unexpected failure. Safe to retry with backoff." />
              </div>
            </SubSection>
          </Section>

          <footer className="pt-8 mt-4 border-t border-gray-200 dark:border-slate-700 text-sm text-gray-400 dark:text-gray-500">
            End of RoadPulse External API Documentation. For integration support, contact your RoadPulse account contact.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ExternalApiDocumentation;
