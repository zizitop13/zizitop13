export function StatusPanel() {
  return (
    <div className="status-layout">
      <section aria-labelledby="identity-heading">
        <p className="section-code">~/profile</p>
        <h1 id="identity-heading">MAKSIM ZINIAKOV</h1>
        <dl className="status-record">
          <dt>NAME</dt><dd>MAKSIM ZINIAKOV</dd>
          <dt>ROLE</dt><dd>SENIOR SOFTWARE ENGINEER</dd>
          <dt>LOCATION</dt><dd>FRANKFURT AM MAIN, DE</dd>
          <dt>EXPERIENCE</dt><dd>11+ YEARS</dd>
          <dt>STATUS</dt><dd className="available"><span className="indicator" aria-hidden="true" />AVAILABLE FOR COLLABORATION</dd>
        </dl>
      </section>
      <aside className="status-summary" aria-label="Professional summary">
        <p className="section-code">README.md</p>
        <p>Senior Software Engineer and technical leader specializing in high-throughput systems, Java, distributed architecture, concurrency, SQL, and cloud-native delivery.</p>
        <dl className="compact-record">
          <dt>CURRENT DOMAIN</dt><dd>FINANCIAL SYSTEMS</dd>
          <dt>PRIMARY STACK</dt><dd>JAVA / KOTLIN / JAVASCRIPT / SQL</dd>
          <dt>FOCUS</dt><dd>PERFORMANCE / RELIABILITY / DELIVERY</dd>
        </dl>
      </aside>
    </div>
  )
}
