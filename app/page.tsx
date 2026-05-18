"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const matches = [
  { home: "MÉXICO", away: "SUDÁFRICA", time: "13:00", date: "11 JUN", group: "Grupo A", homeFlag: "mx", awayFlag: "za" },
  { home: "COREA DEL SUR", away: "CHEQUIA", time: "20:00", date: "11 JUN", group: "Grupo A", homeFlag: "kr", awayFlag: "cz" },
];

const PREDICTIONS_CLOSE_DATE = new Date("2026-06-10T23:59:00-06:00");

function getCountdownParts(now: Date, targetDate: Date) {
  const diff = Math.max(0, targetDate.getTime() - now.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isClosed: diff <= 0 };
}


export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setProfileMenuOpen(false);
      if (!session?.user) setUserHasPaid(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldOpenLogin = params.get("login") === "1" || params.get("auth") === "login";

    if (shouldOpenLogin) {
      openAuthModal("login");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);


  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadUserAccess() {
      if (!user?.email) {
        setUserHasPaid(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("has_paid")
        .eq("username", user.email)
        .maybeSingle();

      if (error) {
        console.log(error);
        setUserHasPaid(false);
        return;
      }

      setUserHasPaid(Boolean(data?.has_paid));
    }

    loadUserAccess();
  }, [user?.email]);

  function openAuthModal(mode: "login" | "signup" = "login") {
    setAuthMode(mode);
    setAuthEmail("");
    setAuthPassword("");
    setAuthPasswordConfirm("");
    setAuthError("");
    setAuthModalOpen(true);
  }

  function closeAuthModal() {
    if (authLoading) return;
    setAuthModalOpen(false);
    setAuthError("");
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    const cleanEmail = authEmail.trim().toLowerCase();

    if (!cleanEmail || !authPassword) {
      setAuthError("Escribe tu correo y contraseña.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (authMode === "signup" && authPassword !== authPasswordConfirm) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: authPassword,
        });

        if (error) {
          setAuthError("Correo o contraseña incorrectos.");
          return;
        }

        setAuthModalOpen(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError("No se pudo crear la cuenta. Revisa el correo o intenta otra contraseña.");
        return;
      }

      setAuthMode("login");
      setAuthPassword("");
      setAuthPasswordConfirm("");
      setAuthError("Cuenta creada. Ahora inicia sesión con esos datos.");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleProfileClick() {
    setProfileMenuOpen((prev) => !prev);
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
      return;
    }

    setUser(null);
    setProfileMenuOpen(false);
    window.location.href = "/";
  }

  const username = user?.email?.split("@")[0] || "juanpicks";
  const countdown = getCountdownParts(now, PREDICTIONS_CLOSE_DATE);

  return (
    <main className="homePage">
      <div className="pageShell">
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandBall">⚽</span>
            <span>
              <span className="brandTitle">Mundial Picks</span>
              <span className="brandSub">Inicio</span>
            </span>
          </Link>

          <nav className="navLinks" aria-label="Navegación principal">
            <Link className="active" href="/">Inicio</Link>
            <Link href="/picks">Mis Predicciones</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/como-se-puntua">Cómo se puntúa</Link>
            <Link href="/calendario">Calendario</Link>
            <Link href="/datos-formidables">Datos formidables</Link>
          </nav>

          <div className="userBox">
            <span className="prizeChip">Premio $20,000 MXN</span>
            {user ? (
              <div className="profileMenuWrap">
                <button onClick={handleProfileClick} className={userHasPaid ? "profileButton premium" : "profileButton connected"} type="button">
                  <span className="avatar">JP</span>
                  <span className="profileText">
                    <strong>{username}</strong>
                    <small>{userHasPaid ? "Acceso activo" : "Conectado"}</small>
                  </span>
                  <span className="chevron">⌄</span>
                </button>

                {profileMenuOpen && (
                  <div className="profileDropdown">
                    <Link href="/picks" className="profileDropdownItem" onClick={() => setProfileMenuOpen(false)}>
                      Mi perfil
                    </Link>
                    <button onClick={logout} className="profileDropdownItem danger" type="button">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => openAuthModal("login")} className="loginButton">Login</button>
            )}
          </div>
        </header>

        <section className="hero">
          <div className="heroImage" aria-hidden="true" />

          <div className="heroContent">
            <p className="eyebrow">Mundial 2026</p>
            <h1>Haz tu predicción del Mundial.</h1>
            <p className="heroText">
              Llena tus grupos, arma tu bracket y compite para ver en qué lugar
              quedas contra otros jugadores.
            </p>

            <div className="heroMiniActions">
              <div className="prizeNotice">
                <strong>Premio al mejor predictor</strong>
                <b>$20,000 MXN</b>
              </div>

              <Link href="/como-se-puntua" className="howPointsButton">
                ⓘ ¿Cómo se puntúa?
              </Link>
            </div>

            <div className="entryPriceCard" aria-label="Precio de inscripción">
              <span className="entryPriceLabel">Inscripción única</span>
              <strong>$99 MXN</strong>
              <small>Acceso completo al torneo · sin pagos mensuales</small>
            </div>

            <div className="heroActions">
              <Link href="/inscripcion" className="primaryButton">
                Inscribirme ahora <span>→</span>
              </Link>
              <Link href="/picks" className="secondaryButton">
                Ver predicciones <span>→</span>
              </Link>
            </div>
          </div>

          <div className="deadlineCard">
            <div className="deadlineTop">
              <div className="calendarIcon" aria-hidden="true">
                  <svg viewBox="0 0 64 64" fill="none">
                    <rect x="13" y="16" width="38" height="35" rx="7" stroke="currentColor" strokeWidth="4" />
                    <path d="M13 26h38M23 11v10M41 11v10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <rect x="22" y="33" width="8" height="8" rx="2" fill="currentColor" />
                    <rect x="35" y="33" width="8" height="8" rx="2" fill="currentColor" opacity=".65" />
                  </svg>
                </div>
              <div>
                <div className="deadlineLabel">{countdown.isClosed ? "Predicciones cerradas" : "Cierran predicciones en"}</div>
                {countdown.isClosed ? (
                  <div className="deadlineDate">Cerrado</div>
                ) : (
                  <div className="countdownGrid">
                    <div className="countdownItem">
                      <strong>{countdown.days}</strong>
                      <span>días</span>
                    </div>
                    <div className="countdownItem">
                      <strong>{countdown.hours}</strong>
                      <span>horas</span>
                    </div>
                    <div className="countdownItem">
                      <strong>{countdown.minutes}</strong>
                      <span>min</span>
                    </div>
                    <div className="countdownItem">
                      <strong>{countdown.seconds}</strong>
                      <span>seg</span>
                    </div>
                  </div>
                )}
                <div className="deadlineTime">10 de junio · 23:59 (GMT-5)</div>
                <div className="deadlineSmall">último momento para enviar tu predicción</div>
              </div>
            </div>
            <div className="deadlineNote">
              ◷ Después de esa fecha no podrás modificar tus picks.
            </div>
          </div>
        </section>

        <section className="statsGrid" aria-label="Accesos principales">
          <InfoCard
            href="/calendario"
            icon="calendar"
            value="104"
            title="Partidos"
            text="Predice todos los partidos del Mundial 2026."
            tone="red"
          />
          <InfoCard
            href="/picks"
            icon="world"
            value="48"
            title="Selecciones"
            text="Conoce todos los equipos que compiten."
            tone="purple"
          />
          <InfoCard
            href="/ranking"
            icon="cup"
            value="Top 100"
            title="Ranking global"
            text="Mira en qué lugar estás entre los mejores del mundo."
            tone="green"
          />
        </section>

        <section className="mainGrid">
          <div className="panel rankingPanel">
            <div className="panelHeader">
              <h2><span className="titleEmoji">🏆</span> Ranking mundial</h2>
              <Link href="/ranking">Ver ranking completo →</Link>
            </div>

            <div className="rankingTable">
              <div className="tableHead">
                <span>Pos</span>
                <span>Jugador</span>
                <span>Puntos</span>
              </div>

              <div className="rankingPreviewWrap">
                <div className="rankingPreviewRows" aria-hidden="true">
                  <RankingRow pos="1" initials="P1" player="Predictor #1" id="#------" pts="0" gold />
                  <RankingRow pos="2" initials="P2" player="Predictor #2" id="#------" pts="0" silver />
                  <RankingRow pos="3" initials="P3" player="Predictor #3" id="#------" pts="0" bronze />
                  <RankingRow pos="4" initials="P4" player="Predictor #4" id="#------" pts="0" />
                  <RankingRow pos="5" initials="P5" player="Predictor #5" id="#------" pts="0" />
                </div>

                <div className="rankingLockOverlay">
                  <div className="rankingLockIcon">🔒</div>
                  <strong>Ranking real disponible el 11 de junio</strong>
                  <span>Esta es una vista previa. Cuando inicie el Mundial, aquí se mostrará el Top 5 real.</span>
                </div>
              </div>
            </div>

            <div className="centerAction">
              <Link href="/ranking" className="ghostButton">Ver Top 100 completo ▤</Link>
            </div>
          </div>

          <div className="panel matchesPanel">
            <div className="panelHeader">
              <h2><span className="titleEmoji">📅</span> Próximos partidos</h2>
              <Link href="/calendario">Ver calendario completo →</Link>
            </div>

            <div className="matchList">
              {matches.map((m, i) => (
  <MatchRow
    key={i}
    left={m.home}
    leftFlag={`https://flagcdn.com/w80/${m.homeFlag}.png`}
    centerTop={m.date}
    centerMid={m.group}
    time={m.time}
    rightFlag={`https://flagcdn.com/w80/${m.awayFlag}.png`}
    right={m.away}
  />
))}
              
              
            </div>
          </div>
        </section>

        <section className="pointsPanel">
          <div className="pointsIntro">
            <h2><span className="titleEmoji">🎯</span> ¿Cómo se puntúa?</h2>
            <p>Tu puntuación se basa en aciertos clave durante todo el torneo.</p>
            <Link href="/como-se-puntua">Ver sistema completo →</Link>
          </div>

          <div className="pointsGrid">
            <PointItem icon="✓" color="green" title="Resultado del partido" text="Aciertas ganador o empate." />
            <PointItem icon="⚽" color="blue" title="Goles exactos" text="Aciertas la cantidad de goles exactos." />
            <PointItem icon="☆" color="yellow" title="Marcador exacto" text="Aciertas el marcador exacto del partido." />
            <PointItem icon="⇄" color="red" title="Cruces correctos" text="Aciertas los enfrentamientos de eliminatorias." />
            <PointItem icon="♛" color="purple" title="Ganador del torneo" text="Aciertas al campeón del Mundial 2026." />
            <PointItem icon="◎" color="orange" title="¿Irá a penales? Ganador en penales" text="Aciertas si el partido se define por penales y quién gana." />
          </div>
        </section>

        <section className="datosTeaserPanel">
          <div className="datosTeaserImage" aria-hidden="true" />
          <div className="datosTeaserContent">
            <span className="datosTeaserKicker">Contenido extra</span>
            <h2>Datos formidables de las 48 selecciones.</h2>
            <p>
              Descubre curiosidades poco conocidas, estadios históricos y detalles mundialistas de cada país.
            </p>
            <Link href="/datos-formidables" className="datosTeaserButton">
              Ver datos formidables <span>→</span>
            </Link>
          </div>
        </section>

        <section className="accessPanel">
          <div className="accessIntro">
            <span className="accessKicker">Tu acceso incluye</span>
            <h2>Más que una predicción: una experiencia mundialista.</h2>
            <p>
              La membresía te da acceso a herramientas, ranking actualizado y contenido informativo del torneo.
            </p>
          </div>

          <div className="benefitsGrid">
            <div className="benefitItem">
              <span>✓</span>
              <p>Crear y guardar tu predicción completa del Mundial 2026.</p>
            </div>
            <div className="benefitItem">
              <span>✓</span>
              <p>Ranking global actualizado para comparar tu posición.</p>
            </div>
            <div className="benefitItem">
              <span>✓</span>
              <p>Calendario, grupos, selecciones y cruces del torneo.</p>
            </div>
            <div className="benefitItem">
              <span>✓</span>
              <p>Contenido informativo: datos, estadísticas y análisis mundialista.</p>
            </div>
          </div>
        </section>

        <section className="ctaPanel">
          <div className="ctaLeft">
            <div className="ctaIcon">🏆</div>
            <div>
              <h3>Demuestra cuánto sabes de fútbol y compite por $20,000 MXN.</h3>
              <p>Inscripción única de $99 MXN. El premio es para el mejor predictor del ranking global.</p>
            </div>
          </div>

          <div className="ctaActions">
            <Link href="/inscripcion" className="primaryButton large">
              Inscribirme ahora <span>→</span>
            </Link>
            <Link href="/picks" className="secondaryButton largeSecondary">
              Ver predicciones <span>→</span>
            </Link>
          </div>
        </section>
      </div>

      {authModalOpen && (
        <div className="authBackdrop" role="dialog" aria-modal="true">
          <div className="authModal">
            <button className="authClose" type="button" onClick={closeAuthModal}>×</button>

            <div className="authHeader">
              <div className="authIcon">⚽</div>
              <p>Mundial Picks 2026</p>
              <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
              <span>Guarda tus predicciones, participa en rankings y compite por el premio.</span>
            </div>

            <div className="authTabs">
              <button
                type="button"
                className={authMode === "login" ? "active" : ""}
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={authMode === "signup" ? "active" : ""}
                onClick={() => { setAuthMode("signup"); setAuthError(""); }}
              >
                Crear cuenta
              </button>
            </div>

            <form className="authForm" onSubmit={handleAuthSubmit}>
              <label>
                Correo
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="tu-correo@gmail.com"
                  autoComplete="email"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                />
              </label>

              {authMode === "signup" && (
                <label>
                  Confirmar contraseña
                  <input
                    type="password"
                    value={authPasswordConfirm}
                    onChange={(event) => setAuthPasswordConfirm(event.target.value)}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                  />
                </label>
              )}

              {authError && (
                <div className={authError.includes("Cuenta creada") ? "authMessage success" : "authMessage"}>
                  {authError}
                </div>
              )}

              <button className="authSubmit" type="submit" disabled={authLoading}>
                {authLoading
                  ? "Procesando..."
                  : authMode === "login"
                    ? "Entrar"
                    : "Crear mi cuenta"}
              </button>
            </form>

            <button
              className="authSwitch"
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
            >
              {authMode === "login"
                ? "¿No tienes cuenta? Crear cuenta"
                : "¿Ya tienes cuenta? Iniciar sesión"}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #03060b;
        }

        .homePage {
          min-height: 100vh;
          color: #ffffff;
          padding: 8px 14px 20px;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at 84% 2%, rgba(239, 68, 68, 0.12), transparent 28%),
            radial-gradient(circle at 16% 0%, rgba(245, 158, 11, 0.08), transparent 22%),
            #03060b;
        }

        .pageShell {
          width: min(100%, 1500px);
          margin: 0 auto;
        }

        .topbar,
        .hero,
        .infoCard,
        .panel,
        .pointsPanel,
        .ctaPanel {
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(7, 11, 18, 0.96);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
        }

        .topbar {
          min-height: 66px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          margin-bottom: 8px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 255px;
          color: white;
          text-decoration: none;
        }

        .brandBall {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #f8fafc;
          color: #020617;
          font-size: 23px;
          box-shadow: 0 0 0 1px rgba(255,255,255,.12);
        }

        .brandTitle {
          display: block;
          font-size: 25px;
          line-height: .9;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .brandSub {
          display: block;
          margin-top: 6px;
          color: #ef4444;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 22px;
          font-size: 13px;
          font-weight: 800;
        }

        .navLinks a {
          color: rgba(255,255,255,.86);
          text-decoration: none;
          padding: 25px 0 20px;
        }

        .navLinks a:hover,
        .navLinks .active {
          color: #ef4444;
        }

        .navLinks .active {
          border-bottom: 3px solid #ef4444;
        }

        .userBox {
          min-width: 255px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 18px;
        }

        .prizeChip {
          height: 36px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 14px;
          color: #fbbf24;
          background: rgba(245, 158, 11, .09);
          border: 1px solid rgba(245, 158, 11, .26);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .02em;
          white-space: nowrap;
        }

        .loginButton,
        .profileButton {
          cursor: pointer;
          color: white;
          border: 0;
          font-family: inherit;
          font-weight: 900;
        }

        .loginButton {
          border-radius: 999px;
          padding: 13px 24px;
          background: #ef111b;
          font-size: 14px;
        }

        .profileButton {
          min-width: 185px;
          height: 52px;
          border-radius: 13px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.1);
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 7px 12px;
          text-align: left;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #dc2626;
          font-size: 14px;
          font-weight: 950;
        }

        .profileText {
          flex: 1;
          display: grid;
          line-height: 1.05;
        }

        .profileText strong {
          max-width: 108px;
          font-size: 14px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .profileText small {
          margin-top: 4px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
        }

        .chevron {
          color: rgba(255,255,255,.7);
          font-size: 20px;
        }

        .profileMenuWrap {
          position: relative;
        }

        .profileDropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 30;
          width: 190px;
          padding: 8px;
          border-radius: 14px;
          background: rgba(7, 11, 18, 0.98);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 20px 50px rgba(0,0,0,.45);
        }

        .profileDropdownItem {
          width: 100%;
          min-height: 40px;
          border: 0;
          border-radius: 10px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          color: white;
          background: transparent;
          text-decoration: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
          text-align: left;
        }

        .profileDropdownItem:hover {
          background: rgba(255,255,255,.07);
        }

        .profileDropdownItem.danger {
          color: #ff4d57;
        }

        .profileButton.connected {
          border-color: rgba(34,197,94,.38);
          background: linear-gradient(135deg, rgba(34,197,94,.11), rgba(255,255,255,.035));
          box-shadow: 0 0 0 1px rgba(34,197,94,.08), 0 14px 30px rgba(34,197,94,.08);
        }

        .profileButton.connected .avatar {
          background: linear-gradient(135deg, #16a34a, #22c55e);
        }

        .profileButton.connected small {
          color: #86efac;
        }

        .profileButton.premium {
          border-color: rgba(251,191,36,.58);
          background: linear-gradient(135deg, rgba(251,191,36,.20), rgba(255,255,255,.045));
          box-shadow: 0 0 0 1px rgba(251,191,36,.14), 0 14px 36px rgba(251,191,36,.16);
        }

        .profileButton.premium .avatar {
          background: linear-gradient(135deg, #facc15, #d97706);
          color: #111827;
        }

        .profileButton.premium small {
          color: #fbbf24;
        }

        .authBackdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(8px);
        }

        .authModal {
          position: relative;
          width: min(100%, 440px);
          border-radius: 24px;
          padding: 24px;
          background: #ffffff;
          color: #111827;
          box-shadow: 0 34px 90px rgba(0,0,0,.46);
        }

        .authClose {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 0;
          background: #f3f4f6;
          color: #111827;
          font-size: 24px;
          font-weight: 900;
          cursor: pointer;
        }

        .authHeader {
          text-align: center;
          padding: 10px 14px 18px;
        }

        .authIcon {
          width: 54px;
          height: 54px;
          margin: 0 auto 12px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #03060b;
          font-size: 24px;
        }

        .authHeader p {
          margin: 0;
          color: #ef111b;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .09em;
        }

        .authHeader h2 {
          margin: 6px 0 0;
          color: #03060b;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .authHeader span {
          display: block;
          margin-top: 10px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 650;
        }

        .authTabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 6px;
          border-radius: 16px;
          background: #f3f4f6;
          margin-bottom: 16px;
        }

        .authTabs button {
          min-height: 42px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #6b7280;
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          cursor: pointer;
        }

        .authTabs button.active {
          background: #ef111b;
          color: white;
          box-shadow: 0 10px 24px rgba(239,17,27,.18);
        }

        .authForm {
          display: grid;
          gap: 12px;
        }

        .authForm label {
          display: grid;
          gap: 7px;
          color: #374151;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .03em;
        }

        .authForm input {
          width: 100%;
          min-height: 48px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #111827;
          padding: 0 14px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 750;
          outline: none;
        }

        .authForm input:focus {
          border-color: #ef111b;
          box-shadow: 0 0 0 4px rgba(239,17,27,.10);
          background: white;
        }

        .authMessage {
          border-radius: 12px;
          padding: 11px 12px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.35;
        }

        .authMessage.success {
          background: #ecfdf5;
          color: #047857;
        }

        .authSubmit {
          min-height: 50px;
          border: 0;
          border-radius: 14px;
          background: #ef111b;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 16px 34px rgba(239,17,27,.22);
        }

        .authSubmit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .authSwitch {
          width: 100%;
          margin-top: 14px;
          min-height: 40px;
          border: 0;
          background: transparent;
          color: #ef111b;
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          cursor: pointer;
        }


        .hero {
          min-height: 260px;
          border-radius: 14px;
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(480px, 1fr) 330px 410px;
          gap: 26px;
          align-items: center;
          position: relative;
          padding: 30px 34px;
          background:
            linear-gradient(90deg, rgba(3,6,11,1) 0%, rgba(6,13,22,.97) 39%, rgba(11,13,15,.82) 64%, rgba(18,11,5,.72) 100%),
            #05070b;
        }

        .hero:before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(3,6,11,.22) 0%, rgba(3,6,11,.16) 44%, rgba(3,6,11,.03) 70%, rgba(3,6,11,.18) 100%),
            repeating-linear-gradient(170deg, rgba(255,255,255,.026) 0 1px, transparent 1px 18px),
            radial-gradient(circle at 82% 45%, rgba(251,191,36,.26), transparent 27%);
          pointer-events: none;
          z-index: 1;
        }

        .heroImage {
          position: absolute;
          top: 0;
          right: 0;
          width: 60%;
          height: 100%;
          background-image:
            linear-gradient(90deg,
              rgba(3,6,11,1) 0%,
              rgba(3,6,11,.98) 11%,
              rgba(3,6,11,.90) 20%,
              rgba(3,6,11,.58) 34%,
              rgba(3,6,11,.16) 56%,
              rgba(3,6,11,.18) 100%
            ),
            linear-gradient(0deg, rgba(3,6,11,.34), rgba(3,6,11,.04)),
            url("/trophy.png");
          background-size: cover;
          background-position: center;
          opacity: .96;
          filter: saturate(1.12) contrast(1.08);
          mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,.06) 10%, rgba(0,0,0,.36) 24%, rgba(0,0,0,.78) 42%, black 56%, black 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,.06) 10%, rgba(0,0,0,.36) 24%, rgba(0,0,0,.78) 42%, black 56%, black 100%);
        }

        .heroImage:after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 62% 50%, rgba(245,158,11,.33), transparent 31%),
            linear-gradient(90deg,
              rgba(3,6,11,1) 0%,
              rgba(3,6,11,.82) 14%,
              rgba(3,6,11,.36) 34%,
              rgba(3,6,11,.08) 58%,
              rgba(3,6,11,.18) 100%
            );
        }

        .heroContent,
        .deadlineCard {
          position: relative;
          z-index: 2;
        }

        .deadlineCard {
          grid-column: 2;
        }

        .eyebrow {
          margin: 0 0 9px;
          color: #ef4444;
          font-size: 14px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        h1 {
          margin: 0;
          max-width: 620px;
          font-size: clamp(48px, 4.5vw, 66px);
          line-height: .93;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.055em;
        }

        .heroText {
          margin: 15px 0 0;
          max-width: 525px;
          color: rgba(255,255,255,.74);
          font-size: 17px;
          line-height: 1.45;
          font-weight: 500;
        }

        .prizeNotice {
          width: fit-content;
          margin-top: 17px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          padding: 9px 14px;
          color: rgba(255,255,255,.92);
          background: linear-gradient(90deg, rgba(245,158,11,.15), rgba(239,68,68,.09));
          border: 1px solid rgba(245,158,11,.24);
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 12px 34px rgba(245,158,11,.08);
        }

        .prizeNotice strong {
          color: #fbbf24;
          font-weight: 950;
        }

        .prizeNotice b {
          font-weight: 950;
          color: #ffffff;
          letter-spacing: .01em;
        }

        .entryPriceCard {
          width: fit-content;
          margin-top: 16px;
          display: grid;
          grid-template-columns: auto auto;
          grid-template-areas:
            "label price"
            "note note";
          align-items: center;
          gap: 3px 12px;
          border-radius: 16px;
          padding: 12px 16px;
          color: white;
          background:
            linear-gradient(135deg, rgba(34,197,94,.16), rgba(245,158,11,.10)),
            rgba(0,0,0,.24);
          border: 1px solid rgba(34,197,94,.34);
          box-shadow: 0 14px 34px rgba(34,197,94,.10), inset 0 1px 0 rgba(255,255,255,.06);
        }

        .entryPriceLabel {
          grid-area: label;
          color: #86efac;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .entryPriceCard strong {
          grid-area: price;
          color: #ffffff;
          font-size: 30px;
          line-height: .9;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .entryPriceCard small {
          grid-area: note;
          color: rgba(255,255,255,.68);
          font-size: 12px;
          line-height: 1.25;
          font-weight: 800;
        }

        .heroMiniActions {
          margin-top: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .heroMiniActions .prizeNotice {
          margin-top: 0;
        }

        .howPointsButton {
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: rgba(255,255,255,.84);
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.18);
          text-decoration: none;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          box-shadow: 0 10px 26px rgba(0,0,0,.18);
          transition: transform .16s ease, background .16s ease, border-color .16s ease;
        }

        .howPointsButton:hover {
          transform: translateY(-1px);
          color: white;
          background: rgba(255,255,255,.13);
          border-color: rgba(255,255,255,.28);
        }

        .heroActions {
          margin-top: 26px;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton,
        .ghostButton {
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          text-transform: uppercase;
          transition: transform .16s ease, background .16s ease, border-color .16s ease;
        }

        .primaryButton {
          min-height: 46px;
          border-radius: 9px;
          padding: 0 24px;
          color: white;
          background: #ec111b;
          box-shadow: 0 16px 38px rgba(236, 17, 27, .22);
          gap: 12px;
          font-size: 14px;
        }

        .primaryButton:hover,
        .secondaryButton:hover,
        .ghostButton:hover,
        .infoCard:hover {
          transform: translateY(-1px);
        }

        .primaryButton.large {
          min-width: 250px;
          min-height: 54px;
          font-size: 15px;
        }

        .secondaryButton {
          min-width: 220px;
          min-height: 46px;
          border-radius: 9px;
          padding: 0 22px;
          color: rgba(255,255,255,.82);
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(0,0,0,.2);
          font-size: 14px;
        }

        .deadlineCard {
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          background: rgba(8, 12, 19, .82);
          padding: 22px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 22px 45px rgba(0,0,0,.22);
          backdrop-filter: blur(6px);
        }

        .deadlineTop {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .calendarIcon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(239,68,68,.22);
          border: 1px solid rgba(239,68,68,.65);
          color: #ff4d57;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        }

        .calendarIcon svg {
          width: 30px;
          height: 30px;
          display: block;
        }

        .deadlineLabel {
          color: rgba(255,255,255,.56);
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .deadlineDate {
          margin-top: 6px;
          color: #ef4444;
          font-size: 29px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.03em;
        }

        .countdownGrid {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .countdownItem {
          min-width: 0;
          border-radius: 12px;
          padding: 9px 8px;
          text-align: center;
          background: rgba(239, 68, 68, .12);
          border: 1px solid rgba(239, 68, 68, .28);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
        }

        .countdownItem strong {
          display: block;
          color: #ffffff;
          font-size: 24px;
          line-height: .95;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .countdownItem span {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.62);
          font-size: 10px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .deadlineTime {
          margin-top: 5px;
          color: rgba(255,255,255,.86);
          font-size: 14px;
          font-weight: 800;
        }

        .deadlineSmall {
          margin-top: 2px;
          color: rgba(255,255,255,.68);
          font-size: 13px;
          font-weight: 700;
        }

        .deadlineNote {
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,.13);
          color: rgba(255,255,255,.62);
          font-size: 14px;
          line-height: 1.35;
          font-weight: 650;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .infoCard {
          min-height: 118px;
          border-radius: 14px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: white;
          text-decoration: none;
          background:
            radial-gradient(circle at 12% 50%, rgba(255,255,255,.045), transparent 26%),
            linear-gradient(135deg, rgba(15,23,42,.98), rgba(8,13,21,.98));
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .infoInner {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .infoIcon {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          position: relative;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 34px rgba(0,0,0,.18);
        }

        .svgIcon {
          width: 42px;
          height: 42px;
          display: block;
        }

        .infoCard.red .infoIcon, .infoIcon.red {
          color: #ef4444;
          background: rgba(239,68,68,.15);
          border: 1px solid rgba(239,68,68,.55);
          filter: drop-shadow(0 0 13px rgba(239,68,68,.38));
        }

        .infoCard.purple .infoIcon, .infoIcon.purple {
          color: #a855f7;
          background: rgba(168,85,247,.14);
          border: 1px solid rgba(168,85,247,.55);
          filter: drop-shadow(0 0 13px rgba(168,85,247,.38));
        }

        .infoCard.green .infoIcon, .infoIcon.green {
          color: #22c55e;
          background: rgba(34,197,94,.13);
          border: 1px solid rgba(34,197,94,.5);
          filter: drop-shadow(0 0 13px rgba(34,197,94,.38));
        }

        .infoValue {
          font-size: 36px;
          font-weight: 950;
          line-height: .9;
          letter-spacing: -.035em;
        }

        .infoTitle {
          margin-top: 8px;
          color: rgba(255,255,255,.78);
          font-size: 14px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .infoText {
          margin-top: 5px;
          max-width: 250px;
          color: rgba(255,255,255,.56);
          font-size: 14px;
          line-height: 1.25;
          font-weight: 600;
        }

        .infoArrow {
          color: rgba(255,255,255,.5);
          font-size: 30px;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 10px;
          margin-top: 10px;
        }

        .panel {
          border-radius: 14px;
          padding: 22px 24px 24px;
          background:
            radial-gradient(circle at 8% 0%, rgba(239,68,68,.045), transparent 28%),
            rgba(7, 11, 18, 0.96);
        }

        .panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .sectionIcon {
          width: 18px;
          height: 18px;
          display: inline-block;
          position: relative;
          flex: 0 0 auto;
          color: #ef4444;
        }

        .trophyIcon:before {
          content: "";
          position: absolute;
          left: 5px;
          top: 2px;
          width: 8px;
          height: 10px;
          border: 2px solid currentColor;
          border-radius: 3px 3px 6px 6px;
        }

        .trophyIcon:after {
          content: "";
          position: absolute;
          left: 3px;
          bottom: 1px;
          width: 12px;
          height: 3px;
          background: currentColor;
          border-radius: 8px;
          box-shadow: 0 -4px 0 -1px currentColor;
        }

        .calendarSmallIcon {
          border: 2px solid currentColor;
          border-radius: 4px;
        }

        .calendarSmallIcon:before {
          content: "";
          position: absolute;
          left: -2px;
          right: -2px;
          top: 4px;
          border-top: 2px solid currentColor;
        }

        .targetIcon {
          border: 2px solid currentColor;
          border-radius: 999px;
        }

        .targetIcon:before {
          content: "";
          position: absolute;
          inset: 4px;
          border: 2px solid currentColor;
          border-radius: 999px;
        }

        .panelHeader h2,
        .pointsIntro h2 {
          margin: 0;
          font-size: 19px;
          line-height: 1;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.02em;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .panelHeader h2 span {
          color: #ef4444;
        }

        .titleEmoji {
          font-size: 18px;
          line-height: 1;
        }

        .panelHeader a {
          color: #ef4444;
          text-decoration: none;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .rankingTable {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0,0,0,.1);
        }

        .rankingPreviewWrap {
          position: relative;
          min-height: 270px;
        }

        .rankingPreviewRows {
          filter: blur(1.6px);
          opacity: .62;
          pointer-events: none;
          user-select: none;
        }

        .rankingLockOverlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          text-align: center;
          padding: 22px;
          background: linear-gradient(180deg, rgba(3,6,11,.38), rgba(3,6,11,.84));
          backdrop-filter: blur(2px);
        }

        .rankingLockIcon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(239, 68, 68, .16);
          border: 1px solid rgba(239, 68, 68, .34);
          font-size: 20px;
        }

        .rankingLockOverlay strong {
          color: white;
          font-size: 17px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.02em;
        }

        .rankingLockOverlay span {
          max-width: 390px;
          color: rgba(255,255,255,.66);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 700;
        }

        .tableHead,
        .rankingRow {
          display: grid;
          grid-template-columns: 74px 1fr 110px;
          align-items: center;
        }

        .tableHead {
          height: 32px;
          padding: 0 20px;
          color: rgba(255,255,255,.42);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }

        .tableHead span:last-child {
          text-align: right;
        }

        .rankingRow {
          min-height: 54px;
          padding: 7px 20px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .rankingRow:last-child {
          border-bottom: 0;
        }

        .rankPos {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.78);
          font-size: 13px;
          font-weight: 950;
        }

        .rankingRow.gold .rankPos {
          background: linear-gradient(135deg, #facc15, #d97706);
          color: white;
        }

        .rankingRow.silver .rankPos {
          background: linear-gradient(135deg, #cbd5e1, #64748b);
          color: white;
        }

        .rankingRow.bronze .rankPos {
          background: linear-gradient(135deg, #c08457, #92400e);
          color: white;
        }

        .rankPlayer {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rankAvatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #dc2626;
          color: white;
          font-size: 13px;
          font-weight: 950;
        }

        .rankName {
          font-size: 14px;
          font-weight: 900;
          line-height: 1;
        }

        .rankId {
          margin-top: 4px;
          color: rgba(255,255,255,.38);
          font-size: 11px;
          font-weight: 700;
        }

        .rankPts {
          text-align: right;
          font-size: 15px;
          font-weight: 950;
        }

        .centerAction {
          margin-top: 10px;
          text-align: center;
        }

        .ghostButton {
          min-height: 34px;
          border-radius: 9px;
          padding: 0 26px;
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.83);
          background: rgba(0,0,0,.12);
          font-size: 12px;
        }

        .matchList {
          display: grid;
          gap: 8px;
        }

        .matchRow {
          min-height: 72px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          align-items: center;
          padding: 10px 20px;
          background: rgba(0,0,0,.08);
        }

        .team span {
  white-space: nowrap;
}

.team {
  display: flex;
  align-items: center;
  gap: 8px; /* 🔥 más compacto */
  font-size: 13px;
  font-weight: 900;
  max-width: 100%;
}

        .team.right {
  justify-content: flex-end;
  text-align: right;
}

        .flagImage {
  width: 28px;
  height: 18px;
  object-fit: cover;
  border-radius: 6px; /* 🔥 bordes redondeados tipo app */
  display: inline-block;
  border: 1px solid rgba(255,255,255,.15);
}

        .matchCenter {
          text-align: center;
          color: rgba(255,255,255,.62);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 1.35;
        }

        .matchTime {
          margin-top: 4px;
          color: white;
          font-size: 17px;
          font-weight: 500;
        }

        .pointsPanel {
          margin-top: 10px;
          border-radius: 14px;
          padding: 24px;
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr);
          gap: 28px;
          align-items: center;
          background:
            radial-gradient(circle at 2% 50%, rgba(239,68,68,.06), transparent 24%),
            linear-gradient(135deg, rgba(9, 15, 24, .98), rgba(7, 11, 18, .98));
        }

        .pointsIntro p {
          margin: 14px 0 0;
          color: rgba(255,255,255,.66);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 600;
        }

        .pointsIntro a {
          margin-top: 18px;
          display: inline-block;
          color: #ef4444;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .pointsGrid {
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 0;
          align-items: stretch;
        }

        .pointItem {
          min-height: 100px;
          padding: 0 18px;
          border-left: 1px solid rgba(255,255,255,.1);
        }

        .pointIcon {
          font-size: 35px;
          line-height: 1;
          font-weight: 950;
        }

        .pointIcon.green { color: #22c55e; }
        .pointIcon.blue { color: #3b82f6; }
        .pointIcon.yellow { color: #facc15; }
        .pointIcon.red { color: #ef4444; }
        .pointIcon.purple { color: #a855f7; }
        .pointIcon.orange { color: #f97316; }

        .pointTitle {
          margin-top: 11px;
          font-size: 12.5px;
          line-height: 1.18;
          font-weight: 950;
        }

        .pointText {
          margin-top: 7px;
          color: rgba(255,255,255,.56);
          font-size: 12px;
          line-height: 1.35;
          font-weight: 600;
        }

        .datosTeaserPanel {
          min-height: 170px;
          margin-top: 10px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 420px;
          align-items: center;
          padding: 24px 30px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background:
            linear-gradient(90deg, rgba(7,11,18,.98) 0%, rgba(7,11,18,.92) 42%, rgba(7,11,18,.42) 100%),
            radial-gradient(circle at 84% 40%, rgba(245,158,11,.22), transparent 30%),
            #070b12;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
        }

        .datosTeaserImage {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, rgba(7,11,18,.98) 0%, rgba(7,11,18,.88) 36%, rgba(7,11,18,.22) 100%),
            url("/datos-formidables-hero.png");
          background-size: cover;
          background-position: center;
          opacity: .74;
          filter: saturate(1.06) contrast(1.06);
        }

        .datosTeaserPanel:after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(170deg, rgba(255,255,255,.024) 0 1px, transparent 1px 18px),
            linear-gradient(180deg, rgba(3,6,11,.06), rgba(3,6,11,.34));
          pointer-events: none;
        }

        .datosTeaserContent {
          position: relative;
          z-index: 1;
          max-width: 650px;
        }

        .datosTeaserKicker {
          color: #fbbf24;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .datosTeaserContent h2 {
          margin: 8px 0 0;
          max-width: 620px;
          font-size: 28px;
          line-height: .98;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .datosTeaserContent p {
          margin: 12px 0 0;
          max-width: 530px;
          color: rgba(255,255,255,.68);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 650;
        }

        .datosTeaserButton {
          width: fit-content;
          min-height: 42px;
          margin-top: 18px;
          border-radius: 10px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: white;
          background: #ef111b;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          box-shadow: 0 16px 34px rgba(239,17,27,.22);
          transition: transform .16s ease, background .16s ease;
        }

        .datosTeaserButton:hover {
          transform: translateY(-1px);
          background: #ff1f2a;
        }

        .accessPanel {
          margin-top: 10px;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background:
            radial-gradient(circle at 0% 0%, rgba(245, 158, 11, .08), transparent 28%),
            linear-gradient(135deg, rgba(9, 15, 24, .98), rgba(7, 11, 18, .98));
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 28px;
          align-items: center;
        }

        .accessKicker {
          color: #fbbf24;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .accessIntro h2 {
          margin: 8px 0 0;
          font-size: 24px;
          line-height: 1.05;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.03em;
        }

        .accessIntro p {
          margin: 10px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 14px;
          line-height: 1.45;
          font-weight: 650;
        }

        .benefitsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .benefitItem {
          min-height: 58px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.12);
        }

        .benefitItem span {
          width: 24px;
          height: 24px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(34,197,94,.14);
          color: #22c55e;
          font-size: 15px;
          font-weight: 950;
        }

        .benefitItem p {
          margin: 0;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          line-height: 1.25;
          font-weight: 700;
        }

        .ctaPanel {
          min-height: 72px;
          margin-top: 10px;
          border-radius: 14px;
          padding: 16px 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .ctaActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .secondaryButton.largeSecondary {
          min-height: 54px;
          min-width: 210px;
        }

        .ctaLeft {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .ctaIcon {
          color: #ef4444;
          font-size: 31px;
        }

        .ctaPanel h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .ctaPanel p {
          margin: 6px 0 0;
          color: rgba(255,255,255,.54);
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 1160px) {
          .navLinks { display: none; }
          .userBox { min-width: auto; }
          .hero {
            grid-template-columns: 1fr;
          }
          .heroImage {
            width: 100%;
            opacity: .22;
          }
          .deadlineCard {
            grid-column: auto;
            max-width: 360px;
          }
          .statsGrid,
          .mainGrid,
          .pointsPanel,
          .accessPanel {
            grid-template-columns: 1fr;
          }
          .pointsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px 0;
          }
          .pointItem:nth-child(4) {
            border-left: 0;
          }
        }


        @media (max-width: 900px) {
          .pointsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pointItem:nth-child(odd) {
            border-left: 0;
          }
          .pointItem:nth-child(4) {
            border-left: 1px solid rgba(255,255,255,.1);
          }
        }

        @media (max-width: 720px) {
          .homePage { padding: 8px; }
          .topbar { height: auto; padding: 16px; }
          .brandTitle { font-size: 20px; }
          .prizeChip, .profileText, .chevron { display: none; }
          .profileButton { min-width: auto; width: 52px; padding: 7px; }
          .hero { padding: 24px 20px; }
          h1 { font-size: 42px; }

          .datosTeaserPanel {
            min-height: 260px;
            grid-template-columns: 1fr;
            padding: 22px 20px;
            align-items: end;
          }
          .datosTeaserImage {
            background-image:
              linear-gradient(180deg, rgba(7,11,18,.26) 0%, rgba(7,11,18,.78) 58%, rgba(7,11,18,.96) 100%),
              url("/datos-formidables-hero.png");
            background-position: center;
            opacity: .9;
          }
          .datosTeaserContent h2 {
            font-size: 25px;
          }
          .datosTeaserButton {
            width: 100%;
          }
          .statsGrid { grid-template-columns: 1fr; }
          .infoCard { padding: 18px; }
          .mainGrid { grid-template-columns: 1fr; }
          .tableHead, .rankingRow { grid-template-columns: 52px 1fr 74px; }
          .rankAvatar { display: none; }
          .matchRow { grid-template-columns: 1fr; gap: 10px; text-align: center; }
          .team,
          .team.right {
            justify-content: center;
            text-align: center;
          }
          .pointsGrid {
            grid-template-columns: 1fr;
          }
          .benefitsGrid { grid-template-columns: 1fr; }
          .pointItem {
            border-left: 0;
            border-top: 1px solid rgba(255,255,255,.1);
            padding: 16px 0 0;
          }
          .ctaPanel { flex-direction: column; align-items: stretch; padding: 20px; }
          .ctaActions { flex-direction: column; align-items: stretch; width: 100%; }
          .ctaActions .primaryButton,
          .ctaActions .secondaryButton { width: 100%; }
          .entryPriceCard {
            width: 100%;
            grid-template-columns: 1fr auto;
          }
          .heroActions .primaryButton,
          .heroActions .secondaryButton,
          .heroMiniActions .prizeNotice,
          .heroMiniActions .howPointsButton { width: 100%; }
        }
      `}</style>
    </main>
  );
}

function InfoCard({
  href,
  icon,
  value,
  title,
  text,
  tone,
}: {
  href: string;
  icon: "calendar" | "world" | "cup";
  value: string;
  title: string;
  text: string;
  tone: "red" | "purple" | "green";
}) {
  return (
    <Link href={href} className={`infoCard ${tone}`}>
      <div className="infoInner">
        <div className={`infoIcon ${tone}`} aria-hidden="true">
          <StatIcon type={icon} />
        </div>
        <div>
          <div className="infoValue">{value}</div>
          <div className="infoTitle">{title}</div>
          <div className="infoText">{text}</div>
        </div>
      </div>
      <div className="infoArrow">›</div>
    </Link>
  );
}

function StatIcon({ type }: { type: "calendar" | "world" | "cup" }) {
  if (type === "calendar") {
    return (
      <svg className="svgIcon" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="15" width="40" height="37" rx="8" stroke="currentColor" strokeWidth="4" />
        <path d="M12 27h40M23 10v10M41 10v10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M23 36h18M23 44h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "world") {
    return (
      <svg className="svgIcon" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="23" stroke="currentColor" strokeWidth="4" />
        <path d="M9 32h46M32 9c7 7 10 15 10 23S39 48 32 55M32 9c-7 7-10 15-10 23s3 16 10 23" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="svgIcon" viewBox="0 0 64 64" fill="none">
      <path d="M22 13h20v10c0 11-5 19-10 19s-10-8-10-19V13z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 18H12c0 10 5 16 13 17M42 18h10c0 10-5 16-13 17M32 42v8M22 55h20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function RankingRow({
  pos,
  initials,
  player,
  id,
  pts,
  gold,
  silver,
  bronze,
}: {
  pos: string;
  initials: string;
  player: string;
  id: string;
  pts: string;
  gold?: boolean;
  silver?: boolean;
  bronze?: boolean;
}) {
  return (
    <div className={`rankingRow ${gold ? "gold" : ""} ${silver ? "silver" : ""} ${bronze ? "bronze" : ""}`}>
      <div className="rankPos">{pos}</div>
      <div className="rankPlayer">
        <div className="rankAvatar">{initials}</div>
        <div>
          <div className="rankName">{player}</div>
          <div className="rankId">{id}</div>
        </div>
      </div>
      <div className="rankPts">{pts}</div>
    </div>
  );
}

function MatchRow({
  left,
  leftFlag,
  centerTop,
  centerMid,
  time,
  rightFlag,
  right,
}: {
  left: string;
  leftFlag: string;
  centerTop: string;
  centerMid: string;
  time: string;
  rightFlag: string;
  right: string;
}) {
  return (
    <div className="matchRow">
      <div className="team">
        <span>{left}</span>
        <img className="flagImage" src={leftFlag} alt={`Bandera ${left}`} />
      </div>
      <div className="matchCenter">
        <div>{centerTop}</div>
        <div>{centerMid}</div>
        <div className="matchTime">{time}</div>
      </div>
      <div className="team right">
        <img className="flagImage" src={rightFlag} alt={`Bandera ${right}`} />
        <span>{right}</span>
      </div>
    </div>
  );
}


function PointItem({
  icon,
  color,
  title,
  text,
}: {
  icon: string;
  color: "green" | "blue" | "yellow" | "red" | "purple" | "orange";
  title: string;
  text: string;
}) {
  return (
    <div className="pointItem">
      <div className={`pointIcon ${color}`}>{icon}</div>
      <div className="pointTitle">{title}</div>
      <div className="pointText">{text}</div>
    </div>
  );
}
