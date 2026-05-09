"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Match = {
  id: string;
  group: string;
  round: string;
  date: string;
  time: string;
  home: string;
  away: string;
  homeFlag: string;
  awayFlag: string;
  venue: string;
  city: string;
};

const groups = [
  "Todos",
  "Grupo A",
  "Grupo B",
  "Grupo C",
  "Grupo D",
  "Grupo E",
  "Grupo F",
  "Grupo G",
  "Grupo H",
  "Grupo I",
  "Grupo J",
  "Grupo K",
  "Grupo L",
];

const flag: Record<string, string> = {
  "MÉXICO": "mx",
  "SUDÁFRICA": "za",
  "COREA DEL SUR": "kr",
  "CHEQUIA": "cz",
  "CANADÁ": "ca",
  "BOSNIA Y HERZEGOVINA": "ba",
  "QATAR": "qa",
  "SUIZA": "ch",
  "BRASIL": "br",
  "MARRUECOS": "ma",
  "HAITÍ": "ht",
  "ESCOCIA": "gb-sct",
  "ESTADOS UNIDOS": "us",
  "PARAGUAY": "py",
  "AUSTRALIA": "au",
  "TURQUÍA": "tr",
  "ALEMANIA": "de",
  "CURAZAO": "cw",
  "COSTA DE MARFIL": "ci",
  "ECUADOR": "ec",
  "PAÍSES BAJOS": "nl",
  "JAPÓN": "jp",
  "SUECIA": "se",
  "TÚNEZ": "tn",
  "BÉLGICA": "be",
  "EGIPTO": "eg",
  "IRÁN": "ir",
  "NUEVA ZELANDA": "nz",
  "ESPAÑA": "es",
  "CABO VERDE": "cv",
  "ARABIA SAUDITA": "sa",
  "URUGUAY": "uy",
  "FRANCIA": "fr",
  "SENEGAL": "sn",
  "IRAK": "iq",
  "NORUEGA": "no",
  "ARGENTINA": "ar",
  "ARGELIA": "dz",
  "AUSTRIA": "at",
  "JORDANIA": "jo",
  "PORTUGAL": "pt",
  "RD CONGO": "cd",
  "UZBEKISTÁN": "uz",
  "COLOMBIA": "co",
  "INGLATERRA": "gb-eng",
  "CROACIA": "hr",
  "GHANA": "gh",
  "PANAMÁ": "pa",
};

const rawMatches = [
  ["A", "1", "11 JUN", "MÉXICO", "SUDÁFRICA", "Estadio Azteca", "Ciudad de México"],
  ["A", "1", "11 JUN", "COREA DEL SUR", "CHEQUIA", "Estadio Akron", "Guadalajara"],
  ["A", "2", "18 JUN", "CHEQUIA", "SUDÁFRICA", "Mercedes-Benz Stadium", "Atlanta"],
  ["A", "2", "18 JUN", "MÉXICO", "COREA DEL SUR", "Estadio Akron", "Guadalajara"],
  ["A", "3", "24 JUN", "CHEQUIA", "MÉXICO", "Estadio Azteca", "Ciudad de México"],
  ["A", "3", "24 JUN", "SUDÁFRICA", "COREA DEL SUR", "Estadio BBVA", "Monterrey"],
  ["B", "1", "12 JUN", "CANADÁ", "BOSNIA Y HERZEGOVINA", "BMO Field", "Toronto"],
  ["B", "1", "13 JUN", "QATAR", "SUIZA", "Levi’s Stadium", "San Francisco Bay Area"],
  ["B", "2", "18 JUN", "SUIZA", "BOSNIA Y HERZEGOVINA", "SoFi Stadium", "Los Ángeles"],
  ["B", "2", "18 JUN", "CANADÁ", "QATAR", "BC Place", "Vancouver"],
  ["B", "3", "24 JUN", "SUIZA", "CANADÁ", "BC Place", "Vancouver"],
  ["B", "3", "24 JUN", "BOSNIA Y HERZEGOVINA", "QATAR", "Lumen Field", "Seattle"],
  ["C", "1", "13 JUN", "BRASIL", "MARRUECOS", "MetLife Stadium", "New York / New Jersey"],
  ["C", "1", "13 JUN", "HAITÍ", "ESCOCIA", "Gillette Stadium", "Boston"],
  ["C", "2", "19 JUN", "ESCOCIA", "MARRUECOS", "Gillette Stadium", "Boston"],
  ["C", "2", "19 JUN", "BRASIL", "HAITÍ", "Lincoln Financial Field", "Philadelphia"],
  ["C", "3", "24 JUN", "ESCOCIA", "BRASIL", "Hard Rock Stadium", "Miami"],
  ["C", "3", "24 JUN", "MARRUECOS", "HAITÍ", "Mercedes-Benz Stadium", "Atlanta"],
  ["D", "1", "12 JUN", "ESTADOS UNIDOS", "PARAGUAY", "SoFi Stadium", "Los Ángeles"],
  ["D", "1", "13 JUN", "AUSTRALIA", "TURQUÍA", "BC Place", "Vancouver"],
  ["D", "2", "19 JUN", "TURQUÍA", "PARAGUAY", "Levi’s Stadium", "San Francisco Bay Area"],
  ["D", "2", "19 JUN", "ESTADOS UNIDOS", "AUSTRALIA", "Lumen Field", "Seattle"],
  ["D", "3", "25 JUN", "TURQUÍA", "ESTADOS UNIDOS", "SoFi Stadium", "Los Ángeles"],
  ["D", "3", "25 JUN", "PARAGUAY", "AUSTRALIA", "Levi’s Stadium", "San Francisco Bay Area"],
  ["E", "1", "14 JUN", "ALEMANIA", "CURAZAO", "NRG Stadium", "Houston"],
  ["E", "1", "14 JUN", "COSTA DE MARFIL", "ECUADOR", "Lincoln Financial Field", "Philadelphia"],
  ["E", "2", "20 JUN", "ALEMANIA", "COSTA DE MARFIL", "BMO Field", "Toronto"],
  ["E", "2", "20 JUN", "ECUADOR", "CURAZAO", "Arrowhead Stadium", "Kansas City"],
  ["E", "3", "25 JUN", "CURAZAO", "COSTA DE MARFIL", "Lincoln Financial Field", "Philadelphia"],
  ["E", "3", "25 JUN", "ECUADOR", "ALEMANIA", "MetLife Stadium", "New York / New Jersey"],
  ["F", "1", "14 JUN", "PAÍSES BAJOS", "JAPÓN", "AT&T Stadium", "Dallas"],
  ["F", "1", "14 JUN", "SUECIA", "TÚNEZ", "Estadio BBVA", "Monterrey"],
  ["F", "2", "20 JUN", "TÚNEZ", "JAPÓN", "Estadio BBVA", "Monterrey"],
  ["F", "2", "20 JUN", "PAÍSES BAJOS", "SUECIA", "NRG Stadium", "Houston"],
  ["F", "3", "25 JUN", "JAPÓN", "SUECIA", "AT&T Stadium", "Dallas"],
  ["F", "3", "25 JUN", "TÚNEZ", "PAÍSES BAJOS", "Arrowhead Stadium", "Kansas City"],
  ["G", "1", "15 JUN", "BÉLGICA", "EGIPTO", "Lumen Field", "Seattle"],
  ["G", "1", "15 JUN", "IRÁN", "NUEVA ZELANDA", "SoFi Stadium", "Los Ángeles"],
  ["G", "2", "21 JUN", "BÉLGICA", "IRÁN", "SoFi Stadium", "Los Ángeles"],
  ["G", "2", "21 JUN", "NUEVA ZELANDA", "EGIPTO", "BC Place", "Vancouver"],
  ["G", "3", "26 JUN", "EGIPTO", "IRÁN", "Lumen Field", "Seattle"],
  ["G", "3", "26 JUN", "NUEVA ZELANDA", "BÉLGICA", "BC Place", "Vancouver"],
  ["H", "1", "15 JUN", "ESPAÑA", "CABO VERDE", "Mercedes-Benz Stadium", "Atlanta"],
  ["H", "1", "15 JUN", "ARABIA SAUDITA", "URUGUAY", "Hard Rock Stadium", "Miami"],
  ["H", "2", "21 JUN", "ESPAÑA", "ARABIA SAUDITA", "Mercedes-Benz Stadium", "Atlanta"],
  ["H", "2", "21 JUN", "URUGUAY", "CABO VERDE", "Hard Rock Stadium", "Miami"],
  ["H", "3", "26 JUN", "CABO VERDE", "ARABIA SAUDITA", "NRG Stadium", "Houston"],
  ["H", "3", "26 JUN", "URUGUAY", "ESPAÑA", "Estadio Akron", "Guadalajara"],
  ["I", "1", "16 JUN", "FRANCIA", "SENEGAL", "MetLife Stadium", "New York / New Jersey"],
  ["I", "1", "16 JUN", "IRAK", "NORUEGA", "Gillette Stadium", "Boston"],
  ["I", "2", "22 JUN", "FRANCIA", "IRAK", "Lincoln Financial Field", "Philadelphia"],
  ["I", "2", "22 JUN", "NORUEGA", "SENEGAL", "MetLife Stadium", "New York / New Jersey"],
  ["I", "3", "26 JUN", "NORUEGA", "FRANCIA", "Gillette Stadium", "Boston"],
  ["I", "3", "26 JUN", "SENEGAL", "IRAK", "BMO Field", "Toronto"],
  ["J", "1", "16 JUN", "ARGENTINA", "ARGELIA", "Arrowhead Stadium", "Kansas City"],
  ["J", "1", "16 JUN", "AUSTRIA", "JORDANIA", "Levi’s Stadium", "San Francisco Bay Area"],
  ["J", "2", "22 JUN", "ARGENTINA", "AUSTRIA", "AT&T Stadium", "Dallas"],
  ["J", "2", "22 JUN", "JORDANIA", "ARGELIA", "Levi’s Stadium", "San Francisco Bay Area"],
  ["J", "3", "27 JUN", "ARGELIA", "AUSTRIA", "Arrowhead Stadium", "Kansas City"],
  ["J", "3", "27 JUN", "JORDANIA", "ARGENTINA", "AT&T Stadium", "Dallas"],
  ["K", "1", "17 JUN", "PORTUGAL", "RD CONGO", "NRG Stadium", "Houston"],
  ["K", "1", "17 JUN", "UZBEKISTÁN", "COLOMBIA", "Estadio Azteca", "Ciudad de México"],
  ["K", "2", "23 JUN", "PORTUGAL", "UZBEKISTÁN", "NRG Stadium", "Houston"],
  ["K", "2", "23 JUN", "COLOMBIA", "RD CONGO", "Estadio Akron", "Guadalajara"],
  ["K", "3", "27 JUN", "COLOMBIA", "PORTUGAL", "Hard Rock Stadium", "Miami"],
  ["K", "3", "27 JUN", "RD CONGO", "UZBEKISTÁN", "Mercedes-Benz Stadium", "Atlanta"],
  ["L", "1", "17 JUN", "INGLATERRA", "CROACIA", "AT&T Stadium", "Dallas"],
  ["L", "1", "17 JUN", "GHANA", "PANAMÁ", "BMO Field", "Toronto"],
  ["L", "2", "23 JUN", "INGLATERRA", "GHANA", "Gillette Stadium", "Boston"],
  ["L", "2", "23 JUN", "PANAMÁ", "CROACIA", "BMO Field", "Toronto"],
  ["L", "3", "27 JUN", "PANAMÁ", "INGLATERRA", "MetLife Stadium", "New York / New Jersey"],
  ["L", "3", "27 JUN", "CROACIA", "GHANA", "Lincoln Financial Field", "Philadelphia"],
] as const;

const kickoffTimes = [
  "13:00", "20:00", "12:00", "19:00", "19:00", "19:00",
  "15:00", "12:00", "12:00", "15:00", "12:00", "12:00",
  "18:00", "21:00", "18:00", "21:00", "18:00", "18:00",
  "18:00", "21:00", "20:00", "12:00", "19:00", "19:00",
  "12:00", "19:00", "16:00", "19:00", "16:00", "16:00",
  "15:00", "20:00", "22:00", "12:00", "18:00", "18:00",
  "12:00", "18:00", "12:00", "18:00", "20:00", "20:00",
  "12:00", "18:00", "12:00", "18:00", "19:00", "18:00",
  "15:00", "18:00", "17:00", "20:00", "15:00", "15:00",
  "20:00", "21:00", "12:00", "20:00", "21:00", "21:00",
  "12:00", "20:00", "12:00", "20:00", "19:30", "19:30",
  "15:00", "19:00", "16:00", "19:00", "17:00", "17:00",
];

const dateOrder: Record<string, number> = {
  "11 JUN": 11, "12 JUN": 12, "13 JUN": 13, "14 JUN": 14, "15 JUN": 15, "16 JUN": 16,
  "17 JUN": 17, "18 JUN": 18, "19 JUN": 19, "20 JUN": 20, "21 JUN": 21, "22 JUN": 22,
  "23 JUN": 23, "24 JUN": 24, "25 JUN": 25, "26 JUN": 26, "27 JUN": 27,
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeSearchText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const englishAliases: Record<string, string[]> = {
  "MÉXICO": ["mexico"],
  "SUDÁFRICA": ["south africa"],
  "COREA DEL SUR": ["south korea", "korea"],
  "CHEQUIA": ["czechia", "czech republic"],
  "CANADÁ": ["canada"],
  "BOSNIA Y HERZEGOVINA": ["bosnia", "bosnia and herzegovina"],
  "QATAR": ["qatar"],
  "SUIZA": ["switzerland"],
  "BRASIL": ["brazil"],
  "MARRUECOS": ["morocco"],
  "HAITÍ": ["haiti"],
  "ESCOCIA": ["scotland"],
  "ESTADOS UNIDOS": ["united states", "usa", "us", "america"],
  "PARAGUAY": ["paraguay"],
  "AUSTRALIA": ["australia"],
  "TURQUÍA": ["turkey", "turkiye"],
  "ALEMANIA": ["germany"],
  "CURAZAO": ["curacao", "curaçao"],
  "COSTA DE MARFIL": ["ivory coast", "cote d'ivoire", "cote divoire"],
  "ECUADOR": ["ecuador"],
  "PAÍSES BAJOS": ["netherlands", "holland"],
  "JAPÓN": ["japan"],
  "SUECIA": ["sweden"],
  "TÚNEZ": ["tunisia"],
  "BÉLGICA": ["belgium"],
  "EGIPTO": ["egypt"],
  "IRÁN": ["iran"],
  "NUEVA ZELANDA": ["new zealand"],
  "ESPAÑA": ["spain"],
  "CABO VERDE": ["cape verde"],
  "ARABIA SAUDITA": ["saudi arabia"],
  "URUGUAY": ["uruguay"],
  "FRANCIA": ["france"],
  "SENEGAL": ["senegal"],
  "IRAK": ["iraq"],
  "NORUEGA": ["norway"],
  "ARGENTINA": ["argentina"],
  "ARGELIA": ["algeria"],
  "AUSTRIA": ["austria"],
  "JORDANIA": ["jordan"],
  "PORTUGAL": ["portugal"],
  "RD CONGO": ["dr congo", "democratic republic of the congo", "congo"],
  "UZBEKISTÁN": ["uzbekistan"],
  "COLOMBIA": ["colombia"],
  "INGLATERRA": ["england"],
  "CROACIA": ["croatia"],
  "GHANA": ["ghana"],
  "PANAMÁ": ["panama"],
};

function searchableTextForMatch(match: Match) {
  const homeAliases = englishAliases[match.home] ?? [];
  const awayAliases = englishAliases[match.away] ?? [];

  return normalizeSearchText(
    [
      match.home,
      match.away,
      match.city,
      match.venue,
      match.group,
      ...homeAliases,
      ...awayAliases,
    ].join(" ")
  );
}


const matches: Match[] = rawMatches.map((match, index) => {
  const [groupLetter, round, date, home, away, venue, city] = match;
  return {
    id: `${groupLetter}-${index + 1}`,
    group: `Grupo ${groupLetter}`,
    round: `Jornada ${round}`,
    date,
    time: kickoffTimes[index] ?? "Por confirmar",
    home,
    away,
    homeFlag: `https://flagcdn.com/w80/${flag[home]}.png`,
    awayFlag: `https://flagcdn.com/w80/${flag[away]}.png`,
    venue,
    city,
  };
});

export default function CalendarioPage() {
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"time" | "group">("time");

  const filteredMatches = useMemo(() => {
    const query = normalizeSearchText(search.trim());

    const result = matches.filter((match) => {
      const groupMatch = activeGroup === "Todos" || match.group === activeGroup;
      const searchMatch = !query || searchableTextForMatch(match).includes(query);

      return groupMatch && searchMatch;
    });

    return [...result].sort((a, b) => {
      if (sortMode === "group") {
        return a.group.localeCompare(b.group) || dateOrder[a.date] - dateOrder[b.date] || timeToMinutes(a.time) - timeToMinutes(b.time);
      }

      return dateOrder[a.date] - dateOrder[b.date] || timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  }, [activeGroup, search, sortMode]);

  const matchesByDate = useMemo(() => {
    return filteredMatches.reduce<Record<string, Match[]>>((acc, match) => {
      if (!acc[match.date]) acc[match.date] = [];
      acc[match.date].push(match);
      return acc;
    }, {});
  }, [filteredMatches]);

  return (
    <main className="calendarPage">
      <div className="calendarShell">
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandBall">⚽</span>
            <span>
              <span className="brandTitle">Mundial Picks</span>
              <span className="brandSub">Calendario 2026</span>
            </span>
          </Link>

          <nav className="navLinks" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/picks">Mis Predicciones</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/como-se-puntua">Cómo se puntúa</Link>
            <Link className="active" href="/calendario">Calendario</Link>
          </nav>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">Mundial 2026</p>
            <h1>Calendario de partidos</h1>
            <p className="heroText">
              Consulta la fase de grupos por fecha, hora, grupo, selección y sede.
            </p>
          </div>

          <div className="heroStats">
            <div><strong>72</strong><span>partidos de grupos</span></div>
            <div><strong>12</strong><span>grupos</span></div>
            <div><strong>Hora</strong><span>local de sede</span></div>
          </div>
        </section>

        <section className="filtersPanel">
          <div className="searchBox">
            <label>Buscar partido</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="México, Mexico, Morocco, Guadalajara..."
            />
          </div>

          <div className="sortBox">
            <label>Ordenar</label>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as "time" | "group") }>
              <option value="time">Fecha y hora</option>
              <option value="group">Grupo</option>
            </select>
          </div>

          <div className="groupTabs">
            {groups.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={activeGroup === group ? "active" : ""}
              >
                {group}
              </button>
            ))}
          </div>
        </section>

        <section className="calendarPanel">
          <div className="panelHeader">
            <h2>Partidos</h2>
            <span>{filteredMatches.length} encontrados · hora local de la sede</span>
          </div>

          <div className="dateList">
            {Object.entries(matchesByDate).map(([date, dateMatches]) => (
              <div key={date} className="dateBlock">
                <div className="dateTitle">
                  <strong>{date}</strong>
                  <span>{dateMatches.length} partidos</span>
                </div>

                <div className="matchGrid">
                  {dateMatches.map((match) => (
                    <article key={match.id} className="matchCard">
                      <div className="matchTop">
                        <span>{match.group}</span>
                        <span>{match.round}</span>
                      </div>

                      <div className="teamsRow">
                        <div className="team">
                          <img src={match.homeFlag} alt={`Bandera ${match.home}`} />
                          <strong>{match.home}</strong>
                        </div>

                        <div className="matchCenter">
                          <span>VS</span>
                          <small>{match.time}</small>
                        </div>

                        <div className="team right">
                          <strong>{match.away}</strong>
                          <img src={match.awayFlag} alt={`Bandera ${match.away}`} />
                        </div>
                      </div>

                      <div className="venueRow">
                        <span>{match.venue}</span>
                        <small>{match.city}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #03060b; }

        .calendarPage {
          min-height: 100vh;
          color: white;
          padding: 8px 14px 24px;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at 84% 2%, rgba(239, 68, 68, 0.12), transparent 28%),
            radial-gradient(circle at 16% 0%, rgba(245, 158, 11, 0.08), transparent 22%),
            #03060b;
        }

        .calendarShell { width: min(100%, 1500px); margin: 0 auto; }

        .topbar, .hero, .filtersPanel, .calendarPanel {
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

        .brand { display: flex; align-items: center; gap: 12px; min-width: 255px; color: white; text-decoration: none; }
        .brandBall { width: 44px; height: 44px; border-radius: 999px; display: grid; place-items: center; background: #f8fafc; color: #020617; font-size: 23px; }
        .brandTitle { display: block; font-size: 25px; line-height: .9; font-weight: 950; text-transform: uppercase; letter-spacing: -.04em; }
        .brandSub { display: block; margin-top: 6px; color: #ef4444; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: .08em; }

        .navLinks { display: flex; align-items: center; gap: 32px; font-size: 14px; font-weight: 800; }
        .navLinks a { color: rgba(255,255,255,.86); text-decoration: none; padding: 25px 0 20px; }
        .navLinks a:hover, .navLinks .active { color: #ef4444; }
        .navLinks .active { border-bottom: 3px solid #ef4444; }

        .hero {
          border-radius: 14px;
          padding: 30px 34px;
          display: grid;
          grid-template-columns: 1fr 430px;
          gap: 24px;
          align-items: center;
          background:
            radial-gradient(circle at 84% 40%, rgba(245, 158, 11, .15), transparent 30%),
            linear-gradient(135deg, rgba(9, 15, 24, .98), rgba(7, 11, 18, .98));
        }

        .eyebrow { margin: 0 0 10px; color: #ef4444; font-size: 13px; font-weight: 950; text-transform: uppercase; letter-spacing: .08em; }
        h1 { margin: 0; max-width: 780px; font-size: clamp(46px, 5vw, 72px); line-height: .92; font-weight: 950; text-transform: uppercase; letter-spacing: -.055em; }
        .heroText { margin: 14px 0 0; color: rgba(255,255,255,.72); font-size: 17px; line-height: 1.4; font-weight: 650; }

        .heroStats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .heroStats div { border-radius: 14px; border: 1px solid rgba(255,255,255,.09); background: rgba(0,0,0,.14); padding: 18px; }
        .heroStats strong { display: block; color: #ef4444; font-size: 34px; line-height: .95; font-weight: 950; }
        .heroStats span { display: block; margin-top: 8px; color: rgba(255,255,255,.68); font-size: 12px; line-height: 1.25; font-weight: 850; text-transform: uppercase; }

        .filtersPanel {
          margin-top: 10px;
          border-radius: 14px;
          padding: 18px;
          display: grid;
          grid-template-columns: 320px 190px 1fr;
          gap: 16px;
          align-items: start;
        }

        .searchBox, .sortBox { display: grid; gap: 8px; }
        .searchBox label, .sortBox label { color: rgba(255,255,255,.58); font-size: 12px; font-weight: 950; text-transform: uppercase; }
        .searchBox input, .sortBox select { width: 100%; height: 44px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); outline: none; background: rgba(0,0,0,.20); color: white; padding: 0 14px; font-size: 14px; font-weight: 700; }

        .groupTabs { display: flex; flex-wrap: wrap; gap: 8px; }
        .groupTabs button { cursor: pointer; height: 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.16); color: rgba(255,255,255,.72); padding: 0 13px; font-family: inherit; font-size: 12px; font-weight: 950; text-transform: uppercase; }
        .groupTabs button.active { color: white; background: #ef111b; border-color: rgba(239,68,68,.7); }

        .calendarPanel { margin-top: 10px; border-radius: 14px; padding: 22px; }
        .panelHeader { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 16px; }
        .panelHeader h2 { margin: 0; font-size: 24px; font-weight: 950; text-transform: uppercase; letter-spacing: -.03em; }
        .panelHeader span { color: rgba(255,255,255,.52); font-size: 13px; font-weight: 850; text-transform: uppercase; }

        .dateList { display: grid; gap: 16px; }
        .dateBlock { display: grid; gap: 10px; }
        .dateTitle { display: flex; align-items: center; gap: 12px; border-left: 4px solid #ef4444; padding-left: 12px; }
        .dateTitle strong { font-size: 18px; font-weight: 950; }
        .dateTitle span { color: rgba(255,255,255,.46); font-size: 12px; font-weight: 850; text-transform: uppercase; }

        .matchGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .matchCard { border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: radial-gradient(circle at 0% 0%, rgba(239,68,68,.045), transparent 28%), rgba(0,0,0,.14); padding: 14px; }
        .matchTop { display: flex; justify-content: space-between; gap: 14px; color: rgba(255,255,255,.48); font-size: 11px; font-weight: 950; text-transform: uppercase; }
        .teamsRow { margin-top: 14px; display: grid; grid-template-columns: 1fr 70px 1fr; gap: 10px; align-items: center; }
        .team { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .team.right { justify-content: flex-end; text-align: right; }
        .team img { width: 36px; height: 24px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); }
        .team strong { font-size: 13px; line-height: 1.15; font-weight: 950; }
        .matchCenter { text-align: center; display: grid; justify-items: center; gap: 4px; }
        .matchCenter span { width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center; background: rgba(239,68,68,.12); color: #ef4444; border: 1px solid rgba(239,68,68,.25); font-size: 12px; font-weight: 950; }
        .matchCenter small { color: rgba(255,255,255,.52); font-size: 10px; font-weight: 850; text-transform: uppercase; }
        .venueRow { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.07); display: flex; justify-content: space-between; gap: 14px; }
        .venueRow span { color: rgba(255,255,255,.74); font-size: 12px; font-weight: 850; }
        .venueRow small { color: rgba(255,255,255,.44); font-size: 12px; font-weight: 750; text-align: right; }

        @media (max-width: 1100px) {
          .navLinks { display: none; }
          .hero, .filtersPanel { grid-template-columns: 1fr; }
          .matchGrid { grid-template-columns: 1fr; }
        }

        @media (max-width: 720px) {
          .calendarPage { padding: 8px; }
          .topbar { padding: 16px; }
          .brandTitle { font-size: 20px; }
          .hero, .filtersPanel, .calendarPanel { padding: 18px; }
          h1 { font-size: 42px; }
          .heroStats { grid-template-columns: 1fr; }
          .teamsRow { grid-template-columns: 1fr; text-align: center; }
          .team, .team.right { justify-content: center; text-align: center; }
          .venueRow { display: grid; text-align: center; }
          .venueRow small { text-align: center; }
        }
      `}</style>
    </main>
  );
}
