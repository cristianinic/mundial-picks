"use client";

import Link from "next/link";

const rounds = [
  { round: "Ronda de 32", pass: "+6", cross: "+4", goals: "+3", exact: "+13", pens: "+1", pensWinner: "+2" },
  { round: "Octavos", pass: "+8", cross: "+5", goals: "+4", exact: "+17", pens: "+2", pensWinner: "+4" },
  { round: "Cuartos", pass: "+10", cross: "+6", goals: "+5", exact: "+21", pens: "+3", pensWinner: "+6" },
  { round: "Semifinal", pass: "+12", cross: "+7", goals: "+6", exact: "+25", pens: "+4", pensWinner: "+8" },
  { round: "Final", pass: "+15", cross: "+8", goals: "+7", exact: "+30", pens: "+5", pensWinner: "+10" },
];

export default function ComoSePuntuaPage() {
  return (
    <main className="scorePage">
      <div className="scoreShell">
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandBall">⚽</span>
            <span>
              <span className="brandTitle">Mundial Picks</span>
              <span className="brandSub">Sistema de puntos</span>
            </span>
          </Link>

          <nav className="navLinks">
            <Link href="/">Inicio</Link>
            <Link href="/picks">Mis Predicciones</Link>
            <Link href="/ranking">Ranking</Link>
          </nav>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">Reglas claras</p>
            <h1>¿Cómo se puntúa?</h1>
            <p className="heroText">
              Tu predicción suma por partes: resultado, goles exactos de cada equipo,
              marcador exacto, clasificados de grupo y, desde ronda de 32, bracket.
            </p>
          </div>

          <div className="quickSteps">
            <div><strong>1</strong><span>Predices grupos</span></div>
            <div><strong>2</strong><span>Se arma el bracket</span></div>
            <div><strong>3</strong><span>Sumas por ronda</span></div>
          </div>
        </section>

        <section className="panel compactPanel">
          <div className="sectionTitle">
            <p className="eyebrow">Primero entiende esto</p>
            <h2>Cada acierto suma por separado</h2>
            <p>
              Puedes fallar el marcador exacto y aun así sumar por ganador, goles exactos de un equipo,
              clasificados o selección que avanza.
            </p>
          </div>

          <div className="conceptGrid">
            <Concept title="Resultado" text="Aciertas ganador o empate." />
            <Concept title="Goles de un equipo" text="Cuenta por selección: deben coincidir los goles de ese equipo, no la suma total del partido." />
            <Concept title="Marcador exacto" text="Aciertas el marcador completo: goles exactos de los dos equipos." />
            <Concept title="Clasificado" text="Si pasa de grupo y tú lo pusiste, suma. No importa si fue 1.º, 2.º o 3.º." />
            <Concept title="Cruce exacto" text="El partido correcto en la ronda correcta." />
            <Concept title="Quién pasa" text="Aciertas qué selección avanza, aunque el cruce no sea exacto." />
          </div>
        </section>

        <section className="panel">
          <div className="sectionTitle">
            <p className="eyebrow">Fase 1</p>
            <h2>Fase de grupos</h2>
            <p>
              En grupos sumas por cada partido y también por cada selección que pase a ronda de 32.
              En clasificados no existe posición exacta: si avanzó y tú lo pusiste, suma.
            </p>
          </div>

          <div className="scoreGrid four">
            <ScoreItem title="Resultado correcto" points="+3 pts" text="Ganador o empate." />
            <ScoreItem title="Goles exactos de un equipo" points="+2 pts" text="Por cada selección acertada." />
            <ScoreItem title="Marcador exacto" points="+8 pts" text="Goles exactos de ambos equipos." featured />
            <ScoreItem title="Clasificado a ronda de 32" points="+4 pts" text="Pasa de grupo, sin importar posición." />
          </div>

          <div className="exampleGrid">
            <div className="exampleBox">
              <h3>Ejemplo de partido</h3>
              <p><b>Predicción:</b> México 2-1 Canadá. <b>Real:</b> México 1-0 Canadá.</p>
              <ResultLine ok text="Ganó México" points="+3 pts" />
              <ResultLine no text="No fue marcador exacto" points="+0 pts" />
              <ResultLine no text="No hubo goles exactos de ningún equipo" points="+0 pts" />
            </div>

            <div className="exampleBox soft">
              <h3>Ejemplo de goles de equipo</h3>
              <p><b>Predicción:</b> España 2-1 Japón. <b>Real:</b> España 3-0 Japón.</p>
              <ResultLine no text="España no hizo 2 goles" points="+0 pts" />
              <ResultLine no text="Japón no hizo 1 gol" points="+0 pts" />
              <p className="muted">No cuenta la suma total. Tiene que coincidir el gol exacto de una selección: España 2 o Japón 1.</p>
            </div>
          </div>

          <div className="exampleBox soft smallTop">
            <h3>Ejemplo de clasificado</h3>
            <p><b>Predicción:</b> México pasa a ronda de 32. <b>Real:</b> México pasa como 3.º de grupo.</p>
            <ResultLine ok text="México sí pasó de ronda" points="+4 pts" />
          </div>
        </section>

        <section className="panel">
          <div className="sectionTitle">
            <p className="eyebrow">Fase 2</p>
            <h2>Desde ronda de 32 se activa el bracket</h2>
            <p>
              En eliminatorias hay una regla clave: primero se revisa el cruce exacto.
              Si no es el partido correcto en esa ronda, no se habilitan marcador, goles ni penales.
              La única parte aparte es “quién pasa”.
            </p>
          </div>

          <div className="ruleGrid">
            <RuleBox
              title="Cruce exacto"
              text="Es el partido correcto en la ronda correcta. Si predices Francia vs Alemania en cuartos, ese mismo partido debe ocurrir en cuartos."
              ok="Francia vs Alemania sí ocurre en cuartos: se habilitan marcador, goles por equipo y penales."
              no="Ocurre en otra ronda o no ocurre: no se revisan marcador, goles ni penales."
            />
            <RuleBox
              title="Marcador exacto"
              text="Solo puede contar si primero existe el cruce exacto. Después sí se revisa si acertaste el marcador completo."
              ok="Cruce correcto y termina 2-1 como predijiste: suma marcador exacto."
              no="Aunque hayas puesto 2-1, si no existe ese cruce: marcador no aplica."
            />
            <RuleBox
              title="Penales"
              text="También dependen del cruce exacto. Si el partido correcto no ocurre en esa ronda, no se revisan penales."
              ok="Cruce correcto + predijiste empate + el real fue empate: se revisan penales."
              no="No hay cruce exacto: penales no aplican aunque hayas puesto empate."
            />
          </div>

          <div className="gateNote">
            <strong>Parte aguas:</strong>
            <span>
              Primero va el cruce exacto. Si ocurrió, se abren las columnas verdes: goles de equipo,
              marcador exacto y penales. Si no ocurrió, esas columnas no aplican.
              “Quién pasa” está separado porque solo premia acertar la selección que avanzó.
            </span>
          </div>

          <div className="desktopTable">
            <div className="roundTable">
              <div className="roundHeader">
                <span>Ronda</span>
                <span className="freeCol">Quién pasa</span>
                <span className="gateCol gateStart">Cruce exacto</span>
                <span className="gateCol">Goles equipo</span>
                <span className="gateCol">Marcador exacto</span>
                <span className="gateCol">Hay penales</span>
                <span className="gateCol">Gana en penales</span>
              </div>

              {rounds.map((round) => (
                <Round key={round.round} {...round} />
              ))}
            </div>
          </div>

          <div className="mobileRounds">
            {rounds.map((round) => (
              <RoundCard key={round.round} {...round} />
            ))}
          </div>

          <p className="tableNote">
            Las columnas verdes solo aplican si el cruce exacto sí ocurrió en esa ronda.
          </p>

          <div className="exampleGrid">
            <div className="exampleBox">
              <h3>Ejemplo de eliminatoria</h3>
              <p>
                <b>Predicción:</b> Francia vs Alemania en cuartos. Francia gana 2-1.<br />
                <b>Real:</b> Francia vs Alemania en cuartos. Empatan 1-1 y Francia avanza en penales.
              </p>
              <ResultLine ok text="Cruce exacto en cuartos" points="+6 pts" />
              <ResultLine ok text="Francia avanza" points="+10 pts" />
              <ResultLine ok text="Alemania hizo 1 gol y tú pusiste 1" points="+5 pts" />
              <ResultLine no text="No predijiste empate ni penales" points="+0 pts" />
              <ResultLine no text="No fue marcador exacto" points="+0 pts" />
            </div>

            <div className="exampleBox soft">
              <h3>Ejemplo de penales</h3>
              <p>
                <b>Predicción:</b> Croacia vs Japón en cuartos. Empatan 1-1 y Croacia gana en penales.<br />
                <b>Real:</b> Croacia vs Japón en cuartos. Empatan 1-1 y Croacia gana en penales.
              </p>
              <ResultLine ok text="Cruce exacto en cuartos" points="+6 pts" />
              <ResultLine ok text="Acertaste que hubo penales" points="+3 pts" />
              <ResultLine ok text="Acertaste quién ganó en penales" points="+6 pts" />
              <ResultLine ok text="Marcador exacto antes de penales" points="+21 pts" />
            </div>
          </div>
        </section>

        <section className="important">
          <h2>Importante</h2>
          <p>
            Después del 10 de junio a las 23:59 ya no podrás crear ni modificar predicciones.
            Si obtienes acceso después del cierre, podrás ver ranking y contenido informativo,
            pero ya no participarás por el premio.
          </p>
        </section>

        <section className="cta">
          <div>
            <h2>¿Listo para hacer tu predicción?</h2>
            <p>Arma tus grupos, completa tu bracket y compite por el ranking global.</p>
          </div>
          <Link href="/picks" className="primaryButton">Hacer mi predicción →</Link>
        </section>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #03060b; }

        .scorePage {
          min-height: 100vh;
          color: white;
          padding: 8px 14px 20px;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at 84% 2%, rgba(239, 68, 68, 0.12), transparent 28%),
            radial-gradient(circle at 16% 0%, rgba(245, 158, 11, 0.08), transparent 22%),
            #03060b;
        }

        .scoreShell { width: min(100%, 1500px); margin: 0 auto; }

        .topbar, .hero, .panel, .important, .cta {
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(7, 11, 18, 0.96);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.26);
        }

        .topbar {
          min-height: 58px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          margin-bottom: 8px;
        }

        .brand { display: flex; align-items: center; gap: 10px; min-width: 245px; color: white; text-decoration: none; }
        .brandBall { width: 38px; height: 38px; border-radius: 999px; display: grid; place-items: center; background: #f8fafc; color: #020617; font-size: 20px; }
        .brandTitle { display: block; font-size: 23px; line-height: .9; font-weight: 950; text-transform: uppercase; letter-spacing: -.04em; }
        .brandSub { display: block; margin-top: 5px; color: #ef4444; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: .08em; }

        .navLinks { display: flex; align-items: center; gap: 30px; font-size: 14px; font-weight: 850; }
        .navLinks a { color: rgba(255,255,255,.88); text-decoration: none; }
        .navLinks a:hover { color: #ef4444; }

        .hero {
          border-radius: 14px;
          padding: 22px 26px;
          display: grid;
          grid-template-columns: 1fr 330px;
          gap: 18px;
          align-items: center;
          background:
            radial-gradient(circle at 88% 30%, rgba(245, 158, 11, .11), transparent 28%),
            linear-gradient(135deg, rgba(9, 15, 24, .98), rgba(7, 11, 18, .98));
        }

        .eyebrow { margin: 0 0 7px; color: #ef4444; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: .08em; }

        h1 {
          margin: 0;
          max-width: 820px;
          font-size: clamp(39px, 5vw, 64px);
          line-height: .92;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.055em;
        }

        .heroText { margin: 12px 0 0; max-width: 790px; color: rgba(255,255,255,.76); font-size: 16px; line-height: 1.36; font-weight: 750; }

        .quickSteps { display: grid; gap: 8px; }
        .quickSteps div { border-radius: 13px; border: 1px solid rgba(255,255,255,.09); background: rgba(0,0,0,.14); padding: 12px; display: flex; gap: 11px; align-items: center; }
        .quickSteps strong { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 999px; background: #ef111b; font-weight: 950; }
        .quickSteps span { color: rgba(255,255,255,.80); font-weight: 850; }

        .panel, .important, .cta { margin-top: 9px; border-radius: 14px; padding: 18px 22px; }
        .compactPanel { display: grid; grid-template-columns: 310px 1fr; gap: 18px; align-items: start; }

        .sectionTitle h2, .important h2, .cta h2 {
          margin: 0;
          font-size: 25px;
          line-height: 1.04;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.03em;
        }

        .sectionTitle p, .important p, .cta p, .scoreItem p, .concept p, .ruleBox p {
          margin: 8px 0 0;
          color: rgba(255,255,255,.68);
          font-size: 14px;
          line-height: 1.36;
          font-weight: 650;
        }

        .conceptGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
        .concept, .scoreItem, .ruleBox {
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.13);
          padding: 12px;
        }
        .concept h3, .scoreItem h3, .ruleBox h3 { margin: 0; font-size: 15px; font-weight: 950; }

        .scoreGrid { margin-top: 15px; display: grid; gap: 9px; }
        .scoreGrid.four { grid-template-columns: repeat(4, 1fr); }
        .scoreItem.featured { border-color: rgba(239,68,68,.55); box-shadow: inset 0 0 0 1px rgba(239,68,68,.08); }
        .scorePoints { margin-top: 8px; color: #ef4444; font-size: 21px; font-weight: 950; }

        .exampleGrid { margin-top: 14px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .smallTop { margin-top: 10px !important; }

        .ruleGrid { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .ruleMini { margin-top: 11px; display: grid; gap: 7px; }
        .pillLine { border-radius: 10px; padding: 9px 10px; background: rgba(0,0,0,.16); border: 1px solid rgba(255,255,255,.07); color: rgba(255,255,255,.76); font-size: 13px; font-weight: 750; line-height: 1.35; }
        .pillLine.ok b { color: #22c55e; }
        .pillLine.no b { color: #ef4444; }

        .gateNote {
          margin-top: 14px;
          border-radius: 14px;
          padding: 13px 15px;
          border: 1px solid rgba(245,158,11,.22);
          background: rgba(245,158,11,.055);
          display: grid;
          gap: 5px;
        }
        .gateNote strong { color: #fbbf24; font-weight: 950; }
        .gateNote span { color: rgba(255,255,255,.76); font-size: 14px; line-height: 1.36; font-weight: 700; }

        .desktopTable { display: block; }
        .mobileRounds { display: none; }
        .roundTable { margin-top: 15px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; overflow: hidden; }
        .roundHeader, .roundRow { display: grid; grid-template-columns: 1.05fr .75fr .8fr .8fr .95fr .8fr .9fr; align-items: stretch; }
        .roundHeader { min-height: 40px; background: rgba(255,255,255,.04); color: rgba(255,255,255,.50); font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: .04em; }
        .roundHeader span, .roundRow span, .roundRow strong { padding: 11px 10px; display: flex; align-items: center; border-left: 1px solid rgba(255,255,255,.055); }
        .roundHeader span:first-child, .roundRow strong { border-left: 0; }
        .roundRow { min-height: 46px; border-top: 1px solid rgba(255,255,255,.07); font-size: 14px; font-weight: 850; }
        .roundRow strong { color: white; }
        .roundRow span { color: #ef4444; font-weight: 950; }
        .freeCol { background: rgba(59,130,246,.08); color: #93c5fd !important; }
        .roundRow .freeCol { color: #93c5fd; }
        .gateCol, .roundRow .gateCol { background: rgba(34,197,94,.075); color: #22c55e !important; }
        .gateStart { box-shadow: inset 3px 0 0 rgba(34,197,94,.55); }
        .tableNote { margin: 8px 0 0; color: rgba(255,255,255,.52); font-size: 12px; font-weight: 750; }

        .roundCard {
          margin-top: 10px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.13);
        }
        .roundCardTitle { padding: 12px 14px; font-weight: 950; background: rgba(255,255,255,.045); }
        .roundCardGrid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .roundCardGrid div { padding: 11px 13px; border-top: 1px solid rgba(255,255,255,.07); }
        .roundCardGrid div:nth-child(even) { border-left: 1px solid rgba(255,255,255,.07); }
        .roundCardGrid span { display: block; color: rgba(255,255,255,.55); font-size: 11px; font-weight: 950; text-transform: uppercase; }
        .roundCardGrid strong { display: block; margin-top: 4px; color: #ef4444; font-size: 16px; }
        .roundCardGrid .free strong { color: #93c5fd; }
        .roundCardGrid .gate { background: rgba(34,197,94,.055); }
        .roundCardGrid .gate strong { color: #22c55e; }

        .exampleBox {
          margin-top: 15px;
          border-radius: 14px;
          border: 1px solid rgba(245,158,11,.16);
          background: rgba(245,158,11,.045);
          padding: 13px;
        }
        .exampleBox.soft { border-color: rgba(34,197,94,.15); background: rgba(34,197,94,.035); }
        .exampleBox h3 { margin: 0; font-size: 17px; font-weight: 950; }
        .exampleBox p { margin: 8px 0 0; color: rgba(255,255,255,.72); line-height: 1.38; font-weight: 650; }

        .resultLine {
          margin-top: 8px;
          border-radius: 10px;
          background: rgba(0,0,0,.16);
          border: 1px solid rgba(255,255,255,.07);
          padding: 9px 11px;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          font-weight: 850;
        }
        .resultLine span:first-child { color: rgba(255,255,255,.86); }
        .resultLine.ok strong { color: #22c55e; }
        .resultLine.no strong { color: rgba(255,255,255,.45); }
        .mark { margin-right: 8px; }
        .muted { color: rgba(255,255,255,.50) !important; font-size: 13px; }

        .important { border-color: rgba(245,158,11,.20); background: rgba(245,158,11,.05); }
        .important p { max-width: 1050px; }

        .cta { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .primaryButton {
          min-height: 46px;
          border-radius: 10px;
          padding: 0 24px;
          color: white;
          background: #ec111b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 950;
          text-transform: uppercase;
          box-shadow: 0 14px 34px rgba(236, 17, 27, .22);
        }

        @media (max-width: 1100px) {
          .hero, .compactPanel, .cta { grid-template-columns: 1fr; }
          .conceptGrid, .ruleGrid, .exampleGrid { grid-template-columns: repeat(2, 1fr); }
          .scoreGrid.four { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 720px) {
          .scorePage { padding: 8px; }
          .topbar { padding: 12px; align-items: flex-start; gap: 12px; }
          .navLinks { display: none; }
          .brandTitle { font-size: 21px; }
          h1 { font-size: 39px; }
          .hero, .panel, .important, .cta { padding: 16px; }
          .conceptGrid, .scoreGrid.four, .ruleGrid, .exampleGrid { grid-template-columns: 1fr; }
          .desktopTable { display: none; }
          .mobileRounds { display: block; }
          .cta { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </main>
  );
}

function Concept({ title, text }: { title: string; text: string }) {
  return (
    <div className="concept">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ScoreItem({
  title,
  points,
  text,
  featured,
}: {
  title: string;
  points: string;
  text: string;
  featured?: boolean;
}) {
  return (
    <div className={`scoreItem ${featured ? "featured" : ""}`}>
      <h3>{title}</h3>
      <div className="scorePoints">{points}</div>
      <p>{text}</p>
    </div>
  );
}

function RuleBox({
  title,
  text,
  ok,
  no,
}: {
  title: string;
  text: string;
  ok: string;
  no: string;
}) {
  return (
    <div className="ruleBox">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="ruleMini">
        <div className="pillLine ok"><b>✔</b> {ok}</div>
        <div className="pillLine no"><b>✘</b> {no}</div>
      </div>
    </div>
  );
}

function ResultLine({
  ok,
  no,
  text,
  points,
}: {
  ok?: boolean;
  no?: boolean;
  text: string;
  points: string;
}) {
  return (
    <div className={`resultLine ${ok ? "ok" : ""} ${no ? "no" : ""}`}>
      <span><span className="mark">{ok ? "✔" : "✘"}</span>{text}</span>
      <strong>{points}</strong>
    </div>
  );
}

function Round({
  round,
  pass,
  cross,
  goals,
  exact,
  pens,
  pensWinner,
}: {
  round: string;
  pass: string;
  cross: string;
  goals: string;
  exact: string;
  pens: string;
  pensWinner: string;
}) {
  return (
    <div className="roundRow">
      <strong>{round}</strong>
      <span className="freeCol">{pass}</span>
      <span className="gateCol gateStart">{cross}</span>
      <span className="gateCol">{goals}</span>
      <span className="gateCol">{exact}</span>
      <span className="gateCol">{pens}</span>
      <span className="gateCol">{pensWinner}</span>
    </div>
  );
}

function RoundCard({
  round,
  pass,
  cross,
  goals,
  exact,
  pens,
  pensWinner,
}: {
  round: string;
  pass: string;
  cross: string;
  goals: string;
  exact: string;
  pens: string;
  pensWinner: string;
}) {
  return (
    <div className="roundCard">
      <div className="roundCardTitle">{round}</div>
      <div className="roundCardGrid">
        <div className="free"><span>Quién pasa</span><strong>{pass}</strong></div>
        <div className="gate"><span>Cruce exacto</span><strong>{cross}</strong></div>
        <div className="gate"><span>Goles equipo</span><strong>{goals}</strong></div>
        <div className="gate"><span>Marcador exacto</span><strong>{exact}</strong></div>
        <div className="gate"><span>Hay penales</span><strong>{pens}</strong></div>
        <div className="gate"><span>Gana en penales</span><strong>{pensWinner}</strong></div>
      </div>
    </div>
  );
}
