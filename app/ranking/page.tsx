"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabaseClient";

const rankingHasStarted = false;

type RankingRow = {
  position: number;
  username: string;
  public_id?: string;
  country: string;
  points: number;
};

type PrivateLeague = {
  id: string;
  name: string;
  code: string;
  members: number;
};

type LeagueRankingRow = {
  position: number;
  username: string;
  public_id?: string;
  country: string;
  points: number;
};

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Mis predicciones", href: "/picks" },
  { label: "Cómo se puntúa", href: "/como-se-puntua" },
  { label: "Ranking", href: "/ranking" },
];

function createLeagueCode(name: string) {
  const cleanName = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);

  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName || "LIGA"}${randomNumber}`;
}

export default function RankingPage() {
  const [activeModal, setActiveModal] = useState<"create" | "join" | null>(null);
  const [leagueName, setLeagueName] = useState("");
  const [leagueCode, setLeagueCode] = useState("");
  const [privateLeagues, setPrivateLeagues] = useState<PrivateLeague[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<PrivateLeague | null>(null);
  const [leagueRankingRows, setLeagueRankingRows] = useState<LeagueRankingRow[]>([]);
  const [loadingLeagueRanking, setLoadingLeagueRanking] = useState(false);
  const [copiedLeagueCode, setCopiedLeagueCode] = useState<string | null>(null);
  const [worldRankingRows, setWorldRankingRows] = useState<RankingRow[]>([]);
  const [loadingWorldRanking, setLoadingWorldRanking] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [myWorldRank, setMyWorldRank] = useState<number | null>(null);
  const [myWorldPoints, setMyWorldPoints] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [showWorldRankingTable, setShowWorldRankingTable] = useState(false);
  const [userHasPaid, setUserHasPaid] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const lockedByLogin = !checkingAccess && !userIsLoggedIn;
  const lockedByPayment = !checkingAccess && userIsLoggedIn && !userHasPaid;
  const waitingForStart = !checkingAccess && userIsLoggedIn && userHasPaid && !rankingHasStarted;
  const showOverlay = checkingAccess || lockedByLogin || lockedByPayment || waitingForStart;

  const hasPrivateLeagues = privateLeagues.length > 0;
  const displayedWorldRows = worldRankingRows;

  const accessPillDynamicStyle: CSSProperties = {
    ...accessPillStyle,
    background: userHasPaid
      ? "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(239,0,18,0.18))"
      : "rgba(255,255,255,0.1)",
    border: userHasPaid ? "1px solid rgba(52,211,153,0.45)" : "1px solid rgba(255,255,255,0.12)",
    boxShadow: userHasPaid ? "0 12px 35px rgba(52,211,153,0.12)" : "none",
  };

  const accessDotDynamicStyle: CSSProperties = {
    ...accessDotStyle,
    background: userHasPaid ? "#34d399" : checkingAccess ? "#f59e0b" : "#ef4444",
    boxShadow: userHasPaid
      ? "0 0 18px rgba(52,211,153,0.9)"
      : checkingAccess
        ? "0 0 18px rgba(245,158,11,0.75)"
        : "0 0 18px rgba(239,68,68,0.7)",
  };

  const modalTitle = useMemo(() => {
    if (activeModal === "create") return "Crear ranking privado";
    if (activeModal === "join") return "Unirme a una liga";
    return "";
  }, [activeModal]);

  function closeModal() {
    setActiveModal(null);
    setLeagueName("");
    setLeagueCode("");
  }

  function getUsernameFallback(email?: string | null) {
    if (!email) return "jugador_demo";
    return email;
  }

  function formatPublicUsername(username: string) {
    return username.includes("@") ? username.split("@")[0] : username;
  }

  async function loadWorldRanking(username?: string | null) {
    setLoadingWorldRanking(true);

    const { data: topUsers, error: topError } = await supabase
      .from("users")
      .select("username, public_id, country, points")
      .order("points", { ascending: false })
      .limit(100);

    if (topError) {
      console.log(topError);
      setWorldRankingRows([]);
      setLoadingWorldRanking(false);
      return;
    }

    const rows: RankingRow[] = (topUsers ?? []).map((user: any, index: number) => ({
      position: index + 1,
      username: user.username,
      public_id: user.public_id ?? "#------",
      country: user.country ?? "MX",
      points: Number(user.points ?? 0),
    }));

    setWorldRankingRows(rows);

    const { data: allUsers, error: allError } = await supabase
      .from("users")
      .select("username, points")
      .order("points", { ascending: false });

    if (!allError && allUsers) {
      setTotalPlayers(allUsers.length);

      if (username) {
        const userIndex = allUsers.findIndex((item: any) => item.username === username);
        setMyWorldRank(userIndex >= 0 ? userIndex + 1 : null);

        const currentUser = allUsers.find((item: any) => item.username === username);
        setMyWorldPoints(Number(currentUser?.points ?? 0));
      }
    }

    setLoadingWorldRanking(false);
  }

  async function handleSearchUser() {
    const cleanSearch = searchUsername.trim().toLowerCase();

    if (!cleanSearch) {
      setSearchMessage("Escribe un usuario para buscar.");
      return;
    }

    const match = displayedWorldRows.find((row) =>
      (row.public_id ?? "").toLowerCase().includes(cleanSearch)
    );

    if (match) {
      setSearchMessage(`${match.public_id ?? "#------"} está en la posición #${match.position} con ${match.points} puntos.`);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("username, public_id, country, points")
      .ilike("public_id", `%${cleanSearch}%`)
      .order("points", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.log(error);
      setSearchMessage("No encontramos ese usuario en el ranking.");
      return;
    }

    setSearchMessage(`${data.public_id ?? "#------"} existe en el ranking con ${Number(data.points ?? 0)} puntos.`);
  }


  async function handleToggleWorldRanking() {
    if (checkingAccess) {
      alert("Estamos verificando tu acceso. Intenta de nuevo en unos segundos.");
      return;
    }

    if (lockedByLogin) {
      alert("Primero inicia sesión para ver el ranking mundial.");
      return;
    }

    if (lockedByPayment) {
      alert("Necesitas estar inscrito para ver el ranking mundial.");
      return;
    }

    if (waitingForStart) {
      setShowWorldRankingTable(false);
      return;
    }

    if (!showWorldRankingTable) {
      await loadWorldRanking(currentUsername);
    }

    setShowWorldRankingTable((prev) => !prev);
  }

  async function loadPrivateLeagues(username: string) {
    setLoadingLeagues(true);

    const { data, error } = await supabase
      .from("private_league_members")
      .select("league_id, private_leagues(id, name, code), username")
      .eq("username", username);

    if (error) {
      console.log(error);
      setLoadingLeagues(false);
      return;
    }

    const baseLeagues: PrivateLeague[] = (data ?? [])
      .map((item: any) => {
        const league = Array.isArray(item.private_leagues)
          ? item.private_leagues[0]
          : item.private_leagues;

        if (!league) return null;

        return {
          id: league.id,
          name: league.name,
          code: league.code,
          members: 1,
        };
      })
      .filter(Boolean) as PrivateLeague[];

    const leagueIds = baseLeagues.map((league) => league.id);

    if (leagueIds.length === 0) {
      setPrivateLeagues([]);
      setLoadingLeagues(false);
      return;
    }

    const { data: memberRows, error: membersError } = await supabase
      .from("private_league_members")
      .select("league_id")
      .in("league_id", leagueIds);

    if (membersError) {
      console.log(membersError);
      setPrivateLeagues(baseLeagues);
      setLoadingLeagues(false);
      return;
    }

    const memberCounts = (memberRows ?? []).reduce((acc: Record<string, number>, member: any) => {
      acc[member.league_id] = (acc[member.league_id] ?? 0) + 1;
      return acc;
    }, {});

    setPrivateLeagues(
      baseLeagues.map((league) => ({
        ...league,
        members: memberCounts[league.id] ?? 1,
      }))
    );
    setLoadingLeagues(false);
  }

  async function loadPrivateLeagueRanking(league: PrivateLeague) {
    setSelectedLeague(league);
    setLoadingLeagueRanking(true);
    setLeagueRankingRows([]);

    const { data: members, error: membersError } = await supabase
      .from("private_league_members")
      .select("username")
      .eq("league_id", league.id);

    if (membersError) {
      console.log(membersError);
      alert("No se pudo cargar el ranking privado.");
      setLoadingLeagueRanking(false);
      return;
    }

    const usernames = (members ?? [])
      .map((member: any) => member.username)
      .filter(Boolean);

    if (usernames.length === 0) {
      setLoadingLeagueRanking(false);
      return;
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("username, public_id, country, points")
      .in("username", usernames);

    if (usersError) {
      console.log(usersError);
    }

    const userMap = new Map((users ?? []).map((user: any) => [user.username, user]));

    const rows: LeagueRankingRow[] = usernames
      .map((username: string) => {
        const userData: any = userMap.get(username);

        return {
          position: 0,
          username,
          public_id: userData?.public_id ?? "#------",
          country: userData?.country ?? "MX",
          points: Number(userData?.points ?? 0),
        };
      })
      .sort((a, b) => b.points - a.points)
      .map((row, index) => ({ ...row, position: index + 1 }));

    setLeagueRankingRows(rows);
    setLoadingLeagueRanking(false);
  }

  async function copyLeagueCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedLeagueCode(code);
    window.setTimeout(() => setCopiedLeagueCode(null), 1500);
  }

  useEffect(() => {
    async function initUser() {
      setCheckingAccess(true);

      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;

      if (!email) {
        setUserIsLoggedIn(false);
        setCurrentUsername(null);
        setUserHasPaid(false);
        setCheckingAccess(false);
        await loadWorldRanking(null);
        return;
      }

      const username = getUsernameFallback(email);
      setUserIsLoggedIn(true);
      setCurrentUsername(username);

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("has_paid, points")
        .eq("username", username)
        .maybeSingle();

      if (userError) {
        console.log(userError);
      }

      setUserHasPaid(Boolean(userRow?.has_paid));
      setMyWorldPoints(Number(userRow?.points ?? 0));
      setCheckingAccess(false);

      await loadPrivateLeagues(username);
      await loadWorldRanking(username);
    }

    initUser();
  }, []);

  async function handleCreateLeague() {
    if (!userIsLoggedIn || !currentUsername) {
      alert("Primero inicia sesión para crear una liga privada.");
      return;
    }

    if (!userHasPaid) {
      alert("Necesitas estar inscrito para crear ligas privadas.");
      return;
    }

    const cleanName = leagueName.trim();

    if (!cleanName) {
      alert("Escribe el nombre de tu liga privada.");
      return;
    }

    const username = currentUsername ?? "jugador_demo";
    const code = createLeagueCode(cleanName);

    const { data: league, error: leagueError } = await supabase
      .from("private_leagues")
      .insert([
        {
          name: cleanName,
          code,
          created_by: username,
        },
      ])
      .select()
      .single();

    if (leagueError || !league) {
      console.log(leagueError);
      alert("No se pudo crear la liga. Inténtalo de nuevo.");
      return;
    }

    const { error: memberError } = await supabase.from("private_league_members").insert([
      {
        league_id: league.id,
        username,
      },
    ]);

    if (memberError) {
      console.log(memberError);
      alert("La liga se creó, pero no se pudo agregarte como miembro.");
      return;
    }

    await loadPrivateLeagues(username);
    closeModal();
    alert(`Liga creada correctamente. Código: ${league.code}`);
  }

  async function handleJoinLeague() {
    if (!userIsLoggedIn || !currentUsername) {
      alert("Primero inicia sesión para unirte a una liga privada.");
      return;
    }

    if (!userHasPaid) {
      alert("Necesitas estar inscrito para unirte a ligas privadas.");
      return;
    }

    const cleanCode = leagueCode.trim().toUpperCase();

    if (!cleanCode) {
      alert("Escribe el código de invitación.");
      return;
    }

    const username = currentUsername ?? "jugador_demo";

    const { data: league, error: leagueError } = await supabase
      .from("private_leagues")
      .select("id, name, code")
      .eq("code", cleanCode)
      .single();

    if (leagueError || !league) {
      console.log(leagueError);
      alert("No encontramos ninguna liga con ese código.");
      return;
    }

    const { error: memberError } = await supabase.from("private_league_members").insert([
      {
        league_id: league.id,
        username,
      },
    ]);

    if (memberError) {
      console.log(memberError);
      alert("No se pudo unir a la liga. Puede que ya pertenezcas a esta liga.");
      return;
    }

    await loadPrivateLeagues(username);
    closeModal();
    alert(`Te uniste correctamente a: ${league.name}`);
  }

  return (
    <main style={mainStyle}>
      <nav style={navStyle}>
        <a href="/" style={brandLinkStyle}>
          <div style={brandIconStyle}>⚽</div>
          <div>
            <p style={brandTitleStyle}>MUNDIAL PICKS</p>
            <p style={brandSubtitleStyle}>RANKING GLOBAL</p>
          </div>
        </a>

        <div style={navItemsStyle}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...navItemStyle,
                background: item.href === "/ranking" ? "#ef0012" : "rgba(255,255,255,0.06)",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <section style={pageContainerStyle}>
        <div style={heroStyle}>
          <div>
            <p style={eyebrowStyle}>Mundial Picks 2026</p>
            <h1 style={heroTitleStyle}>Ranking mundial</h1>
            <p style={heroTextStyle}>
              El ranking oficial aparecerá cuando empiece el Mundial. Desde aquí podrás buscar jugadores,
              crear rankings privados y abrir predicciones públicas cuando estén desbloqueadas.
            </p>
          </div>

          <div style={accessCardStyle}>
            <p style={mutedLabelStyle}>Tu acceso</p>
            <div style={accessPillDynamicStyle}>
              <span style={accessDotDynamicStyle} />
              {checkingAccess
                ? "Verificando acceso..."
                : userHasPaid
                  ? "Inscripción activa"
                  : userIsLoggedIn
                    ? "Acceso bloqueado"
                    : "Inicia sesión"}
            </div>
            <p style={accessTextStyle}>
              {checkingAccess
                ? "Estamos revisando tu acceso en Supabase."
                : userHasPaid
                  ? "Tu acceso está listo. El ranking se activará oficialmente a partir del primer partido."
                  : userIsLoggedIn
                    ? "Necesitas estar inscrito para acceder al ranking completo."
                    : "Inicia sesión o inscríbete para acceder al ranking completo."}
            </p>
          </div>
        </div>

        <div style={statsGridStyle}>
          {[
            ["Jugadores inscritos", totalPlayers > 0 ? totalPlayers.toLocaleString("es-MX") : "0"],
            ["Tu posición", rankingHasStarted ? (myWorldRank ? `#${myWorldRank}` : "Pendiente") : "Pendiente"],
            ["Tus puntos", rankingHasStarted ? String(myWorldPoints) : "0"],
            ["Top visible", "100"],
          ].map(([label, value]) => (
            <div key={label} style={statCardStyle}>
              <p style={statLabelStyle}>{label}</p>
             <p
  style={{
    ...statValueStyle,
    fontSize: value === "Pendiente" ? "22px" : "34px",
    lineHeight: "1.1",
  }}
>
  {value}
</p>
              {label === "Jugadores inscritos" && (
                <p style={statHelperStyle}>Sé de los primeros en competir 🌍</p>
              )}
            </div>
          ))}
        </div>

        <div style={searchBoxStyle}>
          <input
            value={searchUsername}
            onChange={(event) => setSearchUsername(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearchUser();
            }}
            placeholder="Buscar jugador por ID..."
            style={inputStyle}
          />
          <button style={buttonRed} onClick={handleSearchUser}>Buscar</button>
          <a href="/picks" onClick={() => localStorage.setItem("mundial-picks-view", "groups")} style={buttonDark}>Mis picks</a>
        </div>

        {searchMessage && (
          <div style={searchResultStyle}>
            {searchMessage}
          </div>
        )}

        <div style={worldRankingSectionStyle}>
          <div style={worldRankingIntroStyle}>
            <div>
              <p style={worldRankingEyebrowStyle}>Ranking mundial</p>
              <h2 style={worldRankingTitleStyle}>Top 100 global</h2>
              <p style={worldRankingTextStyle}>
                El ranking se consulta aparte para no llenar la página desde el inicio. Cuando el Mundial comience, podrás abrirlo y actualizarlo desde aquí.
              </p>
            </div>
            <button
              style={showWorldRankingTable ? buttonDark : buttonRed}
              onClick={handleToggleWorldRanking}
            >
              {showWorldRankingTable ? "Ocultar top 100" : "Mostrar top 100 ↓"}
            </button>
          </div>

          {showOverlay && (
            <div style={rankingUnavailableCardStyle}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>{lockedByPayment ? "🔒" : "🏆"}</div>
              <h2 style={overlayTitleStyle}>{lockedByPayment ? "Ranking bloqueado" : "Ranking aún no disponible"}</h2>
<p style={overlayTextStyle}>
  {lockedByPayment
    ? "Para ver el top 100, buscar jugadores y abrir predicciones de otros usuarios, necesitas estar inscrito."
    : "👀 Tranquilo… las predicciones de todos se desbloquean el 11 de junio.\n\nNada de copiar antes de tiempo 😏🔥\n\n(Everyone’s picks unlock on June 11 — no sneaky copying 😉)"}
</p>
              <a
                href="/picks"
                onClick={() => localStorage.setItem("mundial-picks-view", "groups")}
                style={{ ...buttonRed, display: "inline-grid", placeItems: "center", textDecoration: "none" }}
              >
                Ir a mis predicciones
              </a>
            </div>
          )}

          {!showOverlay && showWorldRankingTable && (
            <div style={tableShellStyle}>
              <div style={tableHeaderStyle}>
                <div>Pos</div>
                <div>Usuario</div>
                <div style={{ textAlign: "center" }}>País</div>
                <div style={{ textAlign: "right" }}>Puntos</div>
              </div>

              {loadingWorldRanking && (
                <div style={tableEmptyStateStyle}>Cargando ranking mundial...</div>
              )}

              {!loadingWorldRanking && displayedWorldRows.length === 0 && (
                <div style={tableEmptyStateStyle}>Todavía no hay jugadores guardados en Supabase.</div>
              )}

              {!loadingWorldRanking && displayedWorldRows.map((row) => (
                <div
                  key={row.position}
                  style={{
                    ...tableRowStyle,
                    background: row.position <= 3 ? "rgba(52,211,153,0.045)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: "18px", fontWeight: 900 }}>
                    {row.position <= 3 ? `🏆 ${row.position}` : `#${row.position}`}
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, fontSize: "16px" }}>
                      {row.public_id ?? "#------"}
                    </div>
                    <p style={helperTextStyle}>
                      Se desbloquea el 11 de junio 🔒
                    </p>
                  </div>

                  <div style={countryCellStyle}>{row.country}</div>
                  <div style={pointsCellStyle}>{row.points}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div id="ligas-privadas" style={privateSectionGridStyle}>
          <div style={privateCardStyle}>
            <p style={greenEyebrowStyle}>Ligas privadas</p>
            <h2 style={privateTitleStyle}>Crea tu ranking privado</h2>
            <p style={privateTextStyle}>
              Arma una liga con amigos, comparte un código y compitan en una tabla separada del ranking mundial.
            </p>
            <div style={buttonRowStyle}>
              <button style={buttonRed} onClick={() => setActiveModal("create")}>Crear liga</button>
              <button style={buttonDark} onClick={() => setActiveModal("join")}>Unirme con código</button>
            </div>

            <div style={leagueListStyle}>
              <h3 style={leagueListTitleStyle}>Tus ligas privadas</h3>
              {loadingLeagues && (
                <p style={emptyStateStyle}>Cargando tus ligas privadas...</p>
              )}

              {!loadingLeagues && !hasPrivateLeagues && (
                <p style={emptyStateStyle}>Aún no tienes ligas privadas. Crea una o únete con un código.</p>
              )}

              {privateLeagues.map((league) => (
                <div key={league.id} style={leagueItemStyle}>
                  <div>
                    <p style={leagueNameStyle}>{league.name}</p>
                    <p style={leagueMetaStyle}>Código: {league.code} · {league.members} miembro(s)</p>
                  </div>
                  <div style={leagueActionsStyle}>
                    <button
                      style={copyButtonStyle}
                      onClick={() => copyLeagueCode(league.code)}
                    >
                      {copiedLeagueCode === league.code ? "Copiado ✅" : "Copiar código"}
                    </button>
                    <button
                      style={viewRankingButtonStyle}
                      onClick={() => loadPrivateLeagueRanking(league)}
                    >
                      Ver ranking
                    </button>
                  </div>
                </div>
              ))}

              {selectedLeague && (
                <div style={privateRankingPanelStyle}>
                  <div style={privateRankingHeaderStyle}>
                    <div>
                      <p style={privateRankingLabelStyle}>Ranking privado</p>
                      <h3 style={privateRankingTitleStyle}>{selectedLeague.name}</h3>
                      <p style={leagueMetaStyle}>Código: {selectedLeague.code}</p>
                    </div>
                    <button style={copyButtonStyle} onClick={() => setSelectedLeague(null)}>
                      Cerrar
                    </button>
                  </div>

                  {loadingLeagueRanking && (
                    <p style={emptyStateStyle}>Cargando ranking privado...</p>
                  )}

                  {!loadingLeagueRanking && leagueRankingRows.length === 0 && (
                    <p style={emptyStateStyle}>Todavía no hay miembros para mostrar.</p>
                  )}

                  {!loadingLeagueRanking && leagueRankingRows.length > 0 && (
                    <div style={privateRankingTableStyle}>
                      <div style={privateRankingTableHeaderStyle}>
                        <div>Pos</div>
                        <div>Usuario</div>
                        <div style={{ textAlign: "center" }}>País</div>
                        <div style={{ textAlign: "right" }}>Puntos</div>
                      </div>

                      {leagueRankingRows.map((row) => (
                        <div key={`${selectedLeague.id}-${row.username}`} style={privateRankingRowStyle}>
                          <div style={{ fontWeight: 900 }}>{row.position <= 3 ? `🏆 ${row.position}` : `#${row.position}`}</div>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: "15px" }}>
                              {row.public_id ?? "#------"}
                            </div>
                            <p style={helperTextStyle}>
                              Disponible el 11 de junio 🔒
                            </p>
                          </div>
                          <div style={countryCellStyle}>{row.country}</div>
                          <div style={pointsCellStyle}>{row.points}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={infoCardStyle}>
            <p style={grayEyebrowStyle}>Importante</p>
            <h2 style={infoTitleStyle}>Acceso para usuarios inscritos</h2>
            <p style={infoTextStyle}>
              El ranking mundial y las predicciones públicas se desbloquean cuando inicie el Mundial. Si el usuario aún no está inscrito, esta sección permanecerá bloqueada.
            </p>
            <a
              href="/picks"
              onClick={() => localStorage.setItem("mundial-picks-view", "groups")}
              style={{ ...buttonDark, display: "inline-grid", whiteSpace: "nowrap" }}
            >
              Hacer mis predicciones
            </a>
          </div>
        </div>
      </section>

      {activeModal && (
        <div style={modalBackdrop}>
          <div style={modalCard}>
            <button style={modalCloseButton} onClick={closeModal}>×</button>
            <p style={modalEyebrow}>Ligas privadas</p>
            <h2 style={modalTitleStyle}>{modalTitle}</h2>

            {activeModal === "create" && (
              <>
                <p style={modalTextStyle}>Ponle nombre a tu liga. Se generará un código para compartir con tus amigos.</p>
                <input
                  value={leagueName}
                  onChange={(event) => setLeagueName(event.target.value)}
                  placeholder="Ejemplo: Los Compas"
                  style={modalInputStyle}
                />
                <button style={{ ...buttonRed, width: "100%" }} onClick={handleCreateLeague}>Crear liga privada</button>
              </>
            )}

            {activeModal === "join" && (
              <>
                <p style={modalTextStyle}>Escribe el código que te compartieron para unirte a una liga privada.</p>
                <input
                  value={leagueCode}
                  onChange={(event) => setLeagueCode(event.target.value.toUpperCase())}
                  placeholder="Ejemplo: LC2026"
                  style={modalInputStyle}
                />
                <button style={{ ...buttonRed, width: "100%" }} onClick={handleJoinLeague}>Unirme a la liga</button>
              </>
            )}

            <p style={modalNoteStyle}>
              Las ligas privadas ya se guardan en Supabase. Ahora también puedes ver el ranking privado de cada liga.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top left, #123b2a 0%, #03060b 34%, #02040a 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
  padding: "18px",
};

const navStyle: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto 18px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(3, 7, 18, 0.82)",
  borderRadius: "18px",
  padding: "12px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  flexWrap: "wrap",
};

const brandLinkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  textDecoration: "none",
  color: "white",
};

const brandIconStyle: CSSProperties = {
  width: "46px",
  height: "46px",
  borderRadius: "999px",
  background: "white",
  color: "#03060b",
  display: "grid",
  placeItems: "center",
  fontSize: "22px",
  fontWeight: 900,
};

const brandTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 900,
  lineHeight: 1,
};

const brandSubtitleStyle: CSSProperties = {
  margin: "5px 0 0",
  color: "#ef233c",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "2px",
};

const navItemsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
};

const navItemStyle: CSSProperties = {
  textDecoration: "none",
  color: "white",
  fontSize: "15px",
  fontWeight: 900,
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const pageContainerStyle: CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const heroStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
  borderRadius: "30px",
  padding: "34px",
  marginBottom: "18px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, 0.55fr)",
  gap: "22px",
};

const eyebrowStyle: CSSProperties = {
  color: "#34d399",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "4px",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

const heroTitleStyle: CSSProperties = {
  fontSize: "clamp(44px, 7vw, 84px)",
  lineHeight: "0.95",
  margin: 0,
  fontWeight: 900,
  letterSpacing: "-2px",
};

const heroTextStyle: CSSProperties = {
  maxWidth: "760px",
  color: "rgba(255,255,255,0.72)",
  fontSize: "18px",
  lineHeight: 1.55,
  margin: "18px 0 0",
};

const accessCardStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.28)",
  borderRadius: "24px",
  padding: "22px",
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "12px",
};

const mutedLabelStyle: CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.55)",
  fontWeight: 800,
};

const accessPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  gap: "10px",
  padding: "11px 15px",
  borderRadius: "999px",
  fontWeight: 900,
};

const accessDotStyle: CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "999px",
};

const accessTextStyle: CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.62)",
  lineHeight: 1.45,
  fontSize: "14px",
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "10px",
  marginBottom: "18px",
};

const statCardStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: "22px",
  padding: "clamp(12px, 2vw, 22px)",
  minWidth: 0,
};

const statLabelStyle: CSSProperties = {
  color: "rgba(255,255,255,0.55)",
  margin: 0,
  fontSize: "clamp(11px, 1.45vw, 14px)",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const statValueStyle: CSSProperties = {
  margin: "8px 0 0",
  fontWeight: 900,
  fontSize: "clamp(22px, 4vw, 34px)",
  lineHeight: 1,
  overflowWrap: "anywhere",
};


const statHelperStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "rgba(52,211,153,0.86)",
  fontSize: "clamp(10px, 1.25vw, 12px)",
  fontWeight: 900,
  lineHeight: 1.25,
};

const searchBoxStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  gap: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: "24px",
  padding: "16px",
  marginBottom: "18px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.35)",
  color: "white",
  borderRadius: "18px",
  padding: "15px 16px",
  fontSize: "15px",
  outline: "none",
};

const searchResultStyle: CSSProperties = {
  border: "1px solid rgba(52,211,153,0.22)",
  background: "rgba(52,211,153,0.08)",
  color: "rgba(255,255,255,0.78)",
  borderRadius: "18px",
  padding: "14px 16px",
  marginBottom: "18px",
  fontSize: "14px",
  fontWeight: 800,
};

const tableEmptyStateStyle: CSSProperties = {
  padding: "20px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.58)",
  fontSize: "14px",
};


const worldRankingSectionStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.045)",
  borderRadius: "28px",
  padding: "18px",
  marginBottom: "22px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
};

const worldRankingIntroStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "14px",
};

const worldRankingEyebrowStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#34d399",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "3px",
  textTransform: "uppercase",
};

const worldRankingTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "28px",
  lineHeight: 1,
  fontWeight: 900,
};

const worldRankingTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "rgba(255,255,255,0.66)",
  fontSize: "15px",
  lineHeight: 1.5,
  maxWidth: "720px",
};

const rankingUnavailableCardStyle: CSSProperties = {
  minHeight: "260px",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(3,6,11,0.82)",
  borderRadius: "24px",
  padding: "26px",
};

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  display: "grid",
  placeItems: "center",
  borderRadius: "28px",
  background: "rgba(0,0,0,0.46)",
  backdropFilter: "blur(8px)",
  padding: "22px",
};

const overlayCardStyle: CSSProperties = {
  maxWidth: "560px",
  textAlign: "center",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(3,6,11,0.94)",
  borderRadius: "28px",
  padding: "30px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
};

const overlayTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 900,
};

const overlayTextStyle: CSSProperties = {
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.5,
  fontSize: "16px",
};

const tableShellStyle: CSSProperties = {
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.055)",
  borderRadius: "28px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
};

const tableHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "90px minmax(260px,1fr) 170px 150px",
  gap: "12px",
  background: "rgba(255,255,255,0.12)",
  padding: "18px",
  color: "rgba(255,255,255,0.68)",
  fontSize: "12px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const tableRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "90px minmax(260px,1fr) 170px 150px",
  gap: "12px",
  alignItems: "center",
  padding: "18px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  color: "white",
};

const usernameLinkStyle: CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: "16px",
  display: "inline-block",
};

const helperTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "rgba(255,255,255,0.45)",
  fontSize: "12px",
};

const countryCellStyle: CSSProperties = {
  textAlign: "center",
  color: "rgba(255,255,255,0.75)",
  fontSize: "14px",
};

const pointsCellStyle: CSSProperties = {
  textAlign: "right",
  color: "#34d399",
  fontSize: "20px",
  fontWeight: 900,
};

const privateSectionGridStyle: CSSProperties = {
  marginTop: "28px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "18px",
  scrollMarginTop: "24px",
};

const privateCardStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background:
    "radial-gradient(circle at top left, rgba(239,0,18,0.28), transparent 34%), linear-gradient(135deg, rgba(239,0,18,0.16), rgba(255,255,255,0.055))",
  borderRadius: "32px",
  padding: "clamp(22px, 3vw, 34px)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
};

const greenEyebrowStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#34d399",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "3px",
  textTransform: "uppercase",
};

const privateTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(30px, 4vw, 48px)",
  lineHeight: 0.98,
  fontWeight: 900,
  letterSpacing: "-1px",
};

const privateTextStyle: CSSProperties = {
  margin: "14px 0 0",
  color: "rgba(255,255,255,0.72)",
  lineHeight: 1.55,
  fontSize: "16px",
  maxWidth: "760px",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "22px",
};

const leagueListStyle: CSSProperties = {
  marginTop: "26px",
  borderTop: "1px solid rgba(255,255,255,0.14)",
  paddingTop: "22px",
};

const leagueListTitleStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "22px",
  fontWeight: 900,
};

const emptyStateStyle: CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.58)",
  fontSize: "14px",
  lineHeight: 1.5,
};

const leagueItemStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "16px",
  padding: "18px",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "22px",
  background: "rgba(0,0,0,0.34)",
  marginTop: "12px",
  boxShadow: "0 14px 38px rgba(0,0,0,0.18)",
};

const leagueNameStyle: CSSProperties = {
  margin: 0,
  fontWeight: 900,
  fontSize: "20px",
  overflowWrap: "anywhere",
};

const leagueMetaStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "rgba(255,255,255,0.6)",
  fontSize: "14px",
  overflowWrap: "anywhere",
};

const copyButtonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};

const leagueActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const viewRankingButtonStyle: CSSProperties = {
  border: "0",
  background: "#ef0012",
  color: "white",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};

const privateRankingPanelStyle: CSSProperties = {
  marginTop: "22px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(0,0,0,0.38)",
  borderRadius: "26px",
  padding: "clamp(16px, 2.5vw, 24px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 50px rgba(0,0,0,0.22)",
};

const privateRankingHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "14px",
};

const privateRankingLabelStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#34d399",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const privateRankingTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(24px, 3vw, 34px)",
  fontWeight: 900,
};

const privateRankingTableStyle: CSSProperties = {
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "22px",
  background: "rgba(0,0,0,0.22)",
};

const privateRankingTableHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "58px minmax(0, 1fr) 54px 70px",
  gap: "8px",
  padding: "14px 12px",
  background: "rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.66)",
  fontSize: "11px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const privateRankingRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "58px minmax(0, 1fr) 54px 70px",
  gap: "8px",
  alignItems: "center",
  padding: "14px 12px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
};

const infoCardStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.028))",
  borderRadius: "26px",
  padding: "22px 24px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "18px",
};

const grayEyebrowStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "rgba(255,255,255,0.55)",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "3px",
  textTransform: "uppercase",
};

const infoTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(22px, 3vw, 30px)",
  lineHeight: 1.05,
  fontWeight: 900,
};

const infoTextStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "rgba(255,255,255,0.66)",
  lineHeight: 1.5,
  fontSize: "15px",
  maxWidth: "780px",
};

const modalBackdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "grid",
  placeItems: "center",
  background: "rgba(0,0,0,0.72)",
  backdropFilter: "blur(8px)",
  padding: "18px",
};

const modalCard: CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: "520px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#05080f",
  borderRadius: "28px",
  padding: "28px",
  boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
};

const modalCloseButton: CSSProperties = {
  position: "absolute",
  top: "14px",
  right: "14px",
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: "24px",
  fontWeight: 900,
  cursor: "pointer",
};

const modalEyebrow: CSSProperties = {
  margin: "0 0 8px",
  color: "#34d399",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "3px",
  textTransform: "uppercase",
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "30px",
  lineHeight: 1.05,
  fontWeight: 900,
};

const modalTextStyle: CSSProperties = {
  margin: "12px 0 16px",
  color: "rgba(255,255,255,0.66)",
  lineHeight: 1.5,
  fontSize: "15px",
};

const modalInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  borderRadius: "16px",
  padding: "15px 16px",
  fontSize: "15px",
  outline: "none",
  marginBottom: "14px",
};

const modalNoteStyle: CSSProperties = {
  margin: "14px 0 0",
  color: "rgba(255,255,255,0.45)",
  fontSize: "12px",
  lineHeight: 1.45,
};

const buttonRed: CSSProperties = {
  border: "0",
  background: "#ef0012",
  color: "white",
  borderRadius: "16px",
  padding: "0 22px",
  fontSize: "15px",
  fontWeight: 900,
  cursor: "pointer",
  minHeight: "50px",
};

const buttonDark: CSSProperties = {
  display: "grid",
  placeItems: "center",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "white",
  borderRadius: "16px",
  padding: "0 22px",
  fontSize: "15px",
  fontWeight: 900,
  textDecoration: "none",
  minHeight: "50px",
  cursor: "pointer",
};
