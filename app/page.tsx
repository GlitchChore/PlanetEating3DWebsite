export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#oben" aria-label="Planet Eating Startseite">
          <span className="brand-mark" aria-hidden="true" />
          <span>PLANET EATING</span>
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#spiel">Das Spiel</a>
          <a href="#status">Aktueller Stand</a>
          <a href="#konto">Spielkonto</a>
        </nav>
        <a className="nav-action" href="#download">Download</a>
      </header>

      <section className="hero" id="oben">
        <div className="hero-copy">
          <p className="eyebrow">KOOPERATIVES PVP-SURVIVAL</p>
          <h1>Eine Welt.<br />Zehn Teams.<br /><em>Deine Geschichte.</em></h1>
          <p className="hero-text">
            Sammle Rohstoffe, baue deine Insel aus und fahre mit deinem Team über das Meer.
            Stelle dich anderen Spielern, Monstern und einem uralten Titanen.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#spiel">Spiel entdecken <span aria-hidden="true">→</span></a>
            <a className="button secondary" href="#status">Was ist schon spielbar?</a>
          </div>
          <div className="fact-row" aria-label="Wichtige Spieldaten">
            <span><strong>1–20</strong> Spieler</span>
            <span><strong>2</strong> Zonen</span>
            <span><strong>Online</strong> &amp; allein</span>
          </div>
        </div>

        <div className="world-art" aria-label="Stilisierte Inselwelt im Weltraum" role="img">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="planet-shadow" />
          <div className="planet">
            <div className="island island-one" />
            <div className="island island-two" />
            <div className="island island-three" />
            <div className="altar" />
          </div>
          <span className="star star-one" />
          <span className="star star-two" />
          <span className="star star-three" />
          <div className="world-label"><span>ZONE 1</span><strong>Die Ur-Inseln</strong></div>
        </div>
      </section>

      <section className="section" id="spiel">
        <div className="section-heading">
          <p className="eyebrow">DEIN WEG DURCH DIE WELT</p>
          <h2>Überleben ist erst der Anfang.</h2>
          <p>Planet Eating verbindet Erkundung, Aufbau und Kämpfe in einer gemeinsamen Inselwelt.</p>
        </div>
        <div className="feature-grid">
          <article><span className="number">01</span><h3>Sammeln &amp; bauen</h3><p>Fälle Bäume, baue Stein ab und errichte Hütten, Lager, Türme und eine Bootswerft.</p></article>
          <article><span className="number">02</span><h3>Gemeinsam fahren</h3><p>Steuere ein Ruderboot. Bis zu vier weitere Spieler fahren als Mitfahrer mit.</p></article>
          <article><span className="number">03</span><h3>Kämpfen &amp; wachsen</h3><p>Jage Tiere, verteidige Gebäude und bezwinge Monster, andere Teams und den ersten Boss.</p></article>
        </div>
      </section>

      <section className="section status-section" id="status">
        <div className="status-card">
          <div>
            <p className="eyebrow">AKTUELLER ENTWICKLUNGSSTAND</p>
            <h2>Die Welt wächst.</h2>
            <p>Zone 1 ist als großer spielbarer Prototyp vorhanden. Zone 2 besitzt bereits Landwirtschaft, Metalle, neue Gebäude und antike Wächter.</p>
          </div>
          <ul className="status-list">
            <li><span className="status-dot ready" /> Einzelspiel-Test</li>
            <li><span className="status-dot ready" /> Bauen, Überleben und Boss 1</li>
            <li><span className="status-dot progress" /> Online-Modus wird vollständig geprüft</li>
            <li><span className="status-dot progress" /> Boss 2 ist noch nicht fertig</li>
          </ul>
        </div>
      </section>

      <section className="section split-section" id="konto">
        <div>
          <p className="eyebrow">DEIN SPIELKONTO</p>
          <h2>Eine ID für deinen Fortschritt.</h2>
          <p>Im Spiel erhältst du eine geheime Spiel-ID. Damit kannst du deinen Namen, deine Einstellungen und gespielte Runden auf einem anderen Computer wiederfinden.</p>
          <div className="notice"><strong>Noch nicht auf der Webseite verfügbar</strong><span>Das Anmelden und Bearbeiten des Profils folgt in einem späteren Schritt. Benutze deine Spiel-ID bis dahin nur im Unity-Spiel.</span></div>
        </div>
        <div className="account-preview" aria-label="Vorschau des späteren Kontobereichs">
          <span className="preview-label">KONTO-VORSCHAU</span>
          <label htmlFor="game-id">GEHEIME SPIEL-ID</label>
          <input id="game-id" value="PE3D-•••••-•••••-•••••-•••••-•••••" readOnly disabled />
          <button disabled>NOCH NICHT VERFÜGBAR</button>
          <small>Teile deine vollständige ID niemals öffentlich.</small>
        </div>
      </section>

      <section className="download-section" id="download">
        <p className="eyebrow">FÜR WINDOWS GEPLANT</p>
        <h2>Bereit für deine erste Insel?</h2>
        <p>Ein öffentlicher Spiel-Download ist noch nicht veröffentlicht.</p>
        <button className="button disabled" disabled>DOWNLOAD FOLGT</button>
      </section>

      <footer>
        <a className="brand" href="#oben"><span className="brand-mark" aria-hidden="true" /><span>PLANET EATING</span></a>
        <p>In Entwicklung · Funktionen können sich noch ändern.</p>
        <a href="#oben">Nach oben ↑</a>
      </footer>
    </main>
  );
}
