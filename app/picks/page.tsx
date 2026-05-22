"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type Match = {
  id: string;
  home: string;
  away: string;
  date: string;
  venue: string;
};
type KnockoutSlot = {
  homeName: string;
  awayName: string;
  homeCode?: string;
  awayCode?: string;
};
type KnockoutScore = {
  home: string;
  away: string;
  pensWinner: "none" | "home" | "away";
};

type KnockoutScoreMap = Record<string, KnockoutScore>;
type RoundOf32SeedMap = {
  firsts: Record<string, QualifiedTeam | undefined>;
  seconds: Record<string, QualifiedTeam | undefined>;
  thirds: Record<string, QualifiedTeam | undefined>;
};

type GroupTeam = {
  code: string;
  name: string;
};

type Group = {
  name: string;
  teams: GroupTeam[];
  matches: Match[];
};
type MainView = "groups" | "knockout" | "ranking" | "profile";
type RankingTab = "world" | "private";

type UserProfile = {
  username: string;
  country: string;
  flag: string;
  public_id?: string;
};

type PrivateLeague = {
  id: string;
  name: string;
  code: string;
  members: number;
};

const COUNTRY_OPTIONS = [
  { country: "Alemania", flag: "🇩🇪", code: "de" },
  { country: "Arabia Saudita", flag: "🇸🇦", code: "sa" },
  { country: "Argelia", flag: "🇩🇿", code: "dz" },
  { country: "Argentina", flag: "🇦🇷", code: "ar" },
  { country: "Australia", flag: "🇦🇺", code: "au" },
  { country: "Austria", flag: "🇦🇹", code: "at" },
  { country: "Bélgica", flag: "🇧🇪", code: "be" },
  { country: "Bosnia y Herzegovina", flag: "🇧🇦", code: "ba" },
  { country: "Brasil", flag: "🇧🇷", code: "br" },
  { country: "Cabo Verde", flag: "🇨🇻", code: "cv" },
  { country: "Canadá", flag: "🇨🇦", code: "ca" },
  { country: "Chequia", flag: "🇨🇿", code: "cz" },
  { country: "Colombia", flag: "🇨🇴", code: "co" },
  { country: "Corea del Sur", flag: "🇰🇷", code: "kr" },
  { country: "Costa de Marfil", flag: "🇨🇮", code: "ci" },
  { country: "Croacia", flag: "🇭🇷", code: "hr" },
  { country: "Curazao", flag: "🇨🇼", code: "cw" },
  { country: "Ecuador", flag: "🇪🇨", code: "ec" },
  { country: "Egipto", flag: "🇪🇬", code: "eg" },
  { country: "Escocia", flag: "🏴", code: "gb-sct" },
  { country: "España", flag: "🇪🇸", code: "es" },
  { country: "Estados Unidos", flag: "🇺🇸", code: "us" },
  { country: "Francia", flag: "🇫🇷", code: "fr" },
  { country: "Ghana", flag: "🇬🇭", code: "gh" },
  { country: "Haití", flag: "🇭🇹", code: "ht" },
  { country: "Inglaterra", flag: "🏴", code: "gb-eng" },
  { country: "Irak", flag: "🇮🇶", code: "iq" },
  { country: "Irán", flag: "🇮🇷", code: "ir" },
  { country: "Japón", flag: "🇯🇵", code: "jp" },
  { country: "Jordania", flag: "🇯🇴", code: "jo" },
  { country: "Marruecos", flag: "🇲🇦", code: "ma" },
  { country: "México", flag: "🇲🇽", code: "mx" },
  { country: "Noruega", flag: "🇳🇴", code: "no" },
  { country: "Nueva Zelanda", flag: "🇳🇿", code: "nz" },
  { country: "Países Bajos", flag: "🇳🇱", code: "nl" },
  { country: "Panamá", flag: "🇵🇦", code: "pa" },
  { country: "Paraguay", flag: "🇵🇾", code: "py" },
  { country: "Portugal", flag: "🇵🇹", code: "pt" },
  { country: "Qatar", flag: "🇶🇦", code: "qa" },
  { country: "RD Congo", flag: "🇨🇩", code: "cd" },
  { country: "Senegal", flag: "🇸🇳", code: "sn" },
  { country: "Sudáfrica", flag: "🇿🇦", code: "za" },
  { country: "Suecia", flag: "🇸🇪", code: "se" },
  { country: "Suiza", flag: "🇨🇭", code: "ch" },
  { country: "Túnez", flag: "🇹🇳", code: "tn" },
  { country: "Turquía", flag: "🇹🇷", code: "tr" },
  { country: "Uruguay", flag: "🇺🇾", code: "uy" },
  { country: "Uzbekistán", flag: "🇺🇿", code: "uz" },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  username: "",
  country: "",
  flag: "",
  public_id: "#------",
};

function getProfileStorageKey(email?: string | null) {
  return email ? `${STORAGE_KEYS.userProfile}-${email}` : "";
}

function sanitizeProfileUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
}

function getStoredUserProfile(email?: string | null): UserProfile {
  if (typeof window === "undefined" || !email) return DEFAULT_USER_PROFILE;

  const storageKey = getProfileStorageKey(email);
  const savedProfile = storageKey ? localStorage.getItem(storageKey) : null;

  if (!savedProfile) return DEFAULT_USER_PROFILE;

  try {
    const parsed = JSON.parse(savedProfile);
    const profileCountry = getProfileCountry(parsed?.country ?? parsed?.flag);

    return {
      username: sanitizeProfileUsername(parsed?.username ?? ""),
      country: parsed?.country ? profileCountry.country : "",
      flag: parsed?.country ? profileCountry.flag : "",
      public_id: parsed?.public_id ?? "#------",
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

function isProfileComplete(profile: UserProfile) {
  return Boolean(profile.country.trim() && profile.flag.trim());
}

function getPlayerPublicId(profile?: Pick<UserProfile, "public_id"> | null) {
  return profile?.public_id && profile.public_id !== "#------"
    ? profile.public_id
    : "#------";
}

function getCountryCodeForDatabase(country: string) {
  return getProfileCountry(country).code.toUpperCase();
}
function normalizeCountryText(value?: string) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getProfileCountry(value?: string) {
  const clean = normalizeCountryText(value);

  if (!clean) {
    return { country: "", flag: "", code: "" };
  }

  const option = COUNTRY_OPTIONS.find((item) => {
    const countryClean = normalizeCountryText(item.country);
    const codeClean = normalizeCountryText(item.code);
    const flagClean = normalizeCountryText(item.flag);
    return clean === countryClean || clean === codeClean || clean === flagClean;
  });

  if (option) return option;

  return { country: "", flag: "", code: "" };
}

function CountryFlag({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  if (!code) {
    return (
      <span
        className={`inline-grid place-items-center rounded-md bg-neutral-200 text-xs font-black text-neutral-500 shadow-sm ring-1 ring-black/10 ${className}`}
        aria-label="Bandera pendiente"
      >
        ?
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w320/${code}.png`}
      alt="Bandera"
      className={`inline-block rounded-md object-cover shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}

const DEFAULT_PRIVATE_LEAGUES: PrivateLeague[] = [
  { id: "league_demo_1", name: "Los Compas", code: "LC2026", members: 8 },
];

const PREDICTIONS_LOCK_DATE = new Date("2026-06-10T23:59:00-06:00");
const FORCE_UNLOCK = false;
const FIRST_MATCH_RANKINGS_OPEN_DATE = new Date("2026-06-11T15:00:00-06:00");
const PRIVATE_LEAGUE_NAME = "MI LIGA";

const GROUP_STAGE_POINTS = {
  resultCorrect: 3,
  exactGoalsOneTeam: 2,
  exactScore: 8,
};

const QUALIFIED_TO_ROUND_OF_32_POINTS = 4;

const KNOCKOUT_STAGE_POINTS = {
  "ronda de 32": {
    advance: 6,
    exactMatchup: 4,
    exactGoalsOneTeam: 3,
    exactScore: 13,
    pens: 1,
    pensWinner: 2,
  },
  octavos: {
    advance: 8,
    exactMatchup: 5,
    exactGoalsOneTeam: 4,
    exactScore: 17,
    pens: 2,
    pensWinner: 4,
  },
  cuartos: {
    advance: 10,
    exactMatchup: 6,
    exactGoalsOneTeam: 5,
    exactScore: 21,
    pens: 3,
    pensWinner: 6,
  },
  semifinales: {
    advance: 12,
    exactMatchup: 7,
    exactGoalsOneTeam: 6,
    exactScore: 25,
    pens: 4,
    pensWinner: 8,
  },
  final: {
    champion: 15,
    exactMatchup: 8,
    exactGoalsOneTeam: 7,
    exactScore: 30,
    pens: 5,
    pensWinner: 10,
  },
  "tercer lugar": {
    winner: 10,
    exactMatchup: 6,
    exactGoalsOneTeam: 5,
    exactScore: 21,
    pens: 3,
    pensWinner: 6,
  },
} as const;
const USE_DEMO_RESULTS_FOR_TESTING = false;
const FIFA_TEAM_ABBREVIATIONS: Record<string, string> = {
  MÉXICO: "MEX",
  SUDÁFRICA: "RSA",
  "COREA DEL SUR": "KOR",
  CHEQUIA: "CZE",
  CANADÁ: "CAN",
  "BOSNIA Y HERZEGOVINA": "BIH",
  QATAR: "QAT",
  SUIZA: "SUI",
  BRASIL: "BRA",
  MARRUECOS: "MAR",
  HAITÍ: "HAI",
  ESCOCIA: "SCO",
  "ESTADOS UNIDOS": "USA",
  PARAGUAY: "PAR",
  AUSTRALIA: "AUS",
  TURQUÍA: "TUR",
  ALEMANIA: "GER",
  CURAZAO: "CUW",
  "COSTA DE MARFIL": "CIV",
  ECUADOR: "ECU",
  "PAÍSES BAJOS": "NED",
  JAPÓN: "JPN",
  SUECIA: "SWE",
  TÚNEZ: "TUN",
  BÉLGICA: "BEL",
  EGIPTO: "EGY",
  IRÁN: "IRN",
  "NUEVA ZELANDA": "NZL",
  ESPAÑA: "ESP",
  "CABO VERDE": "CPV",
  "ARABIA SAUDITA": "KSA",
  URUGUAY: "URU",
  FRANCIA: "FRA",
  SENEGAL: "SEN",
  IRAK: "IRQ",
  NORUEGA: "NOR",
  ARGENTINA: "ARG",
  ARGELIA: "ALG",
  AUSTRIA: "AUT",
  JORDANIA: "JOR",
  PORTUGAL: "POR",
  "RD CONGO": "COD",
  UZBEKISTÁN: "UZB",
  COLOMBIA: "COL",
  INGLATERRA: "ENG",
  CROACIA: "CRO",
  GHANA: "GHA",
  PANAMÁ: "PAN",
};

function getFifaAbbreviation(teamName: string) {
  if (teamName === "POR DEFINIR") return "P/D";
  return (
    FIFA_TEAM_ABBREVIATIONS[teamName] ?? teamName.slice(0, 3).toUpperCase()
  );
}
const groups: Group[] = [
  {
    name: "GRUPO A",
    teams: [
      { code: "mx", name: "MÉXICO" },
      { code: "za", name: "SUDÁFRICA" },
      { code: "kr", name: "COREA DEL SUR" },
      { code: "cz", name: "CHEQUIA" },
    ],
    matches: [
      {
        id: "a1",
        home: "MÉXICO",
        away: "SUDÁFRICA",
        date: "11 JUN",
        venue: "CIUDAD DE MÉXICO – ESTADIO AZTECA",
      },
      {
        id: "a2",
        home: "COREA DEL SUR",
        away: "CHEQUIA",
        date: "11 JUN",
        venue: "GUADALAJARA – ESTADIO AKRON",
      },
      {
        id: "a3",
        home: "CHEQUIA",
        away: "SUDÁFRICA",
        date: "18 JUN",
        venue: "ATLANTA – MERCEDES-BENZ STADIUM",
      },
      {
        id: "a4",
        home: "MÉXICO",
        away: "COREA DEL SUR",
        date: "18 JUN",
        venue: "GUADALAJARA – ESTADIO AKRON",
      },
      {
        id: "a5",
        home: "CHEQUIA",
        away: "MÉXICO",
        date: "24 JUN",
        venue: "CIUDAD DE MÉXICO – ESTADIO AZTECA",
      },
      {
        id: "a6",
        home: "SUDÁFRICA",
        away: "COREA DEL SUR",
        date: "24 JUN",
        venue: "MONTERREY – ESTADIO BBVA",
      },
    ],
  },
  {
    name: "GRUPO B",
    teams: [
      { code: "ca", name: "CANADÁ" },
      { code: "ba", name: "BOSNIA Y HERZEGOVINA" },
      { code: "qa", name: "QATAR" },
      { code: "ch", name: "SUIZA" },
    ],
    matches: [
      {
        id: "b1",
        home: "CANADÁ",
        away: "BOSNIA Y HERZEGOVINA",
        date: "12 JUN",
        venue: "TORONTO – BMO FIELD",
      },
      {
        id: "b2",
        home: "QATAR",
        away: "SUIZA",
        date: "13 JUN",
        venue: "SAN FRANCISCO BAY AREA – LEVI’S STADIUM",
      },
      {
        id: "b3",
        home: "SUIZA",
        away: "BOSNIA Y HERZEGOVINA",
        date: "18 JUN",
        venue: "LOS ÁNGELES – SOFI STADIUM",
      },
      {
        id: "b4",
        home: "CANADÁ",
        away: "QATAR",
        date: "18 JUN",
        venue: "VANCOUVER – BC PLACE",
      },
      {
        id: "b5",
        home: "SUIZA",
        away: "CANADÁ",
        date: "24 JUN",
        venue: "VANCOUVER – BC PLACE",
      },
      {
        id: "b6",
        home: "BOSNIA Y HERZEGOVINA",
        away: "QATAR",
        date: "24 JUN",
        venue: "SEATTLE – LUMEN FIELD",
      },
    ],
  },
  {
    name: "GRUPO C",
    teams: [
      { code: "br", name: "BRASIL" },
      { code: "ma", name: "MARRUECOS" },
      { code: "ht", name: "HAITÍ" },
      { code: "gb-sct", name: "ESCOCIA" },
    ],
    matches: [
      {
        id: "c1",
        home: "BRASIL",
        away: "MARRUECOS",
        date: "13 JUN",
        venue: "NEW YORK / NEW JERSEY – METLIFE STADIUM",
      },
      {
        id: "c2",
        home: "HAITÍ",
        away: "ESCOCIA",
        date: "13 JUN",
        venue: "BOSTON – GILLETTE STADIUM",
      },
      {
        id: "c3",
        home: "ESCOCIA",
        away: "MARRUECOS",
        date: "19 JUN",
        venue: "BOSTON – GILLETTE STADIUM",
      },
      {
        id: "c4",
        home: "BRASIL",
        away: "HAITÍ",
        date: "19 JUN",
        venue: "PHILADELPHIA – LINCOLN FINANCIAL FIELD",
      },
      {
        id: "c5",
        home: "ESCOCIA",
        away: "BRASIL",
        date: "24 JUN",
        venue: "MIAMI – HARD ROCK STADIUM",
      },
      {
        id: "c6",
        home: "MARRUECOS",
        away: "HAITÍ",
        date: "24 JUN",
        venue: "ATLANTA – MERCEDES-BENZ STADIUM",
      },
    ],
  },
  {
    name: "GRUPO D",
    teams: [
      { code: "us", name: "ESTADOS UNIDOS" },
      { code: "py", name: "PARAGUAY" },
      { code: "au", name: "AUSTRALIA" },
      { code: "tr", name: "TURQUÍA" },
    ],
    matches: [
      {
        id: "d1",
        home: "ESTADOS UNIDOS",
        away: "PARAGUAY",
        date: "12 JUN",
        venue: "LOS ÁNGELES – SOFI STADIUM",
      },
      {
        id: "d2",
        home: "AUSTRALIA",
        away: "TURQUÍA",
        date: "13 JUN",
        venue: "VANCOUVER – BC PLACE",
      },
      {
        id: "d3",
        home: "TURQUÍA",
        away: "PARAGUAY",
        date: "19 JUN",
        venue: "SAN FRANCISCO BAY AREA – LEVI’S STADIUM",
      },
      {
        id: "d4",
        home: "ESTADOS UNIDOS",
        away: "AUSTRALIA",
        date: "19 JUN",
        venue: "SEATTLE – LUMEN FIELD",
      },
      {
        id: "d5",
        home: "TURQUÍA",
        away: "ESTADOS UNIDOS",
        date: "25 JUN",
        venue: "LOS ÁNGELES – SOFI STADIUM",
      },
      {
        id: "d6",
        home: "PARAGUAY",
        away: "AUSTRALIA",
        date: "25 JUN",
        venue: "SAN FRANCISCO BAY AREA – LEVI’S STADIUM",
      },
    ],
  },
  {
    name: "GRUPO E",
    teams: [
      { code: "de", name: "ALEMANIA" },
      { code: "cw", name: "CURAZAO" },
      { code: "ci", name: "COSTA DE MARFIL" },
      { code: "ec", name: "ECUADOR" },
    ],
    matches: [
      {
        id: "e1",
        home: "ALEMANIA",
        away: "CURAZAO",
        date: "14 JUN",
        venue: "HOUSTON – NRG STADIUM",
      },
      {
        id: "e2",
        home: "COSTA DE MARFIL",
        away: "ECUADOR",
        date: "14 JUN",
        venue: "PHILADELPHIA – LINCOLN FINANCIAL FIELD",
      },
      {
        id: "e3",
        home: "ALEMANIA",
        away: "COSTA DE MARFIL",
        date: "20 JUN",
        venue: "TORONTO – BMO FIELD",
      },
      {
        id: "e4",
        home: "ECUADOR",
        away: "CURAZAO",
        date: "20 JUN",
        venue: "KANSAS CITY – ARROWHEAD STADIUM",
      },
      {
        id: "e5",
        home: "CURAZAO",
        away: "COSTA DE MARFIL",
        date: "25 JUN",
        venue: "PHILADELPHIA – LINCOLN FINANCIAL FIELD",
      },
      {
        id: "e6",
        home: "ECUADOR",
        away: "ALEMANIA",
        date: "25 JUN",
        venue: "NEW YORK / NEW JERSEY – METLIFE STADIUM",
      },
    ],
  },
  {
    name: "GRUPO F",
    teams: [
      { code: "nl", name: "PAÍSES BAJOS" },
      { code: "jp", name: "JAPÓN" },
      { code: "se", name: "SUECIA" },
      { code: "tn", name: "TÚNEZ" },
    ],
    matches: [
      {
        id: "f1",
        home: "PAÍSES BAJOS",
        away: "JAPÓN",
        date: "14 JUN",
        venue: "DALLAS – AT&T STADIUM",
      },
      {
        id: "f2",
        home: "SUECIA",
        away: "TÚNEZ",
        date: "14 JUN",
        venue: "MONTERREY – ESTADIO BBVA",
      },
      {
        id: "f3",
        home: "TÚNEZ",
        away: "JAPÓN",
        date: "20 JUN",
        venue: "MONTERREY – ESTADIO BBVA",
      },
      {
        id: "f4",
        home: "PAÍSES BAJOS",
        away: "SUECIA",
        date: "20 JUN",
        venue: "HOUSTON – NRG STADIUM",
      },
      {
        id: "f5",
        home: "JAPÓN",
        away: "SUECIA",
        date: "25 JUN",
        venue: "DALLAS – AT&T STADIUM",
      },
      {
        id: "f6",
        home: "TÚNEZ",
        away: "PAÍSES BAJOS",
        date: "25 JUN",
        venue: "KANSAS CITY – ARROWHEAD STADIUM",
      },
    ],
  },
  {
    name: "GRUPO G",
    teams: [
      { code: "be", name: "BÉLGICA" },
      { code: "eg", name: "EGIPTO" },
      { code: "ir", name: "IRÁN" },
      { code: "nz", name: "NUEVA ZELANDA" },
    ],
    matches: [
      {
        id: "g1",
        home: "BÉLGICA",
        away: "EGIPTO",
        date: "15 JUN",
        venue: "SEATTLE – LUMEN FIELD",
      },
      {
        id: "g2",
        home: "IRÁN",
        away: "NUEVA ZELANDA",
        date: "15 JUN",
        venue: "LOS ÁNGELES – SOFI STADIUM",
      },
      {
        id: "g3",
        home: "BÉLGICA",
        away: "IRÁN",
        date: "21 JUN",
        venue: "LOS ÁNGELES – SOFI STADIUM",
      },
      {
        id: "g4",
        home: "NUEVA ZELANDA",
        away: "EGIPTO",
        date: "21 JUN",
        venue: "VANCOUVER – BC PLACE",
      },
      {
        id: "g5",
        home: "EGIPTO",
        away: "IRÁN",
        date: "26 JUN",
        venue: "SEATTLE – LUMEN FIELD",
      },
      {
        id: "g6",
        home: "NUEVA ZELANDA",
        away: "BÉLGICA",
        date: "26 JUN",
        venue: "VANCOUVER – BC PLACE",
      },
    ],
  },
  {
    name: "GRUPO H",
    teams: [
      { code: "es", name: "ESPAÑA" },
      { code: "cv", name: "CABO VERDE" },
      { code: "sa", name: "ARABIA SAUDITA" },
      { code: "uy", name: "URUGUAY" },
    ],
    matches: [
      {
        id: "h1",
        home: "ESPAÑA",
        away: "CABO VERDE",
        date: "15 JUN",
        venue: "ATLANTA – MERCEDES-BENZ STADIUM",
      },
      {
        id: "h2",
        home: "ARABIA SAUDITA",
        away: "URUGUAY",
        date: "15 JUN",
        venue: "MIAMI – HARD ROCK STADIUM",
      },
      {
        id: "h3",
        home: "ESPAÑA",
        away: "ARABIA SAUDITA",
        date: "21 JUN",
        venue: "ATLANTA – MERCEDES-BENZ STADIUM",
      },
      {
        id: "h4",
        home: "URUGUAY",
        away: "CABO VERDE",
        date: "21 JUN",
        venue: "MIAMI – HARD ROCK STADIUM",
      },
      {
        id: "h5",
        home: "CABO VERDE",
        away: "ARABIA SAUDITA",
        date: "26 JUN",
        venue: "HOUSTON – NRG STADIUM",
      },
      {
        id: "h6",
        home: "URUGUAY",
        away: "ESPAÑA",
        date: "26 JUN",
        venue: "GUADALAJARA – ESTADIO AKRON",
      },
    ],
  },
  {
    name: "GRUPO I",
    teams: [
      { code: "fr", name: "FRANCIA" },
      { code: "sn", name: "SENEGAL" },
      { code: "iq", name: "IRAK" },
      { code: "no", name: "NORUEGA" },
    ],
    matches: [
      {
        id: "i1",
        home: "FRANCIA",
        away: "SENEGAL",
        date: "16 JUN",
        venue: "NEW YORK / NEW JERSEY – METLIFE STADIUM",
      },
      {
        id: "i2",
        home: "IRAK",
        away: "NORUEGA",
        date: "16 JUN",
        venue: "BOSTON – GILLETTE STADIUM",
      },
      {
        id: "i3",
        home: "FRANCIA",
        away: "IRAK",
        date: "22 JUN",
        venue: "PHILADELPHIA – LINCOLN FINANCIAL FIELD",
      },
      {
        id: "i4",
        home: "NORUEGA",
        away: "SENEGAL",
        date: "22 JUN",
        venue: "NEW YORK / NEW JERSEY – METLIFE STADIUM",
      },
      {
        id: "i5",
        home: "NORUEGA",
        away: "FRANCIA",
        date: "26 JUN",
        venue: "BOSTON – GILLETTE STADIUM",
      },
      {
        id: "i6",
        home: "SENEGAL",
        away: "IRAK",
        date: "26 JUN",
        venue: "TORONTO – BMO FIELD",
      },
    ],
  },
  {
    name: "GRUPO J",
    teams: [
      { code: "ar", name: "ARGENTINA" },
      { code: "dz", name: "ARGELIA" },
      { code: "at", name: "AUSTRIA" },
      { code: "jo", name: "JORDANIA" },
    ],
    matches: [
      {
        id: "j1",
        home: "ARGENTINA",
        away: "ARGELIA",
        date: "16 JUN",
        venue: "KANSAS CITY – ARROWHEAD STADIUM",
      },
      {
        id: "j2",
        home: "AUSTRIA",
        away: "JORDANIA",
        date: "16 JUN",
        venue: "SAN FRANCISCO BAY AREA – LEVI’S STADIUM",
      },
      {
        id: "j3",
        home: "ARGENTINA",
        away: "AUSTRIA",
        date: "22 JUN",
        venue: "DALLAS – AT&T STADIUM",
      },
      {
        id: "j4",
        home: "JORDANIA",
        away: "ARGELIA",
        date: "22 JUN",
        venue: "SAN FRANCISCO BAY AREA – LEVI’S STADIUM",
      },
      {
        id: "j5",
        home: "ARGELIA",
        away: "AUSTRIA",
        date: "27 JUN",
        venue: "KANSAS CITY – ARROWHEAD STADIUM",
      },
      {
        id: "j6",
        home: "JORDANIA",
        away: "ARGENTINA",
        date: "27 JUN",
        venue: "DALLAS – AT&T STADIUM",
      },
    ],
  },
  {
    name: "GRUPO K",
    teams: [
      { code: "pt", name: "PORTUGAL" },
      { code: "cd", name: "RD CONGO" },
      { code: "uz", name: "UZBEKISTÁN" },
      { code: "co", name: "COLOMBIA" },
    ],
    matches: [
      {
        id: "k1",
        home: "PORTUGAL",
        away: "RD CONGO",
        date: "17 JUN",
        venue: "HOUSTON – NRG STADIUM",
      },
      {
        id: "k2",
        home: "UZBEKISTÁN",
        away: "COLOMBIA",
        date: "17 JUN",
        venue: "CIUDAD DE MÉXICO – ESTADIO AZTECA",
      },
      {
        id: "k3",
        home: "PORTUGAL",
        away: "UZBEKISTÁN",
        date: "23 JUN",
        venue: "HOUSTON – NRG STADIUM",
      },
      {
        id: "k4",
        home: "COLOMBIA",
        away: "RD CONGO",
        date: "23 JUN",
        venue: "GUADALAJARA – ESTADIO AKRON",
      },
      {
        id: "k5",
        home: "COLOMBIA",
        away: "PORTUGAL",
        date: "27 JUN",
        venue: "MIAMI – HARD ROCK STADIUM",
      },
      {
        id: "k6",
        home: "RD CONGO",
        away: "UZBEKISTÁN",
        date: "27 JUN",
        venue: "ATLANTA – MERCEDES-BENZ STADIUM",
      },
    ],
  },
  {
    name: "GRUPO L",
    teams: [
      { code: "gb-eng", name: "INGLATERRA" },
      { code: "hr", name: "CROACIA" },
      { code: "gh", name: "GHANA" },
      { code: "pa", name: "PANAMÁ" },
    ],
    matches: [
      {
        id: "l1",
        home: "INGLATERRA",
        away: "CROACIA",
        date: "17 JUN",
        venue: "DALLAS – AT&T STADIUM",
      },
      {
        id: "l2",
        home: "GHANA",
        away: "PANAMÁ",
        date: "17 JUN",
        venue: "TORONTO – BMO FIELD",
      },
      {
        id: "l3",
        home: "INGLATERRA",
        away: "GHANA",
        date: "23 JUN",
        venue: "BOSTON – GILLETTE STADIUM",
      },
      {
        id: "l4",
        home: "PANAMÁ",
        away: "CROACIA",
        date: "23 JUN",
        venue: "TORONTO – BMO FIELD",
      },
      {
        id: "l5",
        home: "PANAMÁ",
        away: "INGLATERRA",
        date: "27 JUN",
        venue: "NEW YORK / NEW JERSEY – METLIFE STADIUM",
      },
      {
        id: "l6",
        home: "CROACIA",
        away: "GHANA",
        date: "27 JUN",
        venue: "PHILADELPHIA – LINCOLN FINANCIAL FIELD",
      },
    ],
  },
];

const roundOf32 = [
  "1a vs 3/2",
  "1c vs 3/2",
  "1e vs 3/2",
  "1g vs 3/2",
  "1i vs 3/2",
  "1k vs 3/2",
  "2a vs 2b",
  "2c vs 2d",
  "2e vs 2f",
  "2g vs 2h",
  "2i vs 2j",
  "2k vs 2l",
  "1b vs 3/2",
  "1d vs 3/2",
  "1f vs 3/2",
  "1h vs 3/2",
];

const octavos = [
  "ganador 1 vs ganador 2",
  "ganador 3 vs ganador 4",
  "ganador 5 vs ganador 6",
  "ganador 7 vs ganador 8",
  "ganador 9 vs ganador 10",
  "ganador 11 vs ganador 12",
  "ganador 13 vs ganador 14",
  "ganador 15 vs ganador 16",
];

const cuartos = [
  "ganador oct 1 vs ganador oct 2",
  "ganador oct 3 vs ganador oct 4",
  "ganador oct 5 vs ganador oct 6",
  "ganador oct 7 vs ganador oct 8",
];

const semis = [
  "ganador cuartos 1 vs ganador cuartos 2",
  "ganador cuartos 3 vs ganador cuartos 4",
];
const DEMO_GROUP_SCORES: Record<string, { home: string; away: string }> = {
  a1: { home: "2", away: "0" }, // GRUPO A: MÉXICO 2-0 SUDÁFRICA
  a2: { home: "0", away: "0" }, // GRUPO A: COREA DEL SUR 0-0 CHEQUIA
  a3: { home: "0", away: "1" }, // GRUPO A: CHEQUIA 0-1 SUDÁFRICA
  a4: { home: "2", away: "0" }, // GRUPO A: MÉXICO 2-0 COREA DEL SUR
  a5: { home: "0", away: "2" }, // GRUPO A: CHEQUIA 0-2 MÉXICO
  a6: { home: "1", away: "0" }, // GRUPO A: SUDÁFRICA 1-0 COREA DEL SUR
  b1: { home: "2", away: "0" }, // GRUPO B: CANADÁ 2-0 BOSNIA Y HERZEGOVINA
  b2: { home: "0", away: "0" }, // GRUPO B: QATAR 0-0 SUIZA
  b3: { home: "0", away: "1" }, // GRUPO B: SUIZA 0-1 BOSNIA Y HERZEGOVINA
  b4: { home: "2", away: "0" }, // GRUPO B: CANADÁ 2-0 QATAR
  b5: { home: "0", away: "2" }, // GRUPO B: SUIZA 0-2 CANADÁ
  b6: { home: "1", away: "0" }, // GRUPO B: BOSNIA Y HERZEGOVINA 1-0 QATAR
  c1: { home: "2", away: "0" }, // GRUPO C: BRASIL 2-0 MARRUECOS
  c2: { home: "1", away: "0" }, // GRUPO C: HAITÍ 1-0 ESCOCIA
  c3: { home: "0", away: "1" }, // GRUPO C: ESCOCIA 0-1 MARRUECOS
  c4: { home: "2", away: "0" }, // GRUPO C: BRASIL 2-0 HAITÍ
  c5: { home: "0", away: "2" }, // GRUPO C: ESCOCIA 0-2 BRASIL
  c6: { home: "1", away: "0" }, // GRUPO C: MARRUECOS 1-0 HAITÍ
  d1: { home: "2", away: "0" }, // GRUPO D: ESTADOS UNIDOS 2-0 PARAGUAY
  d2: { home: "1", away: "0" }, // GRUPO D: AUSTRALIA 1-0 TURQUÍA
  d3: { home: "0", away: "1" }, // GRUPO D: TURQUÍA 0-1 PARAGUAY
  d4: { home: "2", away: "0" }, // GRUPO D: ESTADOS UNIDOS 2-0 AUSTRALIA
  d5: { home: "0", away: "2" }, // GRUPO D: TURQUÍA 0-2 ESTADOS UNIDOS
  d6: { home: "1", away: "0" }, // GRUPO D: PARAGUAY 1-0 AUSTRALIA
  e1: { home: "2", away: "0" }, // GRUPO E: ALEMANIA 2-0 CURAZAO
  e2: { home: "1", away: "0" }, // GRUPO E: COSTA DE MARFIL 1-0 ECUADOR
  e3: { home: "2", away: "0" }, // GRUPO E: ALEMANIA 2-0 COSTA DE MARFIL
  e4: { home: "0", away: "1" }, // GRUPO E: ECUADOR 0-1 CURAZAO
  e5: { home: "1", away: "0" }, // GRUPO E: CURAZAO 1-0 COSTA DE MARFIL
  e6: { home: "0", away: "2" }, // GRUPO E: ECUADOR 0-2 ALEMANIA
  f1: { home: "2", away: "0" }, // GRUPO F: PAÍSES BAJOS 2-0 JAPÓN
  f2: { home: "1", away: "0" }, // GRUPO F: SUECIA 1-0 TÚNEZ
  f3: { home: "0", away: "1" }, // GRUPO F: TÚNEZ 0-1 JAPÓN
  f4: { home: "2", away: "0" }, // GRUPO F: PAÍSES BAJOS 2-0 SUECIA
  f5: { home: "1", away: "0" }, // GRUPO F: JAPÓN 1-0 SUECIA
  f6: { home: "0", away: "2" }, // GRUPO F: TÚNEZ 0-2 PAÍSES BAJOS
  g1: { home: "2", away: "0" }, // GRUPO G: BÉLGICA 2-0 EGIPTO
  g2: { home: "1", away: "0" }, // GRUPO G: IRÁN 1-0 NUEVA ZELANDA
  g3: { home: "2", away: "0" }, // GRUPO G: BÉLGICA 2-0 IRÁN
  g4: { home: "0", away: "1" }, // GRUPO G: NUEVA ZELANDA 0-1 EGIPTO
  g5: { home: "1", away: "0" }, // GRUPO G: EGIPTO 1-0 IRÁN
  g6: { home: "0", away: "2" }, // GRUPO G: NUEVA ZELANDA 0-2 BÉLGICA
  h1: { home: "2", away: "0" }, // GRUPO H: ESPAÑA 2-0 CABO VERDE
  h2: { home: "1", away: "0" }, // GRUPO H: ARABIA SAUDITA 1-0 URUGUAY
  h3: { home: "2", away: "0" }, // GRUPO H: ESPAÑA 2-0 ARABIA SAUDITA
  h4: { home: "0", away: "1" }, // GRUPO H: URUGUAY 0-1 CABO VERDE
  h5: { home: "1", away: "0" }, // GRUPO H: CABO VERDE 1-0 ARABIA SAUDITA
  h6: { home: "0", away: "2" }, // GRUPO H: URUGUAY 0-2 ESPAÑA
  i1: { home: "2", away: "0" }, // GRUPO I: FRANCIA 2-0 SENEGAL
  i2: { home: "1", away: "0" }, // GRUPO I: IRAK 1-0 NORUEGA
  i3: { home: "2", away: "0" }, // GRUPO I: FRANCIA 2-0 IRAK
  i4: { home: "0", away: "1" }, // GRUPO I: NORUEGA 0-1 SENEGAL
  i5: { home: "0", away: "2" }, // GRUPO I: NORUEGA 0-2 FRANCIA
  i6: { home: "1", away: "0" }, // GRUPO I: SENEGAL 1-0 IRAK
  j1: { home: "2", away: "0" }, // GRUPO J: ARGENTINA 2-0 ARGELIA
  j2: { home: "1", away: "0" }, // GRUPO J: AUSTRIA 1-0 JORDANIA
  j3: { home: "2", away: "0" }, // GRUPO J: ARGENTINA 2-0 AUSTRIA
  j4: { home: "0", away: "1" }, // GRUPO J: JORDANIA 0-1 ARGELIA
  j5: { home: "1", away: "0" }, // GRUPO J: ARGELIA 1-0 AUSTRIA
  j6: { home: "0", away: "2" }, // GRUPO J: JORDANIA 0-2 ARGENTINA
  k1: { home: "2", away: "0" }, // GRUPO K: PORTUGAL 2-0 RD CONGO
  k2: { home: "0", away: "0" }, // GRUPO K: UZBEKISTÁN 0-0 COLOMBIA
  k3: { home: "2", away: "0" }, // GRUPO K: PORTUGAL 2-0 UZBEKISTÁN
  k4: { home: "0", away: "1" }, // GRUPO K: COLOMBIA 0-1 RD CONGO
  k5: { home: "0", away: "2" }, // GRUPO K: COLOMBIA 0-2 PORTUGAL
  k6: { home: "1", away: "0" }, // GRUPO K: RD CONGO 1-0 UZBEKISTÁN
  l1: { home: "2", away: "0" }, // GRUPO L: INGLATERRA 2-0 CROACIA
  l2: { home: "0", away: "0" }, // GRUPO L: GHANA 0-0 PANAMÁ
  l3: { home: "2", away: "0" }, // GRUPO L: INGLATERRA 2-0 GHANA
  l4: { home: "0", away: "1" }, // GRUPO L: PANAMÁ 0-1 CROACIA
  l5: { home: "0", away: "2" }, // GRUPO L: PANAMÁ 0-2 INGLATERRA
  l6: { home: "1", away: "0" }, // GRUPO L: CROACIA 1-0 GHANA
};

const DEMO_KNOCKOUT_SCORES: KnockoutScoreMap = {
  "r32-1": { home: "1", away: "2", pensWinner: "none" },
  "r32-2": { home: "2", away: "1", pensWinner: "none" },
  "r32-3": { home: "3", away: "0", pensWinner: "none" },
  "r32-4": { home: "0", away: "1", pensWinner: "none" },
  "r32-5": { home: "2", away: "0", pensWinner: "none" },
  "r32-6": { home: "1", away: "2", pensWinner: "none" },
  "r32-7": { home: "1", away: "1", pensWinner: "home" },
  "r32-8": { home: "2", away: "1", pensWinner: "none" },
  "r32-9": { home: "0", away: "2", pensWinner: "none" },
  "r32-10": { home: "1", away: "0", pensWinner: "none" },
  "r32-11": { home: "1", away: "3", pensWinner: "none" },
  "r32-12": { home: "2", away: "0", pensWinner: "none" },
  "r32-13": { home: "2", away: "1", pensWinner: "none" },
  "r32-14": { home: "1", away: "0", pensWinner: "none" },
  "r32-15": { home: "1", away: "2", pensWinner: "none" },
  "r32-16": { home: "0", away: "1", pensWinner: "none" },
  "oct-1": { home: "2", away: "0", pensWinner: "none" },
  "oct-2": { home: "2", away: "2", pensWinner: "away" },
  "oct-3": { home: "1", away: "0", pensWinner: "none" },
  "oct-4": { home: "0", away: "2", pensWinner: "none" },
  "oct-5": { home: "3", away: "1", pensWinner: "none" },
  "oct-6": { home: "1", away: "2", pensWinner: "none" },
  "oct-7": { home: "2", away: "1", pensWinner: "none" },
  "oct-8": { home: "0", away: "1", pensWinner: "none" },
  "qf-1": { home: "2", away: "1", pensWinner: "none" },
  "qf-2": { home: "1", away: "0", pensWinner: "none" },
  "qf-3": { home: "1", away: "2", pensWinner: "none" },
  "qf-4": { home: "3", away: "2", pensWinner: "none" },
  "sf-1": { home: "2", away: "0", pensWinner: "none" },
  "sf-2": { home: "1", away: "1", pensWinner: "away" },
  "third-1": { home: "2", away: "1", pensWinner: "none" },
  "final-1": { home: "1", away: "1", pensWinner: "home" },
};

const REAL_GROUP_SCORES: Record<string, { home: string; away: string }> =
  USE_DEMO_RESULTS_FOR_TESTING ? DEMO_GROUP_SCORES : {};

const REAL_KNOCKOUT_SCORES: KnockoutScoreMap = USE_DEMO_RESULTS_FOR_TESTING
  ? DEMO_KNOCKOUT_SCORES
  : {};

const STORAGE_KEYS = {
  view: "mundial-picks-view",
  selectedGroupIndex: "mundial-picks-selected-group-index",
  groupScores: "mundial-picks-group-scores",
  knockoutScores: "mundial-picks-knockout-scores",
  activeRankingTab: "mundial-picks-active-ranking-tab",
  userProfile: "mundial-picks-user-profile",
  privateLeagues: "mundial-picks-private-leagues",
};

function generatePublicId() {
  return `#${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function PicksPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [view, setView] = useState<MainView>("groups");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [activeRankingTab, setActiveRankingTab] = useState<RankingTab>("world");
  const [now, setNow] = useState(() => new Date());
  const [rankingRows, setRankingRows] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searchPublicId, setSearchPublicId] = useState("");
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);
  const [loadingSavedPrediction, setLoadingSavedPrediction] = useState(false);
  const [isSavingPicks, setIsSavingPicks] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  const selectedGroup = groups[selectedGroupIndex];

  const [groupScores, setGroupScores] = useState<
    Record<string, { home: string; away: string }>
  >(() => createEmptyGroupScores());
  const [knockoutScores, setKnockoutScores] = useState<KnockoutScoreMap>({});
  const guardarPrediccion = async () => {
    if (isSavingPicks) return;

    if (!user) {
      alert("Primero inicia sesión para guardar tus picks.");
      return;
    }

    const savedProfile = getStoredUserProfile(user.email);

    if (!isProfileComplete(savedProfile)) {
      alert("Antes de guardar tus picks, elige tu país/bandera en Mi perfil.");
      setView("profile");
      return;
    }

    // 🔒 BLOQUEO POR INSCRIPCIÓN
    const { data: accessData, error: accessError } = await supabase
      .from("users")
      .select("has_paid")
      .eq("email", user.email)
      .maybeSingle();

    if (accessError) {
      console.log(accessError);
      alert("No pudimos validar tu inscripción. Inténtalo de nuevo.");
      return;
    }

    if (!accessData?.has_paid) {
      alert("Necesitas estar inscrito para guardar tus predicciones.");
      window.location.href = "/inscripcion";
      return;
    }

    // 🔒 BLOQUEO POR FECHA
    const ahora = new Date();
    const fechaLimite = PREDICTIONS_LOCK_DATE;

    if (ahora >= fechaLimite) {
      alert("Las predicciones ya están bloqueadas");
      return;
    }

    if (isSpectatorMode) {
      alert(
        "Estás viendo la predicción de otro usuario. No puedes guardarla como tuya.",
      );
      return;
    }

    setIsSavingPicks(true);
    setSaveStatus("idle");

    try {
      if (new Date() >= PREDICTIONS_LOCK_DATE) {
        throw new Error("LOCKED");
      }

      let publicIdToUse = generatePublicId();

      const { data: existingUser } = await supabase
        .from("users")
        .select("public_id")
        .eq("email", user.email)
        .maybeSingle();

      if (existingUser?.public_id) {
        publicIdToUse = existingUser.public_id;
      }

      const { error } = await supabase.from("users").upsert(
        [
          {
            username: user.email,
            email: user.email,
            public_id: publicIdToUse,
            country: getCountryCodeForDatabase(savedProfile.country),
            points: totalPoints,
            group_scores: groupScores,
            knockout_scores: knockoutScores,
          },
        ],
        { onConflict: "username" },
      );

      if (error) {
        console.log(error);
        setSaveStatus("error");
        alert("Error al guardar predicción");
        return;
      }

      setSaveStatus("saved");
      window.setTimeout(() => {
        setSaveStatus("idle");
      }, 2500);
    } catch (err) {
      console.log(err);
      setSaveStatus("error");

      if (err instanceof Error && err.message === "LOCKED") {
        alert("Las predicciones ya están cerradas");
        return;
      }

      alert("Error inesperado");
    } finally {
      setIsSavingPicks(false);
    }
  };

  const cerrarSesion = async () => {
    const confirmSignOut = window.confirm("¿Seguro que quieres cerrar sesión?");

    if (!confirmSignOut) return;

    await supabase.auth.signOut();
    setUser(null);
    setIsSpectatorMode(false);
    window.location.href = "/";
  };
  useEffect(() => {
    const savedView = localStorage.getItem(STORAGE_KEYS.view);
    if (
      savedView === "groups" ||
      savedView === "knockout" ||
      savedView === "profile"
    ) {
      setView(savedView);
    } else if (savedView === "ranking") {
      setView("groups");
      localStorage.setItem(STORAGE_KEYS.view, "groups");
    }

    const savedIndex = localStorage.getItem(STORAGE_KEYS.selectedGroupIndex);
    const parsedIndex = Number(savedIndex);
    if (
      Number.isInteger(parsedIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < groups.length
    ) {
      setSelectedGroupIndex(parsedIndex);
    }

    const savedScores = localStorage.getItem(STORAGE_KEYS.groupScores);
    if (savedScores) {
      try {
        const parsed = JSON.parse(savedScores);
        setGroupScores((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch {}
    }

    const savedKnockoutScores = localStorage.getItem(
      STORAGE_KEYS.knockoutScores,
    );
    if (savedKnockoutScores) {
      try {
        const parsed = JSON.parse(savedKnockoutScores);
        setKnockoutScores(parsed);
      } catch {}
    }

    const savedRankingTab = localStorage.getItem(STORAGE_KEYS.activeRankingTab);
    if (savedRankingTab === "world" || savedRankingTab === "private") {
      setActiveRankingTab(savedRankingTab);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    async function cargarPerfilReal() {
      if (!user?.email) return;

      const { data } = await supabase
        .from("users")
        .select("public_id, country, points")
        .eq("email", user.email)
        .maybeSingle();

      const existingProfile = getStoredUserProfile(user.email);
      const metadata = user.user_metadata ?? {};
      const metadataCountry = getProfileCountry(metadata.country);
      const dbCountry = getProfileCountry(data?.country);

      localStorage.setItem(
        getProfileStorageKey(user.email),
        JSON.stringify({
          username: user.email,
          country: existingProfile.country || metadataCountry.country || dbCountry.country || "",
          flag: existingProfile.flag || metadataCountry.flag || dbCountry.flag || "",
          public_id: data?.public_id ?? existingProfile.public_id ?? "#------",
        }),
      );
    }

    cargarPerfilReal();
  }, [user]);

  useEffect(() => {
    async function cargarPrediccionGuardada() {
      if (!user?.email || isSpectatorMode) return;

      setLoadingSavedPrediction(true);

      const { data, error } = await supabase
        .from("users")
        .select("group_scores, knockout_scores")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.log(error);
        setLoadingSavedPrediction(false);
        return;
      }

      if (data?.group_scores) {
        setGroupScores((prev) => ({
          ...prev,
          ...data.group_scores,
        }));
      }

      if (data?.knockout_scores) {
        setKnockoutScores(data.knockout_scores);
      }

      setLoadingSavedPrediction(false);
    }

    cargarPrediccionGuardada();
  }, [user?.email, isSpectatorMode]);
  const isPredictionLocked = FORCE_UNLOCK
    ? false
    : now >= PREDICTIONS_LOCK_DATE;
  const areRankingsVisible = now >= FIRST_MATCH_RANKINGS_OPEN_DATE;
  const rankingCountdown = getCountdownParts(
    now,
    FIRST_MATCH_RANKINGS_OPEN_DATE,
  );
  async function cargarRanking() {
    const { data: top100, error } = await supabase
      .from("users")
      .select("username,public_id,points,country")
      .order("points", { ascending: false })
      .limit(100);

    if (error) {
      console.log(error);
      return;
    }

    setRankingRows(
      (top100 ?? []).map((user, index) => ({
        position: index + 1,
        username: user.username,
        public_id: user.public_id,
        country: user.country,
        points: user.points,
      })),
    );

    const { data: allUsers } = await supabase
      .from("users")
      .select("username,public_id,points,country")
      .order("points", { ascending: false });

    if (!allUsers) return;

    const index = allUsers.findIndex((u) => u.username === user?.email);

    setMyRank(index >= 0 ? index + 1 : null);
  }
  async function cargarPrediccionUsuario(username: string) {
    if (!areRankingsVisible) {
      alert(
        "Las predicciones de otros usuarios estarán disponibles después del primer partido.",
      );
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("username,country,points,group_scores,knockout_scores")
      .eq("username", username)
      .single();

    if (error || !data) {
      console.log(error);
      alert("No se pudo cargar la predicción del usuario");
      return;
    }
    setGroupScores(data.group_scores ?? createEmptyGroupScores());
    setKnockoutScores(data.knockout_scores ?? {});
    setIsSpectatorMode(true);
    setView("groups");
  }
  async function buscarUsuarioPorId() {
    const cleanId = searchPublicId.trim();

    if (!cleanId) {
      alert("Escribe un ID de jugador, ejemplo: #123456");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("public_id", cleanId)
      .single();

    if (error || !data) {
      alert("No encontramos ningún jugador con ese ID");
      return;
    }

    cargarPrediccionUsuario(data.username);
  }
  function updateGroupScore(
    matchId: string,
    side: "home" | "away",
    value: string,
  ) {
    if (isPredictionLocked) return;
    if (!/^\d*$/.test(value)) return;

    setGroupScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value,
      },
    }));
  }
  function updateKnockoutScore(
    matchId: string,
    side: "home" | "away",
    value: string,
  ) {
    if (isPredictionLocked) return;
    if (!/^\d*$/.test(value)) return;

    setKnockoutScores((prev) => {
      const current = prev[matchId] ?? {
        home: "",
        away: "",
        pensWinner: "none" as const,
      };

      const updated = {
        ...current,
        [side]: value,
      };

      const isDraw =
        updated.home !== "" &&
        updated.away !== "" &&
        Number(updated.home) === Number(updated.away);

      return {
        ...prev,
        [matchId]: {
          ...updated,
          pensWinner: isDraw ? updated.pensWinner : "none",
        },
      };
    });
  }

  function setPenaltyWinner(matchId: string, winner: "home" | "away") {
    if (isPredictionLocked) return;
    setKnockoutScores((prev) => {
      const current = prev[matchId] ?? {
        home: "",
        away: "",
        pensWinner: "none" as const,
      };

      const isDraw =
        current.home !== "" &&
        current.away !== "" &&
        Number(current.home) === Number(current.away);

      if (!isDraw) {
        return {
          ...prev,
          [matchId]: {
            ...current,
            pensWinner: "none",
          },
        };
      }

      return {
        ...prev,
        [matchId]: {
          ...current,
          pensWinner: winner,
        },
      };
    });
  }
  function loadDemoPrediction() {
    if (isPredictionLocked) return;
    setGroupScores({ ...DEMO_GROUP_SCORES });
    setKnockoutScores({ ...DEMO_KNOCKOUT_SCORES });
    setView("knockout");
  }

  function clearAllPicks() {
    if (isPredictionLocked) return;
    setGroupScores(createEmptyGroupScores());
    setKnockoutScores({});
    localStorage.removeItem(STORAGE_KEYS.groupScores);
    localStorage.removeItem(STORAGE_KEYS.knockoutScores);
  }

  function clearGroupStage() {
    if (isPredictionLocked) return;

    const confirmClear = window.confirm(
      "¿Seguro que quieres limpiar todos los resultados de fase de grupos?",
    );

    if (!confirmClear) return;

    setGroupScores(createEmptyGroupScores());
    localStorage.removeItem(STORAGE_KEYS.groupScores);
  }

  function clearKnockoutStage() {
    if (isPredictionLocked) return;

    const confirmClear = window.confirm(
      "¿Seguro que quieres limpiar todo el bracket?",
    );
    if (!confirmClear) return;

    setKnockoutScores({});
    localStorage.removeItem(STORAGE_KEYS.knockoutScores);
  }

  function getTeamData(teamName: string) {
    return selectedGroup.teams.find((team) => team.name === teamName);
  }

  const selectedStandings = useMemo(() => {
    return computeStandings(selectedGroup, groupScores);
  }, [selectedGroup, groupScores]);

  const allGroupStandings = useMemo(() => {
    return groups.map((group) => ({
      name: group.name,
      standings: computeStandings(group, groupScores),
    }));
  }, [groupScores]);

  const qualifiedData = useMemo(() => {
    return computeQualifiedTeams(allGroupStandings);
  }, [allGroupStandings]);
  const totalGroupStagePoints = useMemo(() => {
    let total = 0;

    groups.forEach((group) => {
      group.matches.forEach((match) => {
        const predicted = groupScores[match.id] ?? { home: "", away: "" };
        const real = REAL_GROUP_SCORES[match.id] ?? { home: "", away: "" };

        total += getGroupMatchPoints(predicted, real);
      });
    });

    return total;
  }, [groupScores]);
  const predictedRoundOf32Teams = useMemo(() => {
    const teams: string[] = [];

    allGroupStandings.forEach((group) => {
      const sorted = group.standings;
      if (sorted[0]) teams.push(sorted[0].name);
      if (sorted[1]) teams.push(sorted[1].name);
    });

    qualifiedData.bestThirds.forEach((team) => {
      teams.push(team.name);
    });

    return teams;
  }, [allGroupStandings, qualifiedData]);

  const demoAllGroupStandings = useMemo(() => {
    return groups.map((group) => ({
      name: group.name,
      standings: computeStandings(group, DEMO_GROUP_SCORES),
    }));
  }, []);

  const demoQualifiedData = useMemo(() => {
    return computeQualifiedTeams(demoAllGroupStandings);
  }, [demoAllGroupStandings]);

  const demoRoundOf32Teams = useMemo(() => {
    const teams: string[] = [];

    demoAllGroupStandings.forEach((group) => {
      const sorted = group.standings;
      if (sorted[0]) teams.push(sorted[0].name);
      if (sorted[1]) teams.push(sorted[1].name);
    });

    demoQualifiedData.bestThirds.forEach((team) => {
      teams.push(team.name);
    });

    return teams;
  }, [demoAllGroupStandings, demoQualifiedData]);

  const realRoundOf32Teams: string[] = USE_DEMO_RESULTS_FOR_TESTING
    ? demoRoundOf32Teams
    : [];
  const totalRoundOf32QualifiedPoints = useMemo(() => {
    let total = 0;

    predictedRoundOf32Teams.forEach((team) => {
      if (realRoundOf32Teams.includes(team)) {
        total += QUALIFIED_TO_ROUND_OF_32_POINTS;
      }
    });

    return total;
  }, [predictedRoundOf32Teams]);
  const bestThirdGroups = useMemo(() => {
    return getBestThirdGroups(qualifiedData.bestThirds);
  }, [qualifiedData.bestThirds]);

  const bestThirdGroupsKey = useMemo(() => {
    return bestThirdGroups.join("");
  }, [bestThirdGroups]);

  const roundOf32Slots = useMemo(() => {
    return buildProvisionalRoundOf32(qualifiedData);
  }, [qualifiedData]);
  function isDrawScore(score?: KnockoutScore) {
    if (!score) return false;
    if (score.home === "" || score.away === "") return false;

    return Number(score.home) === Number(score.away);
  }
  function getWinnerFromScoreMap(
    scores: KnockoutScoreMap,
    matchId: string,
    home: string,
    away: string,
  ) {
    const score = scores[matchId];

    if (!score) return undefined;
    if (home === "POR DEFINIR" || away === "POR DEFINIR") return undefined;
    if (score.home === "" || score.away === "") return undefined;

    const homeGoals = Number(score.home);
    const awayGoals = Number(score.away);

    if (homeGoals > awayGoals) return home;
    if (awayGoals > homeGoals) return away;

    if (score.pensWinner === "home") return home;
    if (score.pensWinner === "away") return away;

    return undefined;
  }

  function getWinner(matchId: string, home: string, away: string) {
    return getWinnerFromScoreMap(knockoutScores, matchId, home, away);
  }
  function isExactScore(
    predictedHome: string,
    predictedAway: string,
    realHome: string,
    realAway: string,
  ) {
    return predictedHome === realHome && predictedAway === realAway;
  }

  function countExactGoalsTeams(
    predictedHome: string,
    predictedAway: string,
    realHome: string,
    realAway: string,
  ) {
    let count = 0;
    if (predictedHome === realHome) count += 1;
    if (predictedAway === realAway) count += 1;
    return count;
  }

  function getGroupResultType(home: string, away: string) {
    const h = Number(home);
    const a = Number(away);

    if (h > a) return "home";
    if (a > h) return "away";
    return "draw";
  }
  function getGroupMatchPoints(
    predicted: { home: string; away: string },
    real: { home: string; away: string },
  ) {
    if (
      predicted.home === "" ||
      predicted.away === "" ||
      real.home === "" ||
      real.away === ""
    ) {
      return 0;
    }

    if (isExactScore(predicted.home, predicted.away, real.home, real.away)) {
      return GROUP_STAGE_POINTS.exactScore;
    }

    let points = 0;

    const predictedResult = getGroupResultType(predicted.home, predicted.away);
    const realResult = getGroupResultType(real.home, real.away);

    if (predictedResult === realResult) {
      points += GROUP_STAGE_POINTS.resultCorrect;
    }

    const exactGoalsTeams = countExactGoalsTeams(
      predicted.home,
      predicted.away,
      real.home,
      real.away,
    );

    points += exactGoalsTeams * GROUP_STAGE_POINTS.exactGoalsOneTeam;

    return points;
  }
  function getKnockoutStagePoints(
    stage:
      | "ronda de 32"
      | "octavos"
      | "cuartos"
      | "semifinales"
      | "final"
      | "tercer lugar",
    predicted: KnockoutScore,
    real: KnockoutScore,
    predictedHomeName: string,
    predictedAwayName: string,
    realHomeName: string,
    realAwayName: string,
  ) {
    const stagePoints = KNOCKOUT_STAGE_POINTS[stage];

    const predictedWinner = getWinnerFromScore(
      predicted,
      predictedHomeName,
      predictedAwayName,
    );
    const realWinner = getWinnerFromScore(real, realHomeName, realAwayName);

    if (!predictedWinner || !realWinner) {
      return 0;
    }

    // Regla estricta:
    // En eliminatorias NO se dan puntos por ganador, goles, marcador ni penales
    // si el cruce no coincide exactamente con el cruce real de esa misma casilla.
    // Ejemplo: si la final real demo es BOSNIA vs CANADÁ, una final ALEMANIA vs CANADÁ suma 0 en final.
    const predictedHasExactMatchup =
      predictedHomeName === realHomeName && predictedAwayName === realAwayName;

    if (!predictedHasExactMatchup) {
      return 0;
    }

    let points = stagePoints.exactMatchup;

    if (predictedWinner === realWinner) {
      if (stage === "final") {
        points += KNOCKOUT_STAGE_POINTS.final.champion;
      } else if (stage === "tercer lugar") {
        points += KNOCKOUT_STAGE_POINTS["tercer lugar"].winner;
      } else {
        points += KNOCKOUT_STAGE_POINTS[stage].advance;
      }
    }

    if (
      isExactScore(predicted.home, predicted.away, real.home, real.away) &&
      predicted.pensWinner === real.pensWinner
    ) {
      points += stagePoints.exactScore;
      return points;
    }

    const exactGoalsTeams = countExactGoalsTeams(
      predicted.home,
      predicted.away,
      real.home,
      real.away,
    );

    points += exactGoalsTeams * stagePoints.exactGoalsOneTeam;

    const predictedIsDraw =
      predicted.home !== "" &&
      predicted.away !== "" &&
      Number(predicted.home) === Number(predicted.away);

    const realIsDraw =
      real.home !== "" &&
      real.away !== "" &&
      Number(real.home) === Number(real.away);

    if (predictedIsDraw && realIsDraw) {
      points += stagePoints.pens;

      if (predicted.pensWinner === real.pensWinner) {
        points += stagePoints.pensWinner;
      }
    }

    return points;
  }
  function sumKnockoutStagePoints(
    stage:
      | "ronda de 32"
      | "octavos"
      | "cuartos"
      | "semifinales"
      | "final"
      | "tercer lugar",
    predictedSlots: KnockoutSlot[],
    realSlots: KnockoutSlot[],
    matchIds: string[],
    predictedScores: KnockoutScoreMap,
    realScores: KnockoutScoreMap,
  ) {
    let total = 0;

    predictedSlots.forEach((predictedMatch, index) => {
      const realMatch = realSlots[index];
      const matchId = matchIds[index];

      if (!realMatch) return;

      const predictedScore = predictedScores[matchId] ?? {
        home: "",
        away: "",
        pensWinner: "none",
      };

      const realScore = realScores[matchId] ?? {
        home: "",
        away: "",
        pensWinner: "none",
      };

      total += getKnockoutStagePoints(
        stage,
        predictedScore,
        realScore,
        predictedMatch.homeName,
        predictedMatch.awayName,
        realMatch.homeName,
        realMatch.awayName,
      );
    });

    return total;
  }

  function getWinnerFromScore(
    score: KnockoutScore,
    homeName: string,
    awayName: string,
  ) {
    if (score.home === "" || score.away === "") return null;

    const homeGoals = Number(score.home);
    const awayGoals = Number(score.away);

    if (homeGoals > awayGoals) return homeName;
    if (awayGoals > homeGoals) return awayName;

    if (score.pensWinner === "home") return homeName;
    if (score.pensWinner === "away") return awayName;

    return null;
  }
  const roundOf32Ids = Array.from({ length: 16 }, (_, i) => `r32-${i + 1}`);
  const octavosIds = Array.from({ length: 8 }, (_, i) => `oct-${i + 1}`);
  const cuartosIds = Array.from({ length: 4 }, (_, i) => `qf-${i + 1}`);
  const semisIds = Array.from({ length: 2 }, (_, i) => `sf-${i + 1}`);
  const finalId = "final-1";
  const thirdPlaceId = "third-1";
  const octavosSlots = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const homeSourceIndex = i * 2;
      const awaySourceIndex = i * 2 + 1;

      const homeMatch = roundOf32Slots[homeSourceIndex];
      const awayMatch = roundOf32Slots[awaySourceIndex];

      const homeWinner = getWinner(
        roundOf32Ids[homeSourceIndex],
        homeMatch.homeName,
        homeMatch.awayName,
      );

      const awayWinner = getWinner(
        roundOf32Ids[awaySourceIndex],
        awayMatch.homeName,
        awayMatch.awayName,
      );

      const homeCode =
        homeWinner === homeMatch.homeName
          ? homeMatch.homeCode
          : homeWinner === homeMatch.awayName
            ? homeMatch.awayCode
            : "";

      const awayCode =
        awayWinner === awayMatch.homeName
          ? awayMatch.homeCode
          : awayWinner === awayMatch.awayName
            ? awayMatch.awayCode
            : "";

      return {
        homeName: homeWinner || "POR DEFINIR",
        awayName: awayWinner || "POR DEFINIR",
        homeCode,
        awayCode,
      };
    });
  }, [roundOf32Slots, roundOf32Ids, knockoutScores]);
  const cuartosSlots = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const homeSourceIndex = i * 2;
      const awaySourceIndex = i * 2 + 1;

      const homeMatch = octavosSlots[homeSourceIndex];
      const awayMatch = octavosSlots[awaySourceIndex];

      const homeWinner = getWinner(
        octavosIds[homeSourceIndex],
        homeMatch.homeName,
        homeMatch.awayName,
      );

      const awayWinner = getWinner(
        octavosIds[awaySourceIndex],
        awayMatch.homeName,
        awayMatch.awayName,
      );

      const homeCode =
        homeWinner === homeMatch.homeName
          ? homeMatch.homeCode
          : homeWinner === homeMatch.awayName
            ? homeMatch.awayCode
            : "";

      const awayCode =
        awayWinner === awayMatch.homeName
          ? awayMatch.homeCode
          : awayWinner === awayMatch.awayName
            ? awayMatch.awayCode
            : "";

      return {
        homeName: homeWinner || "POR DEFINIR",
        awayName: awayWinner || "POR DEFINIR",
        homeCode,
        awayCode,
      };
    });
  }, [octavosSlots, octavosIds, knockoutScores]);
  const semisSlots = useMemo(() => {
    return Array.from({ length: 2 }, (_, i) => {
      const homeSourceIndex = i * 2;
      const awaySourceIndex = i * 2 + 1;

      const homeMatch = cuartosSlots[homeSourceIndex];
      const awayMatch = cuartosSlots[awaySourceIndex];

      const homeWinner = getWinner(
        cuartosIds[homeSourceIndex],
        homeMatch.homeName,
        homeMatch.awayName,
      );

      const awayWinner = getWinner(
        cuartosIds[awaySourceIndex],
        awayMatch.homeName,
        awayMatch.awayName,
      );

      const homeCode =
        homeWinner === homeMatch.homeName
          ? homeMatch.homeCode
          : homeWinner === homeMatch.awayName
            ? homeMatch.awayCode
            : "";

      const awayCode =
        awayWinner === awayMatch.homeName
          ? awayMatch.homeCode
          : awayWinner === awayMatch.awayName
            ? awayMatch.awayCode
            : "";

      return {
        homeName: homeWinner || "POR DEFINIR",
        awayName: awayWinner || "POR DEFINIR",
        homeCode,
        awayCode,
      };
    });
  }, [cuartosSlots, cuartosIds, knockoutScores]);
  const finalSlot = useMemo(() => {
    const semi1 = semisSlots[0];
    const semi2 = semisSlots[1];

    const winner1 = getWinner(semisIds[0], semi1.homeName, semi1.awayName);
    const winner2 = getWinner(semisIds[1], semi2.homeName, semi2.awayName);

    const homeCode =
      winner1 === semi1.homeName
        ? semi1.homeCode
        : winner1 === semi1.awayName
          ? semi1.awayCode
          : "";

    const awayCode =
      winner2 === semi2.homeName
        ? semi2.homeCode
        : winner2 === semi2.awayName
          ? semi2.awayCode
          : "";

    return {
      homeName: winner1 || "POR DEFINIR",
      awayName: winner2 || "POR DEFINIR",
      homeCode,
      awayCode,
    };
  }, [semisSlots, semisIds, knockoutScores]);
  const thirdPlaceSlot = useMemo(() => {
    const semi1 = semisSlots[0];
    const semi2 = semisSlots[1];

    const winner1 = getWinner(semisIds[0], semi1.homeName, semi1.awayName);
    const winner2 = getWinner(semisIds[1], semi2.homeName, semi2.awayName);

    const loser1 =
      winner1 === semi1.homeName
        ? { name: semi1.awayName, code: semi1.awayCode }
        : winner1 === semi1.awayName
          ? { name: semi1.homeName, code: semi1.homeCode }
          : { name: "POR DEFINIR", code: "" };

    const loser2 =
      winner2 === semi2.homeName
        ? { name: semi2.awayName, code: semi2.awayCode }
        : winner2 === semi2.awayName
          ? { name: semi2.homeName, code: semi2.homeCode }
          : { name: "POR DEFINIR", code: "" };

    return {
      homeName: loser1.name,
      awayName: loser2.name,
      homeCode: loser1.code,
      awayCode: loser2.code,
    };
  }, [semisSlots, semisIds, knockoutScores]);
  const champion = useMemo(() => {
    const winner = getWinner(finalId, finalSlot.homeName, finalSlot.awayName);

    if (!winner) {
      return {
        name: "POR DEFINIR",
        code: "",
      };
    }

    return winner === finalSlot.homeName
      ? {
          name: finalSlot.homeName,
          code: finalSlot.homeCode,
        }
      : {
          name: finalSlot.awayName,
          code: finalSlot.awayCode,
        };
  }, [finalId, finalSlot, knockoutScores]);
  const demoRoundOf32Slots = useMemo(() => {
    return buildProvisionalRoundOf32(demoQualifiedData);
  }, [demoQualifiedData]);

  function buildNextDemoSlots(
    sourceSlots: KnockoutSlot[],
    sourceIds: string[],
    length: number,
  ) {
    return Array.from({ length }, (_, i) => {
      const homeSourceIndex = i * 2;
      const awaySourceIndex = i * 2 + 1;

      const homeMatch = sourceSlots[homeSourceIndex];
      const awayMatch = sourceSlots[awaySourceIndex];

      const homeWinner = getWinnerFromScoreMap(
        DEMO_KNOCKOUT_SCORES,
        sourceIds[homeSourceIndex],
        homeMatch.homeName,
        homeMatch.awayName,
      );

      const awayWinner = getWinnerFromScoreMap(
        DEMO_KNOCKOUT_SCORES,
        sourceIds[awaySourceIndex],
        awayMatch.homeName,
        awayMatch.awayName,
      );

      const homeCode =
        homeWinner === homeMatch.homeName
          ? homeMatch.homeCode
          : homeWinner === homeMatch.awayName
            ? homeMatch.awayCode
            : "";

      const awayCode =
        awayWinner === awayMatch.homeName
          ? awayMatch.homeCode
          : awayWinner === awayMatch.awayName
            ? awayMatch.awayCode
            : "";

      return {
        homeName: homeWinner || "POR DEFINIR",
        awayName: awayWinner || "POR DEFINIR",
        homeCode,
        awayCode,
      };
    });
  }

  const demoOctavosSlots = useMemo(() => {
    return buildNextDemoSlots(demoRoundOf32Slots, roundOf32Ids, 8);
  }, [demoRoundOf32Slots, roundOf32Ids]);

  const demoCuartosSlots = useMemo(() => {
    return buildNextDemoSlots(demoOctavosSlots, octavosIds, 4);
  }, [demoOctavosSlots, octavosIds]);

  const demoSemisSlots = useMemo(() => {
    return buildNextDemoSlots(demoCuartosSlots, cuartosIds, 2);
  }, [demoCuartosSlots, cuartosIds]);

  const demoFinalSlot = useMemo(() => {
    const semi1 = demoSemisSlots[0];
    const semi2 = demoSemisSlots[1];

    const winner1 = getWinnerFromScoreMap(
      DEMO_KNOCKOUT_SCORES,
      semisIds[0],
      semi1.homeName,
      semi1.awayName,
    );
    const winner2 = getWinnerFromScoreMap(
      DEMO_KNOCKOUT_SCORES,
      semisIds[1],
      semi2.homeName,
      semi2.awayName,
    );

    return {
      homeName: winner1 || "POR DEFINIR",
      awayName: winner2 || "POR DEFINIR",
      homeCode:
        winner1 === semi1.homeName
          ? semi1.homeCode
          : winner1 === semi1.awayName
            ? semi1.awayCode
            : "",
      awayCode:
        winner2 === semi2.homeName
          ? semi2.homeCode
          : winner2 === semi2.awayName
            ? semi2.awayCode
            : "",
    };
  }, [demoSemisSlots, semisIds]);

  const demoThirdPlaceSlot = useMemo(() => {
    const semi1 = demoSemisSlots[0];
    const semi2 = demoSemisSlots[1];

    const winner1 = getWinnerFromScoreMap(
      DEMO_KNOCKOUT_SCORES,
      semisIds[0],
      semi1.homeName,
      semi1.awayName,
    );
    const winner2 = getWinnerFromScoreMap(
      DEMO_KNOCKOUT_SCORES,
      semisIds[1],
      semi2.homeName,
      semi2.awayName,
    );

    const loser1 =
      winner1 === semi1.homeName
        ? { name: semi1.awayName, code: semi1.awayCode }
        : winner1 === semi1.awayName
          ? { name: semi1.homeName, code: semi1.homeCode }
          : { name: "POR DEFINIR", code: "" };

    const loser2 =
      winner2 === semi2.homeName
        ? { name: semi2.awayName, code: semi2.awayCode }
        : winner2 === semi2.awayName
          ? { name: semi2.homeName, code: semi2.homeCode }
          : { name: "POR DEFINIR", code: "" };

    return {
      homeName: loser1.name,
      awayName: loser2.name,
      homeCode: loser1.code,
      awayCode: loser2.code,
    };
  }, [demoSemisSlots, semisIds]);

  const realRoundOf32Slots: KnockoutSlot[] = USE_DEMO_RESULTS_FOR_TESTING
    ? demoRoundOf32Slots
    : [];
  const realOctavosSlots: KnockoutSlot[] = USE_DEMO_RESULTS_FOR_TESTING
    ? demoOctavosSlots
    : [];
  const realCuartosSlots: KnockoutSlot[] = USE_DEMO_RESULTS_FOR_TESTING
    ? demoCuartosSlots
    : [];
  const realSemisSlots: KnockoutSlot[] = USE_DEMO_RESULTS_FOR_TESTING
    ? demoSemisSlots
    : [];
  const realFinalSlot: KnockoutSlot = USE_DEMO_RESULTS_FOR_TESTING
    ? demoFinalSlot
    : {
        homeName: "",
        awayName: "",
        homeCode: "",
        awayCode: "",
      };
  const realThirdPlaceSlot: KnockoutSlot = USE_DEMO_RESULTS_FOR_TESTING
    ? demoThirdPlaceSlot
    : {
        homeName: "",
        awayName: "",
        homeCode: "",
        awayCode: "",
      };
  const totalKnockoutPoints = useMemo(() => {
    let total = 0;

    total += sumKnockoutStagePoints(
      "ronda de 32",
      roundOf32Slots,
      realRoundOf32Slots,
      roundOf32Ids,
      knockoutScores,
      REAL_KNOCKOUT_SCORES,
    );

    total += sumKnockoutStagePoints(
      "octavos",
      octavosSlots,
      realOctavosSlots,
      octavosIds,
      knockoutScores,
      REAL_KNOCKOUT_SCORES,
    );

    total += sumKnockoutStagePoints(
      "cuartos",
      cuartosSlots,
      realCuartosSlots,
      cuartosIds,
      knockoutScores,
      REAL_KNOCKOUT_SCORES,
    );

    total += sumKnockoutStagePoints(
      "semifinales",
      semisSlots,
      realSemisSlots,
      semisIds,
      knockoutScores,
      REAL_KNOCKOUT_SCORES,
    );

    total += getKnockoutStagePoints(
      "final",
      knockoutScores[finalId] ?? { home: "", away: "", pensWinner: "none" },
      REAL_KNOCKOUT_SCORES[finalId] ?? {
        home: "",
        away: "",
        pensWinner: "none",
      },
      finalSlot.homeName,
      finalSlot.awayName,
      realFinalSlot.homeName,
      realFinalSlot.awayName,
    );

    total += getKnockoutStagePoints(
      "tercer lugar",
      knockoutScores[thirdPlaceId] ?? {
        home: "",
        away: "",
        pensWinner: "none",
      },
      REAL_KNOCKOUT_SCORES[thirdPlaceId] ?? {
        home: "",
        away: "",
        pensWinner: "none",
      },
      thirdPlaceSlot.homeName,
      thirdPlaceSlot.awayName,
      realThirdPlaceSlot.homeName,
      realThirdPlaceSlot.awayName,
    );

    return total;
  }, [
    roundOf32Slots,
    octavosSlots,
    cuartosSlots,
    semisSlots,
    finalSlot,
    thirdPlaceSlot,
    knockoutScores,
  ]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.view, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeRankingTab, activeRankingTab);
  }, [activeRankingTab]);
  useEffect(() => {
    if (view === "ranking") {
      cargarRanking();
    }
  }, [view]);
  const totalPoints =
    totalGroupStagePoints + totalRoundOf32QualifiedPoints + totalKnockoutPoints;
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.selectedGroupIndex,
      String(selectedGroupIndex),
    );
  }, [selectedGroupIndex]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.groupScores, JSON.stringify(groupScores));
  }, [groupScores]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.knockoutScores,
      JSON.stringify(knockoutScores),
    );
  }, [knockoutScores]);

  if (!isHydrated) return null;
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f6f7] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:h-[74px] lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-xl text-white lg:h-11 lg:w-11">
              ⚽
            </div>
            <div className="leading-none">
              <div className="text-lg font-black uppercase tracking-tight text-neutral-950 lg:text-xl">
                Mundial
              </div>
              <div className="text-lg font-black uppercase tracking-tight text-neutral-950 lg:text-xl">
                Picks
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-700">
                Predicciones
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-2 md:flex lg:gap-5">
            <button
              onClick={() => setView("groups")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 lg:text-base ${view === "groups" ? "bg-red-50 text-red-600" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"}`}
            >
              <span className="mr-2">▦</span>Grupos
            </button>
            <button
              onClick={() => setView("knockout")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 lg:text-base ${view === "knockout" ? "bg-red-50 text-red-600" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"}`}
            >
              <span className="mr-2">🏆</span>Fase Final
            </button>
            <a
              href="/ranking"
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-neutral-600 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-100 hover:text-neutral-950 lg:text-base"
            >
              <span className="mr-2">🏅</span>Ranking
            </a>
            <button
              onClick={() => setView("profile")}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 lg:text-base ${view === "profile" ? "bg-red-50 text-red-600" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"}`}
            >
              <span className="mr-2">♙</span>Mi Perfil
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={async () => {
                if (user) {
                  await cerrarSesion();
                  return;
                }

                window.location.href = "/?login=1";
              }}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-black text-white shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${user ? "border border-neutral-950 bg-neutral-950 hover:bg-neutral-800 hover:shadow-md" : "bg-red-600 hover:bg-red-700 hover:ring-4 hover:ring-red-200"}`}
            >
              {user ? "Cerrar sesión" : "Login"}
            </button>
            <button
              onClick={() => setView("profile")}
              className="flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-black text-neutral-950 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-md sm:px-3 lg:text-base active:translate-y-0"
            >
              <CountryFlag
                code={
                  user
                    ? getProfileCountry(
                        getStoredUserProfile(user.email).country,
                      ).code
                    : ""
                }
                className="h-5 w-8"
              />
              <span className="hidden sm:inline">
                {user
                  ? getPlayerPublicId(getStoredUserProfile(user.email))
                  : "Invitado"}
              </span>
              <span className="text-neutral-500">⌄</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 border-t border-neutral-100 bg-white md:hidden">
          <button
            onClick={() => setView("groups")}
            className={`cursor-pointer py-3 text-xs font-black uppercase ${view === "groups" ? "text-red-600" : "text-neutral-500"}`}
          >
            Grupos
          </button>
          <button
            onClick={() => setView("knockout")}
            className={`cursor-pointer py-3 text-xs font-black uppercase ${view === "knockout" ? "text-red-600" : "text-neutral-500"}`}
          >
            Finales
          </button>
          <a
            href="/ranking"
            className="cursor-pointer py-3 text-center text-xs font-black uppercase text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Ranking
          </a>
          <button
            onClick={() => setView("profile")}
            className={`cursor-pointer py-3 text-xs font-black uppercase ${view === "profile" ? "text-red-600" : "text-neutral-500"}`}
          >
            Perfil
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
        <div
          className={`mb-3 flex flex-col items-center gap-2 rounded-[22px] px-4 py-3 text-center text-xs leading-snug shadow-sm ring-1 sm:flex-row sm:justify-center sm:px-5 sm:text-sm lg:mb-4 ${
            isPredictionLocked
              ? "bg-neutral-950 text-white ring-black/10"
              : "bg-amber-50 text-amber-950 ring-amber-200"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-lg">
            🗓️
          </span>
          <p className="leading-6">
            {isPredictionLocked ? (
              <>
                <strong>Predicciones bloqueadas.</strong> Ya no se pueden
                editar.
              </>
            ) : (
              <>
                <strong>
                  Puedes editar tus predicciones hasta el 10 de junio a las
                  11:59 p.m.
                </strong>{" "}
                Después de esa hora ya no podrás modificarlas.
              </>
            )}
          </p>
        </div>

        {view !== "profile" ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/10">
              <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                puntos grupos
              </div>
              <div className="mt-1 text-2xl font-extrabold">
                {totalGroupStagePoints}
              </div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/10">
              <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                puntos por clasificados
              </div>
              <div className="mt-1 text-2xl font-extrabold">
                {totalRoundOf32QualifiedPoints}
              </div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/10">
              <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                puntos eliminatorias
              </div>
              <div className="mt-1 text-2xl font-extrabold">
                {totalKnockoutPoints}
              </div>
            </div>
            <div className="rounded-2xl bg-neutral-950 px-4 py-3 text-white shadow-sm ring-1 ring-black/10">
              <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-300">
                total
              </div>
              <div className="mt-1 text-3xl font-extrabold">{totalPoints}</div>
            </div>
          </div>
        ) : null}

        {view === "groups" ? (
          <div className="grid w-full gap-6 xl:grid-cols-[410px_minmax(560px,1fr)_270px] 2xl:grid-cols-[430px_minmax(720px,1fr)_300px]">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/10 xl:sticky xl:top-6 xl:self-start">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold uppercase tracking-wide">
                  grupos
                </h2>
                <span className="text-sm text-neutral-500">
                  selecciona un grupo
                </span>
              </div>

              <div className="mb-5 grid grid-cols-6 gap-2">
                {groups.map((group, index) => (
                  <button
                    key={group.name}
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`flex h-11 w-11 items-center justify-center justify-self-center rounded-full border text-base font-bold uppercase ${
                      selectedGroupIndex === index
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-neutral-300 bg-white text-neutral-800"
                    }`}
                  >
                    {group.name.replace("GRUPO ", "")}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="grid grid-cols-[2.4fr_repeat(6,0.65fr)] bg-red-600 px-4 py-3 text-xs font-bold uppercase text-white">
                  <div>{selectedGroup.name}</div>
                  <div className="text-center">j</div>
                  <div className="text-center">g</div>
                  <div className="text-center">e</div>
                  <div className="text-center">p</div>
                  <div className="text-center">dif</div>
                  <div className="text-center">pts</div>
                </div>

                {selectedStandings.map((team, index) => (
                  <div
                    key={team.name}
                    className="grid grid-cols-[2.4fr_repeat(6,0.65fr)] border-t border-neutral-200 px-4 py-3 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 font-medium uppercase">
                      <span>{index + 1}.</span>
                      <img
                        src={`https://flagcdn.com/w40/${team.code}.png`}
                        alt={team.name}
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                      <span>{team.name}</span>
                    </div>
                    <div className="text-center">{team.played}</div>
                    <div className="text-center">{team.won}</div>
                    <div className="text-center">{team.drawn}</div>
                    <div className="text-center">{team.lost}</div>
                    <div className="text-center">{team.goalDiff}</div>
                    <div className="text-center">{team.points}</div>
                  </div>
                ))}
                <div className="mt-6 rounded-2xl bg-neutral-50 p-4 shadow-sm ring-1 ring-black/10">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-900">
                        mejores terceros
                      </h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                        pasan los 8 mejores terceros
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-red-600 ring-1 ring-red-100">
                      {qualifiedData.bestThirds.length}/8
                    </div>
                  </div>

                  <div className="mb-3 rounded-xl bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-neutral-600 ring-1 ring-black/5">
                    grupos: {bestThirdGroups.join(", ") || "—"}
                    <br />
                    clave: {bestThirdGroupsKey || "—"}
                  </div>

                  <div className="grid gap-2">
                    {qualifiedData.bestThirds.map((team, index) => (
                      <div
                        key={`third-${team.group}-${team.name}-${index}`}
                        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-black text-neutral-600">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-500">
                          {team.group}
                        </span>
                        <img
                          src={`https://flagcdn.com/w40/${team.code}.png`}
                          alt={team.name}
                          className="h-4 w-6 rounded-sm object-cover"
                        />
                        <span className="min-w-0 flex-1 truncate font-semibold uppercase">
                          {team.name}
                        </span>
                        <span className="text-[11px] font-bold text-neutral-500">
                          {team.points} PTS | DIF {team.goalDiff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/10">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
                  partidos {selectedGroup.name}
                </h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={clearGroupStage}
                    disabled={isPredictionLocked}
                    className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-red-600 shadow-sm transition-all duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:opacity-60"
                  >
                    limpiar grupos
                  </button>
                  <button
                    onClick={guardarPrediccion}
                    disabled={isPredictionLocked || isSavingPicks}
                    className="cursor-pointer rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:scale-[1.05] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isPredictionLocked
                      ? "picks bloqueados"
                      : isSavingPicks
                        ? "guardando..."
                        : saveStatus === "saved"
                          ? "guardado ✅"
                          : "guardar picks"}
                  </button>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2 border-b border-neutral-200 pb-4 sm:grid-cols-4 xl:grid-cols-6">
                {groups.map((group, index) => (
                  <button
                    key={group.name}
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`rounded-lg px-3 py-2 text-xs font-extrabold uppercase tracking-wide ${
                      selectedGroupIndex === index
                        ? "bg-red-600 text-white"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                {groupMatchesByDate(selectedGroup.matches).map(
                  ([date, matches]) => (
                    <div key={date}>
                      <div className="mb-3 rounded-xl bg-neutral-900 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
                        {date}
                      </div>

                      <div className="grid gap-3 min-[1800px]:grid-cols-2">
                        {matches.map((match) => (
                          <div
                            key={match.id}
                            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 shadow-sm transition hover:border-red-200 hover:bg-white"
                          >
                            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-[11px] font-extrabold uppercase tracking-tight sm:text-xs 2xl:text-[13px]">
                              <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                                {getTeamData(match.home) && (
                                  <img
                                    src={`https://flagcdn.com/w40/${getTeamData(match.home)?.code}.png`}
                                    alt={match.home}
                                    className="h-4 w-6 shrink-0 rounded-sm object-cover"
                                  />
                                )}
                                <span className="min-w-0 truncate">
                                  {match.home}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  disabled={isPredictionLocked}
                                  value={groupScores[match.id]?.home ?? ""}
                                  onChange={(e) =>
                                    updateGroupScore(
                                      match.id,
                                      "home",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 w-10 rounded-lg border border-neutral-300 bg-white text-center text-sm font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  min="0"
                                  disabled={isPredictionLocked}
                                  value={groupScores[match.id]?.away ?? ""}
                                  onChange={(e) =>
                                    updateGroupScore(
                                      match.id,
                                      "away",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 w-10 rounded-lg border border-neutral-300 bg-white text-center text-sm font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                                />
                              </div>

                              <div className="flex min-w-0 items-center gap-2 text-left">
                                {getTeamData(match.away) && (
                                  <img
                                    src={`https://flagcdn.com/w40/${getTeamData(match.away)?.code}.png`}
                                    alt={match.away}
                                    className="h-4 w-6 shrink-0 rounded-sm object-cover"
                                  />
                                )}
                                <span className="min-w-0 truncate">
                                  {match.away}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 rounded-xl bg-white px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-neutral-500">
                              {match.venue}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg ring-1 ring-red-100">
                    📝
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-neutral-950">
                      Cómo llenar tus grupos
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      Escribe el marcador de cada partido. Con tus resultados se
                      irá formando tu tabla de clasificados.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                    <p className="text-xs font-black uppercase tracking-wide text-red-600">
                      Paso 1
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      Captura tus marcadores grupo por grupo.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                    <p className="text-xs font-black uppercase tracking-wide text-red-600">
                      Paso 2
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      Revisa qué equipos van quedando como clasificados.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
                    <p className="text-xs font-black uppercase tracking-wide text-red-600">
                      Paso 3
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      Después continúa con la fase final.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/10 xl:sticky xl:top-6 xl:self-start">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-neutral-900">
                    clasificados
                  </h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    1° y 2° de cada grupo
                  </p>
                </div>
                <div className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                  24
                </div>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                {qualifiedData.topTwo.map((team, index) => (
                  <div
                    key={`${team.group}-${team.name}-${index}`}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-[10.5px] shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:border-red-200 hover:bg-white"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-neutral-700 ring-1 ring-black/10">
                      {team.position}°
                    </span>
                    <span className="w-4 shrink-0 text-[10px] font-bold text-neutral-500">
                      {team.group}
                    </span>
                    <img
                      src={`https://flagcdn.com/w40/${team.code}.png`}
                      alt={team.name}
                      className="h-4 w-6 rounded-sm object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate font-extrabold uppercase tracking-tight">
                      {team.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-sm font-black uppercase text-neutral-950">
                      Ranking global y ligas privadas
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-5 text-neutral-600">
                      Acceso solo para usuarios inscritos. El ranking global se
                      activa cuando inicia el Mundial. También podrás crear
                      ligas privadas y competir con tus amigos.
                    </p>
                  </div>
                  <a
                    href="/ranking"
                    className="inline-flex w-fit cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0 active:scale-[0.98]"
                  >
                    Ir al ranking
                  </a>
                </div>
              </div>
            </aside>
          </div>
        ) : view === "knockout" ? (
          <div className="overflow-x-auto rounded-2xl bg-[#1f1f1f] p-5 text-white shadow-sm">
            <div className="min-w-[1480px] pb-12">
              <div className="relative mb-4 flex items-center justify-end pr-16">
                <h2 className="absolute left-1/2 -translate-x-1/2 text-3xl font-extrabold uppercase">
                  eliminatorias
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearKnockoutStage}
                    disabled={isPredictionLocked}
                    className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    limpiar bracket
                  </button>
                  <button
                    onClick={guardarPrediccion}
                    disabled={isPredictionLocked || isSavingPicks}
                    className="cursor-pointer rounded-xl bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:scale-[1.05] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isPredictionLocked
                      ? "bracket bloqueado"
                      : isSavingPicks
                        ? "guardando..."
                        : saveStatus === "saved"
                          ? "guardado ✅"
                          : "guardar bracket"}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <BracketStage
                  title="ronda de 32"
                  matches={roundOf32Slots}
                  topOffset={-50}
                  matchIds={roundOf32Ids}
                  scores={knockoutScores}
                  onScoreChange={updateKnockoutScore}
                  onPensWinnerChange={setPenaltyWinner}
                  disabled={isPredictionLocked}
                />

                <BracketStage
                  title="octavos"
                  matches={octavosSlots}
                  topOffset={92}
                  matchIds={octavosIds}
                  scores={knockoutScores}
                  onScoreChange={updateKnockoutScore}
                  onPensWinnerChange={setPenaltyWinner}
                  disabled={isPredictionLocked}
                />
                <BracketStage
                  title="cuartos"
                  matches={cuartosSlots}
                  topOffset={245}
                  matchIds={cuartosIds}
                  scores={knockoutScores}
                  onScoreChange={updateKnockoutScore}
                  onPensWinnerChange={setPenaltyWinner}
                  disabled={isPredictionLocked}
                />

                <div className="pt-[350px]">
                  <BracketStage
                    title="semifinales"
                    matches={semisSlots}
                    topOffset={0}
                    matchIds={semisIds}
                    scores={knockoutScores}
                    onScoreChange={updateKnockoutScore}
                    onPensWinnerChange={setPenaltyWinner}
                    disabled={isPredictionLocked}
                  />

                  <div className="mt-5 flex justify-center">
                    <div className="h-14 w-px bg-white/30" />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-red-400">
                      tercer lugar
                    </div>
                    <KnockoutMatch
                      matchId={thirdPlaceId}
                      homeName={thirdPlaceSlot.homeName}
                      awayName={thirdPlaceSlot.awayName}
                      homeCode={thirdPlaceSlot.homeCode}
                      awayCode={thirdPlaceSlot.awayCode}
                      score={
                        knockoutScores[thirdPlaceId] ?? {
                          home: "",
                          away: "",
                          pensWinner: "none",
                        }
                      }
                      onScoreChange={updateKnockoutScore}
                      onPensWinnerChange={setPenaltyWinner}
                      disabled={isPredictionLocked}
                    />
                  </div>
                </div>

                <div className="pt-[375px]">
                  <div className="mb-2 text-center text-sm font-bold uppercase text-red-400">
                    final
                  </div>

                  <KnockoutMatch
                    matchId={finalId}
                    homeName={finalSlot.homeName}
                    awayName={finalSlot.awayName}
                    homeCode={finalSlot.homeCode}
                    awayCode={finalSlot.awayCode}
                    score={
                      knockoutScores[finalId] ?? {
                        home: "",
                        away: "",
                        pensWinner: "none",
                      }
                    }
                    onScoreChange={updateKnockoutScore}
                    onPensWinnerChange={setPenaltyWinner}
                    disabled={isPredictionLocked}
                  />

                  <div className="mb-1 text-[11px] uppercase text-neutral-300">
                    campeón
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xl font-bold">
                    {champion.code ? (
                      <img
                        src={`https://flagcdn.com/w40/${champion.code}.png`}
                        alt={champion.name}
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                    ) : null}
                    <span>{champion.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProfileSection
            currentUserPoints={totalPoints}
            groupPoints={totalGroupStagePoints}
            qualifiedPoints={totalRoundOf32QualifiedPoints}
            knockoutPoints={totalKnockoutPoints}
            isPredictionLocked={isPredictionLocked}
            onGoToPredictions={() => setView("groups")}
            onGoToRanking={() => {
              window.location.href = "/ranking";
            }}
            onSignOut={cerrarSesion}
            user={user}
          />
        )}
      </main>
    </div>
  );
}

function ProfileSection({
  currentUserPoints,
  groupPoints,
  qualifiedPoints,
  knockoutPoints,
  isPredictionLocked,
  onGoToPredictions,
  onGoToRanking,
  onSignOut,
  user,
}: {
  currentUserPoints: number;
  groupPoints: number;
  qualifiedPoints: number;
  knockoutPoints: number;
  isPredictionLocked: boolean;
  onGoToPredictions: () => void;
  onGoToRanking: () => void;
  onSignOut: () => void;
  user: any;
}) {
  const [userProfile, setUserProfile] =
    useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const loadedProfile = getStoredUserProfile(user?.email);

      if (!user?.email) {
        setUserProfile(DEFAULT_USER_PROFILE);
        setIsEditing(false);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const metadataCountry = getProfileCountry(metadata.country);
      let nextProfile: UserProfile = {
        username: user?.email ?? "",
        country: loadedProfile.country || metadataCountry.country || "",
        flag: loadedProfile.flag || metadataCountry.flag || "",
        public_id: loadedProfile.public_id || "#------",
      };

      const { data } = await supabase
        .from("users")
        .select("public_id, country")
        .eq("email", user.email)
        .maybeSingle();

      if (data) {
        const dbCountry = getProfileCountry(data.country);
        nextProfile = {
          ...nextProfile,
          country: nextProfile.country || dbCountry.country,
          flag: nextProfile.flag || dbCountry.flag,
          public_id: data.public_id ?? nextProfile.public_id,
        };
      }

      setUserProfile(nextProfile);
      setIsEditing(!isProfileComplete(nextProfile));
    }

    loadProfile();
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    localStorage.setItem(
      getProfileStorageKey(user.email),
      JSON.stringify(userProfile),
    );
  }, [userProfile, user?.email]);

  const selectedCountry = COUNTRY_OPTIONS.find(
    (option) => option.country === userProfile.country,
  );
  const profileDisplayCountry = getProfileCountry(
    userProfile.country || userProfile.flag,
  );
  const profileFlag = profileDisplayCountry.flag;
  const profileFlagCode = profileDisplayCountry.code;
  const profileCountryName = profileDisplayCountry.country;
  const predictionStatus = isPredictionLocked ? "Bloqueada" : "Editable";
  const predictionStatusDescription = isPredictionLocked
    ? "Tus predicciones ya quedaron cerradas para competir en rankings."
    : "Aún puedes ajustar tus marcadores y bracket antes del cierre.";

  function updateUsername(value: string) {
    setUserProfile((prev) => ({
      ...prev,
      username: sanitizeProfileUsername(value),
    }));
  }

  function updateCountry(country: string) {
    const option = COUNTRY_OPTIONS.find((item) => item.country === country);
    if (!option) {
      setUserProfile((prev) => ({ ...prev, country: "", flag: "" }));
      return;
    }
    setUserProfile((prev) => ({
      ...prev,
      country: option.country,
      flag: option.flag,
    }));
  }

  async function saveProfile() {
    if (!user?.email) {
      alert("Primero inicia sesión para guardar tu perfil.");
      window.location.href = "/?login=1";
      return;
    }

    const countryData = getProfileCountry(userProfile.country);

    if (!countryData.country) {
      setProfileMessage("Elige tu país/bandera antes de guardar.");
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage("");

    try {
      let publicIdToUse = userProfile.public_id && userProfile.public_id !== "#------"
        ? userProfile.public_id
        : generatePublicId();

      const { data: existingUser } = await supabase
        .from("users")
        .select("public_id")
        .eq("email", user.email)
        .maybeSingle();

      if (existingUser?.public_id) {
        publicIdToUse = existingUser.public_id;
      }

      const nextProfile = {
        username: user.email,
        country: countryData.country,
        flag: countryData.flag,
        public_id: publicIdToUse,
      };

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          country: countryData.code.toUpperCase(),
          country_name: countryData.country,
        },
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from("users").upsert(
        [
          {
            username: user.email,
            email: user.email,
            public_id: publicIdToUse,
            country: countryData.code.toUpperCase(),
            points: currentUserPoints,
          },
        ],
        { onConflict: "username" },
      );

      if (dbError) throw dbError;

      localStorage.setItem(getProfileStorageKey(user.email), JSON.stringify(nextProfile));
      setUserProfile(nextProfile);
      setIsEditing(false);
      setProfileMessage("Perfil guardado correctamente.");
    } catch (error) {
      console.log(error);
      setProfileMessage("No se pudo guardar el perfil. Revisa Supabase e inténtalo de nuevo.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-black/10">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-neutral-950 p-6 text-white sm:p-8 lg:p-10">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
            Mi perfil
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-white/95 p-2 shadow-sm ring-1 ring-white/20 sm:h-24 sm:w-24">
              <CountryFlag
                code={profileFlagCode}
                className="h-full w-full rounded-[22px]"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-black tracking-tight sm:text-5xl">
                {getPlayerPublicId(userProfile)}
              </h1>
              <div className="mt-1 text-sm font-bold text-neutral-400">
                ID de jugador
              </div>
              <p className="mt-2 text-sm font-semibold text-neutral-300 sm:text-base">
                {profileCountryName
                  ? `${profileCountryName} · Mundial 2026`
                  : "Elige tu país para aparecer en el ranking"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-400">
                Puntos
              </div>
              <div className="mt-1 text-4xl font-black">
                {currentUserPoints}
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-400">
                Estado
              </div>
              <div
                className={`mt-2 w-fit rounded-full px-3 py-1 text-sm font-black ${isPredictionLocked ? "bg-red-600 text-white" : "bg-emerald-400 text-neutral-950"}`}
              >
                {predictionStatus}
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm font-medium leading-6 text-neutral-300">
            {predictionStatusDescription}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onGoToPredictions}
              className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-red-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              Ir a predicciones
            </button>
            <button
              type="button"
              onClick={onGoToRanking}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-neutral-950 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-100 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
            >
              Ver ranking
            </button>
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-2xl border border-white/20 bg-[#242424] px-5 py-3 text-sm font-black text-white shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:bg-[#303030] hover:border-white/35 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              >
                Cerrar sesión
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-950 sm:text-3xl">
                Configuración
              </h2>
              <p className="mt-1 text-sm font-medium text-neutral-600">
                Así aparecerás en rankings públicos y privados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  saveProfile();
                  return;
                }

                if (!user?.email) {
                  window.location.href = "/?login=1";
                  return;
                }

                setIsEditing(true);
              }}
              disabled={isSavingProfile}
              className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? "Guardando..." : isEditing ? "Guardar perfil" : "Editar perfil"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-neutral-50 p-4 ring-1 ring-black/10">
              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                ID de jugador
              </div>
              <div className="mt-2 text-xl font-black text-neutral-950">
                {getPlayerPublicId(userProfile)}
              </div>
              <p className="mt-1 text-xs font-semibold text-neutral-500">
                Este ID se asigna automáticamente y no se puede editar.
              </p>
            </div>

            <div className="rounded-3xl bg-neutral-50 p-4 ring-1 ring-black/10">
              <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                País / bandera
              </div>
              {isEditing ? (
                <select
                  value={selectedCountry?.country ?? ""}
                  onChange={(event) => updateCountry(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-base font-black outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  <option value="">Selecciona tu país</option>
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option.country} value={option.country}>
                      {option.flag} {option.country}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-2 flex items-center gap-3 text-xl font-black text-neutral-950">
                  <CountryFlag code={profileFlagCode} className="h-8 w-12" />
                  <span>{profileCountryName || "Pendiente"}</span>
                </div>
              )}
            </div>
          </div>

          {profileMessage ? (
            <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-black ${profileMessage.includes("correctamente") ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"}`}>
              {profileMessage}
            </div>
          ) : null}

          <div className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-black/10">
            <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
              Vista pública
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-neutral-950 px-4 py-3 text-base font-black text-white">
              <CountryFlag
                code={profileFlagCode}
                className="h-6 w-10 shrink-0"
              />
              <span className="truncate">
                {getPlayerPublicId(userProfile)} · {currentUserPoints} pts
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ProfileScoreCard label="Grupos" value={groupPoints} />
            <ProfileScoreCard label="Clasificados" value={qualifiedPoints} />
            <ProfileScoreCard label="Eliminatorias" value={knockoutPoints} />
          </div>

          <div className="mt-6 rounded-3xl bg-neutral-50 p-4 ring-1 ring-black/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-black uppercase tracking-tight text-neutral-950">
                  Tus ligas privadas
                </div>
                <div className="mt-1 text-sm font-medium text-neutral-600">
                  Gestiona tus ligas privadas desde la sección de ranking.
                </div>
              </div>
              <a
                href="/ranking#ligas-privadas"
                className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-red-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
              >
                Ver mis ligas privadas
              </a>
            </div>

            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-600 ring-1 ring-black/10">
              Para crear una liga, unirte con código o ver rankings privados,
              entra al apartado de Ranking.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-black/10">
      <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black text-neutral-950">{value}</div>
    </div>
  );
}

function RankingSection({
  activeTab,
  onTabChange,
  isVisible,
  countdown,
  currentUserPoints,
  rankingRowsFromSupabase,
  myRank,
  onViewUserPrediction,
}: {
  activeTab: RankingTab;
  onTabChange: (tab: RankingTab) => void;
  isVisible: boolean;
  countdown: CountdownParts;
  currentUserPoints: number;
  rankingRowsFromSupabase: any[];
  myRank: number | null;
  onViewUserPrediction: (username: string) => void;
}) {
  const [userProfile, setUserProfile] =
    useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [searchPublicId, setSearchPublicId] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.userProfile);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const profileCountry = getProfileCountry(
          parsed?.country ?? parsed?.flag,
        );
        setUserProfile({
          username: sanitizeProfileUsername(parsed?.username ?? ""),
          country: parsed?.country ? profileCountry.country : "",
          flag: parsed?.country ? profileCountry.flag : "",
          public_id: parsed?.public_id ?? "#------",
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(userProfile));
  }, [userProfile]);

  const rankingRows = rankingRowsFromSupabase.map((row, index) => ({
    position: index + 1,
    username: row.username || "usuario",
    public_id: row.public_id ?? null,
    country: row.country ?? "MX",
    points: row.points ?? 0,
  }));
  const selectedCountry = COUNTRY_OPTIONS.find(
    (option) => option.country === userProfile.country,
  );

  function updateUsername(value: string) {
    setUserProfile((prev) => ({
      ...prev,
      username: sanitizeProfileUsername(value),
    }));
  }

  function updateCountry(country: string) {
    const option = COUNTRY_OPTIONS.find((item) => item.country === country);
    if (!option) return;
    setUserProfile((prev) => ({
      ...prev,
      country: option.country,
      flag: option.flag,
    }));
  }

  function goToPrivateLeagues() {
    window.location.href = "/ranking#ligas-privadas";
  }
  async function buscarUsuarioPorId() {
    const cleanId = searchPublicId.trim();

    if (!cleanId) {
      alert("Escribe un ID de jugador, ejemplo: #123456");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("public_id", cleanId)
      .single();

    if (error || !data) {
      alert("No encontramos ningún jugador con ese ID");
      return;
    }

    onViewUserPrediction(data.username);
  }
  return (
    <section className="overflow-hidden rounded-[28px] bg-white px-4 py-5 shadow-sm ring-1 ring-black/10 sm:px-6 lg:px-6 lg:py-5">
      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="min-w-0">
          <h1 className="text-[30px] font-black uppercase leading-[0.95] tracking-tight text-neutral-950 sm:text-4xl lg:text-[38px]">
            Rankings del Mundial 2026
          </h1>
          <div className="mt-3 h-1.5 w-11 rounded-full bg-red-600" />
          <p className="mt-4 max-w-2xl text-[15px] font-medium leading-7 text-neutral-700 sm:text-base">
            Los rankings se actualizan conforme avanza el torneo.
            <br className="hidden sm:block" />
            Aún no inicia el Mundial. Consulta el contador para el primer
            partido.
          </p>

          <div className="mt-5 rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-black/10 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600 text-2xl text-white">
                  ♙
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black uppercase tracking-wide text-neutral-950">
                    Mi perfil
                  </div>
                  <div className="mt-3 grid gap-4 text-sm sm:grid-cols-[210px_160px] sm:gap-10">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                        Usuario
                      </div>
                      <div className="mt-1 text-base font-black text-neutral-950">
                        {getPlayerPublicId(userProfile)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                        País
                      </div>
                      <div className="mt-1 text-base font-black text-neutral-950">
                        {userProfile.flag && userProfile.country
                          ? `${userProfile.flag} ${userProfile.country}`
                          : "Pendiente"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-red-600 shadow-sm ring-1 ring-black/10 transition hover:bg-red-50"
              >
                ♙ {isEditingProfile ? "Guardar perfil" : "Editar perfil"}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                    ID de jugador
                  </span>
                  <div className="mt-1 flex h-11 w-full items-center rounded-2xl border border-neutral-200 bg-neutral-100 px-3 text-sm font-extrabold text-neutral-600">
                    {getPlayerPublicId(userProfile)}
                  </div>
                </label>
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
                    país
                  </span>
                  <select
                    value={selectedCountry?.country ?? ""}
                    onChange={(event) => updateCountry(event.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-extrabold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Selecciona tu país</option>
                    {COUNTRY_OPTIONS.map((option) => (
                      <option key={option.country} value={option.country}>
                        {option.flag} {option.country}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            <div className="mt-4 text-sm font-medium text-neutral-700">
              Así te verán en los rankings:{" "}
              <span className="font-black text-neutral-950">
                {getPlayerPublicId(userProfile)} {userProfile.flag}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-neutral-950 p-5 text-white shadow-sm ring-1 ring-black/10 lg:p-5">
          <div className="text-xs font-black uppercase tracking-wide text-neutral-400">
            Primer partido
          </div>
          <div className="mt-1 text-xl font-black sm:text-2xl">
            México vs Sudáfrica
          </div>
          <div className="mt-2 text-sm font-semibold text-neutral-300">
            11 de junio de 2026 · 1:00 p.m. (CDMX)
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DarkCountdownBox label="días" value={countdown.days} />
            <DarkCountdownBox label="horas" value={countdown.hours} />
            <DarkCountdownBox label="minutos" value={countdown.minutes} />
            <DarkCountdownBox label="segundos" value={countdown.seconds} />
          </div>
          <div className="mx-auto mt-4 w-fit rounded-2xl bg-white/10 px-4 py-2 text-center text-sm font-semibold text-neutral-200 ring-1 ring-white/10">
            El ranking se habilitará una vez finalice el primer partido.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => onTabChange("world")}
          className={`group flex min-h-[86px] items-center justify-between rounded-[22px] p-5 text-left shadow-sm ring-1 transition ${activeTab === "world" ? "bg-red-700 text-white ring-red-700" : "bg-white text-neutral-950 ring-black/10 hover:bg-neutral-50"}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl ${activeTab === "world" ? "bg-white/15 text-white" : "bg-red-50 text-red-600"}`}
            >
              ◎
            </div>
            <div>
              <div className="text-lg font-black uppercase sm:text-xl">
                Ranking mundial
              </div>
              <div
                className={`mt-1 text-sm font-semibold ${activeTab === "world" ? "text-red-100" : "text-neutral-600"}`}
              >
                Compite contra usuarios de todo el mundo.
              </div>
            </div>
          </div>
          <div className="text-3xl font-light">→</div>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("private")}
          className={`group flex min-h-[86px] items-center justify-between rounded-[22px] p-5 text-left shadow-sm ring-1 transition ${activeTab === "private" ? "bg-red-700 text-white ring-red-700" : "bg-white text-neutral-950 ring-black/10 hover:bg-neutral-50"}`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl ${activeTab === "private" ? "bg-white/15 text-white" : "bg-red-50 text-red-600"}`}
            >
              ♚
            </div>
            <div>
              <div className="text-lg font-black uppercase sm:text-xl">
                Ranking privado
              </div>
              <div
                className={`mt-1 text-sm font-semibold ${activeTab === "private" ? "text-red-100" : "text-neutral-600"}`}
              >
                Crea o únete a ligas privadas con tus amigos.
              </div>
            </div>
          </div>
          <div className="text-3xl font-light text-red-600">→</div>
        </button>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          {!isVisible ? (
            <div className="flex min-h-[150px] items-center justify-between gap-4 rounded-[22px] bg-neutral-50 p-5 shadow-sm ring-1 ring-black/10 sm:min-h-[160px] sm:p-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-2xl text-red-600 ring-1 ring-yellow-100 sm:h-16 sm:w-16">
                  ♙
                </div>
                <div>
                  <div className="text-xl font-black text-neutral-950 sm:text-2xl">
                    Ranking aún no disponible
                  </div>
                  <p className="mt-2 max-w-md text-sm font-medium leading-6 text-neutral-700">
                    El ranking se desbloqueará al finalizar el partido inaugural
                    del Mundial 2026.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-700">
                    ¡Prepara tus mejores predicciones!
                  </p>
                </div>
              </div>
              <div className="hidden text-6xl text-red-600 md:block">🏆</div>
            </div>
          ) : (
            <>
              {myRank && (
                <div className="mb-4 rounded-2xl bg-neutral-900 px-4 py-3 text-white">
                  <div className="text-xs font-bold uppercase text-neutral-400">
                    tu posición global
                  </div>
                  <div className="text-2xl font-extrabold">#{myRank}</div>
                </div>
              )}
              <div className="mb-4 flex gap-2">
                <input
                  value={searchPublicId}
                  onChange={(e) => setSearchPublicId(e.target.value)}
                  placeholder="Buscar jugador por ID (#123456)"
                  className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold outline-none focus:border-red-500"
                />
                <button
                  onClick={buscarUsuarioPorId}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
                >
                  Ver
                </button>
              </div>
              <div className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-sm">
                <div className="grid grid-cols-[56px_minmax(0,1fr)_82px_82px] bg-neutral-950 px-3 py-3 text-[10px] font-black uppercase tracking-wide text-white sm:grid-cols-[70px_minmax(0,1fr)_120px_110px] sm:px-4 sm:text-xs">
                  <div>pos</div>
                  <div>usuario</div>
                  <div className="text-center">país</div>
                  <div className="text-right">puntos</div>
                </div>
                {rankingRows.map((row) => (
                  <button
                    type="button"
                    key={`${activeTab}-${row.position}-${row.username}`}
                    onClick={() => onViewUserPrediction(row.username)}
                    className="w-full text-left grid grid-cols-[56px_minmax(0,1fr)_82px_82px] items-center border-t border-neutral-200 px-3 py-3 text-xs transition hover:bg-red-50 sm:grid-cols-[70px_minmax(0,1fr)_120px_110px] sm:px-4 sm:text-sm"
                  >
                    <div className="font-black text-neutral-500">
                      #{row.position}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-extrabold tracking-wide text-neutral-900">
                        {row.public_id ?? "#------"}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-400">
                        ID de jugador
                      </div>
                    </div>
                    <div className="truncate text-center text-[10px] font-bold uppercase text-neutral-500 sm:text-xs">
                      {row.country}
                    </div>
                    <div className="text-right text-base font-black text-red-600 sm:text-lg">
                      {row.points}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="mb-3">
            <div className="text-base font-black uppercase tracking-wide text-neutral-950">
              Tus ligas privadas
            </div>
            <div className="mt-1 text-sm font-medium text-neutral-600">
              Las ligas privadas se administran desde la página de ranking.
            </div>
          </div>

          <button
            type="button"
            onClick={goToPrivateLeagues}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:bg-red-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] sm:w-auto"
          >
            Ver mis ligas privadas
          </button>

          <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600 ring-1 ring-black/10">
            Desde ahí puedes crear ligas, unirte con código y ver rankings
            privados sin duplicar información en tu perfil.
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm font-medium text-neutral-500">
        Los rankings se actualizan en tiempo real conforme avanza el torneo.
      </div>
    </section>
  );
}

function DarkCountdownBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10 sm:px-4">
      <div className="text-3xl font-black tabular-nums text-white sm:text-4xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-neutral-300 sm:text-[11px]">
        {label}
      </div>
    </div>
  );
}

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdownParts(now: Date, target: Date): CountdownParts {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function CountdownBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-5 shadow-sm ring-1 ring-black/10">
      <div className="text-4xl font-black tabular-nums text-neutral-950">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs font-black uppercase tracking-wide text-neutral-500">
        {label}
      </div>
    </div>
  );
}

function getDemoRankingRows(
  tab: RankingTab,
  userProfile: UserProfile,
  privateLeagues: PrivateLeague[],
  currentUserPoints: number,
) {
  const countries = [
    "🇲🇽 MEX",
    "🇦🇷 ARG",
    "🇨🇴 COL",
    "🇺🇸 USA",
    "🇪🇸 ESP",
    "🇧🇷 BRA",
    "🇨🇦 CAN",
  ];
  const prefix = tab === "world" ? "world" : "liga";
  const baseRows = Array.from({ length: 99 }, (_, index) => ({
    position: index + 2,
    username: `${prefix}_${String(index + 2).padStart(3, "0")}`,
    country: countries[index % countries.length],
    points: Math.max(0, 126 - index),
  }));

  const userRow = {
    position: 1,
    username: getPlayerPublicId(userProfile),
    public_id: getPlayerPublicId(userProfile),
    country: `${userProfile.flag} ${userProfile.country.slice(0, 3).toUpperCase()}`,
    points: currentUserPoints,
  };

  if (tab === "private" && privateLeagues.length === 0) {
    return [userRow];
  }

  return [userRow, ...baseRows].map((row, index) => ({
    ...row,
    position: index + 1,
  }));
}

function createEmptyGroupScores() {
  const initial: Record<string, { home: string; away: string }> = {};

  groups.forEach((group) => {
    group.matches.forEach((match) => {
      initial[match.id] = { home: "", away: "" };
    });
  });

  return initial;
}

function buildDemoGroupScores() {
  const demo: Record<string, { home: string; away: string }> = {};
  const groupsWithQualifiedThird = new Set([
    "GRUPO C",
    "GRUPO D",
    "GRUPO E",
    "GRUPO F",
    "GRUPO G",
    "GRUPO H",
    "GRUPO I",
    "GRUPO J",
  ]);

  groups.forEach((group) => {
    const ranking = group.teams.map((team) => team.name);
    const thirdShouldQualify = groupsWithQualifiedThird.has(group.name);

    group.matches.forEach((match) => {
      const homeRank = ranking.indexOf(match.home);
      const awayRank = ranking.indexOf(match.away);

      if (homeRank === -1 || awayRank === -1) {
        demo[match.id] = { home: "", away: "" };
        return;
      }

      // En esta demo exacta, los terceros clasificados son C, D, E, F, G, H, I y J.
      // Para A, B, K y L, el partido entre el 3.º y 4.º queda empatado para que su tercero no pase.
      if (
        !thirdShouldQualify &&
        Math.min(homeRank, awayRank) === 2 &&
        Math.max(homeRank, awayRank) === 3
      ) {
        demo[match.id] = { home: "0", away: "0" };
        return;
      }

      if (homeRank < awayRank) {
        demo[match.id] = { home: homeRank === 0 ? "2" : "1", away: "0" };
      } else {
        demo[match.id] = { home: "0", away: awayRank === 0 ? "2" : "1" };
      }
    });
  });

  return demo;
}

function groupMatchesByDate(matches: Match[] = []) {
  const grouped = matches.reduce(
    (acc, match) => {
      if (!acc[match.date]) {
        acc[match.date] = [];
      }

      acc[match.date].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  return Object.entries(grouped);
}
function chunkMatches<T>(array: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

function BracketStage({
  title,
  matches,
  topOffset,
  matchIds,
  scores,
  onScoreChange,
  onPensWinnerChange,
  disabled = false,
}: {
  title: string;
  matches: KnockoutSlot[];
  topOffset: number;
  matchIds: string[];
  scores: KnockoutScoreMap;
  onScoreChange: (
    matchId: string,
    side: "home" | "away",
    value: string,
  ) => void;
  onPensWinnerChange: (matchId: string, winner: "home" | "away") => void;
  disabled?: boolean;
}) {
  const groupedMatches = chunkMatches(matches, 2);

  const pairGap =
    title === "ronda de 32"
      ? 8
      : title === "octavos"
        ? 18
        : title === "cuartos"
          ? 30
          : 0;

  const connectorHeight =
    title === "ronda de 32"
      ? 68
      : title === "octavos"
        ? 88
        : title === "cuartos"
          ? 112
          : 0;

  return (
    <div style={{ marginTop: `${topOffset}px` }}>
      <div className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-red-400">
        {title}
      </div>

      <div className={title === "ronda de 32" ? "space-y-1" : "space-y-0"}>
        {groupedMatches.map((pair, pairIndex) => (
          <div
            key={`${title}-pair-${pairIndex}`}
            className="flex items-center gap-2"
            style={{
              marginBottom: `${pairGap}px`,
              marginTop: pairIndex === 0 ? "0px" : "0px",
            }}
          >
            <div className="space-y-2">
              {pair.map((match, matchIndex) => {
                const currentMatchId = matchIds[pairIndex * 2 + matchIndex];

                return (
                  <KnockoutMatch
                    key={`${title}-${pairIndex}-${matchIndex}`}
                    matchId={currentMatchId}
                    compact={title === "ronda de 32"}
                    homeName={match.homeName}
                    awayName={match.awayName}
                    homeCode={match.homeCode}
                    awayCode={match.awayCode}
                    score={
                      scores[currentMatchId] ?? {
                        home: "",
                        away: "",
                        pensWinner: "none",
                      }
                    }
                    onScoreChange={onScoreChange}
                    onPensWinnerChange={onPensWinnerChange}
                    disabled={disabled}
                  />
                );
              })}
            </div>

            {title !== "semifinales" && (
              <div
                className="relative w-[18px]"
                style={{ height: `${connectorHeight}px` }}
              >
                <div className="absolute left-0 top-[24px] h-px w-[9px] bg-white/30" />
                <div className="absolute left-0 bottom-[24px] h-px w-[9px] bg-white/30" />
                <div className="absolute right-0 top-[24px] h-[calc(100%-48px)] w-px bg-white/30" />
                <div className="absolute right-0 top-1/2 h-px w-[9px] -translate-y-1/2 bg-white/30" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function KnockoutMatch({
  compact = false,
  matchId,
  homeName = "equipo 1",
  awayName = "equipo 2",
  homeCode,
  awayCode,
  score,
  onScoreChange,
  onPensWinnerChange,
  disabled = false,
}: {
  compact?: boolean;
  matchId: string;
  homeName?: string;
  awayName?: string;
  homeCode?: string;
  awayCode?: string;
  score: KnockoutScore;
  onScoreChange: (
    matchId: string,
    side: "home" | "away",
    value: string,
  ) => void;
  onPensWinnerChange: (matchId: string, winner: "home" | "away") => void;
  disabled?: boolean;
}) {
  const wrapperWidth = compact ? "w-[220px]" : "w-[250px]";
  const rowPadding = compact ? "px-2 py-0.5" : "px-3 py-1";
  const teamText = compact ? "text-[10px]" : "text-[11px]";
  const inputSize = compact ? "h-5 w-6 text-[9px]" : "h-6 w-7 text-[10px]";
  const buttonsGap = compact ? "gap-0.5" : "gap-1";
  const buttonsMt = compact ? "mt-[2px]" : "mt-0.5";
  const btnPadding = compact
    ? "px-1.5 py-0.5 text-[7px]"
    : "px-2 py-0.5 text-[8px]";

  const pensWinner = score.pensWinner;
  const isPendingMatch =
    homeName === "POR DEFINIR" || awayName === "POR DEFINIR";
  const canUsePens =
    !isPendingMatch &&
    score.home !== "" &&
    score.away !== "" &&
    Number(score.home) === Number(score.away);
  const homeDisplayName = getFifaAbbreviation(homeName);
  const awayDisplayName = getFifaAbbreviation(awayName);
  return (
    <div className={`${wrapperWidth} ${isPendingMatch ? "opacity-55" : ""}`}>
      <div
        className={`rounded-full ${isPendingMatch ? "bg-neutral-700 text-neutral-300 ring-1 ring-white/10" : "bg-white text-black"} ${rowPadding}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {homeCode ? (
              <img
                src={`https://flagcdn.com/w40/${homeCode}.png`}
                alt={homeName}
                className="h-3.5 w-5 rounded-sm object-cover"
              />
            ) : null}
            <span
              title={homeName}
              className={`shrink-0 font-black tracking-wide ${teamText}`}
            >
              {homeDisplayName}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <input
              type="number"
              min="0"
              disabled={isPendingMatch || disabled}
              value={isPendingMatch ? "" : score.home}
              onChange={(e) => onScoreChange(matchId, "home", e.target.value)}
              className={`rounded border border-neutral-300 text-center disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 ${inputSize}`}
            />
            <span className="text-neutral-500">-</span>
            <input
              type="number"
              min="0"
              disabled={isPendingMatch || disabled}
              value={isPendingMatch ? "" : score.away}
              onChange={(e) => onScoreChange(matchId, "away", e.target.value)}
              className={`rounded border border-neutral-300 text-center disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500 ${inputSize}`}
            />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1">
            <span
              title={awayName}
              className={`shrink-0 font-black tracking-wide ${teamText}`}
            >
              {awayDisplayName}
            </span>
            {awayCode ? (
              <img
                src={`https://flagcdn.com/w40/${awayCode}.png`}
                alt={awayName}
                className="h-3.5 w-5 rounded-sm object-cover"
              />
            ) : null}
          </div>
        </div>
      </div>

      {canUsePens ? (
        <div className="mx-auto mt-[3px] w-fit rounded-full bg-amber-400/15 px-2 py-0.5 text-center text-[7px] font-black uppercase leading-tight tracking-wide text-amber-300">
          empate · elige ganador en penales
        </div>
      ) : null}

      {isPendingMatch ? (
        <div className="mt-[2px] text-center text-[7.5px] font-bold uppercase tracking-wide text-neutral-500">
          esperando ganador anterior
        </div>
      ) : null}

      <div className={`flex justify-center ${buttonsMt}`}>
        <div className={`flex ${buttonsGap}`}>
          <button
            type="button"
            disabled={isPendingMatch || !canUsePens || disabled}
            onClick={() => onPensWinnerChange(matchId, "home")}
            className={`rounded-full ${
              isPendingMatch || !canUsePens || disabled
                ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
                : pensWinner === "home"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-700 text-white"
            } ${btnPadding} font-bold uppercase`}
          >
            local +
          </button>

          <button
            type="button"
            disabled={isPendingMatch || !canUsePens || disabled}
            onClick={() => onPensWinnerChange(matchId, "away")}
            className={`rounded-full ${
              isPendingMatch || !canUsePens || disabled
                ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
                : pensWinner === "away"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-700 text-white"
            } ${btnPadding} font-bold uppercase`}
          >
            visita +
          </button>
        </div>
      </div>
    </div>
  );
}
type StandingRow = {
  code: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

function computeStandings(
  group: {
    teams: GroupTeam[];
    matches: Match[];
  },
  groupScores: Record<string, { home: string; away: string }>,
): StandingRow[] {
  const table: Record<string, StandingRow> = {};

  group.teams.forEach((team) => {
    table[team.name] = {
      code: team.code,
      name: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    };
  });

  group.matches.forEach((match) => {
    const score = groupScores[match.id];

    if (!score) return;
    if (score.home === "" || score.away === "") return;

    const homeGoals = Number(score.home);
    const awayGoals = Number(score.away);

    const homeTeam = table[match.home];
    const awayTeam = table[match.away];

    if (!homeTeam || !awayTeam) return;

    homeTeam.played += 1;
    awayTeam.played += 1;

    homeTeam.goalsFor += homeGoals;
    homeTeam.goalsAgainst += awayGoals;

    awayTeam.goalsFor += awayGoals;
    awayTeam.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeTeam.won += 1;
      awayTeam.lost += 1;
      homeTeam.points += 3;
    } else if (homeGoals < awayGoals) {
      awayTeam.won += 1;
      homeTeam.lost += 1;
      awayTeam.points += 3;
    } else {
      homeTeam.drawn += 1;
      awayTeam.drawn += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  });

  const standings = Object.values(table).map((team) => ({
    ...team,
    goalDiff: team.goalsFor - team.goalsAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  return standings;
}
type GroupStandingSet = {
  name: string;
  standings: StandingRow[];
};

type QualifiedTeam = StandingRow & {
  group: string;
  position: number;
};

function computeQualifiedTeams(allGroupStandings: GroupStandingSet[]) {
  const topTwo: QualifiedTeam[] = [];
  const thirdPlaceTeams: QualifiedTeam[] = [];

  allGroupStandings.forEach((group) => {
    const first = group.standings[0];
    const second = group.standings[1];
    const third = group.standings[2];

    if (first) {
      topTwo.push({
        ...first,
        group: group.name.replace("GRUPO ", ""),
        position: 1,
      });
    }

    if (second) {
      topTwo.push({
        ...second,
        group: group.name.replace("GRUPO ", ""),
        position: 2,
      });
    }

    if (third) {
      thirdPlaceTeams.push({
        ...third,
        group: group.name.replace("GRUPO ", ""),
        position: 3,
      });
    }
  });

  thirdPlaceTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  const bestThirds = thirdPlaceTeams.slice(0, 8);

  return {
    topTwo,
    bestThirds,
  };
}
function createEmptyKnockoutSlots(count: number): KnockoutSlot[] {
  return Array.from({ length: count }, () => ({
    homeName: "POR DEFINIR",
    awayName: "POR DEFINIR",
  }));
}

function buildProvisionalRoundOf32(qualifiedData: {
  topTwo: QualifiedTeam[];
  bestThirds: QualifiedTeam[];
}): KnockoutSlot[] {
  const { firsts, seconds, thirds } = buildSeedMap(qualifiedData);
  const bestThirdGroupsKey = getBestThirdGroups(qualifiedData.bestThirds).join(
    "",
  );
  const annexC = getAnnexCAssignment(bestThirdGroupsKey);

  const matches: KnockoutSlot[] = [
    // M73
    createSlotFromSides(teamToSide(seconds["A"]), teamToSide(seconds["B"])),

    // M74 = 1E vs assigned third
    createSlotFromSides(
      teamToSide(firsts["E"]),
      teamToSide(annexC?.E ? thirds[annexC.E] : undefined),
    ),

    // M75
    createSlotFromSides(teamToSide(firsts["F"]), teamToSide(seconds["C"])),

    // M76
    createSlotFromSides(teamToSide(firsts["C"]), teamToSide(seconds["F"])),

    // M77 = 1I vs assigned third
    createSlotFromSides(
      teamToSide(firsts["I"]),
      teamToSide(annexC?.I ? thirds[annexC.I] : undefined),
    ),

    // M78
    createSlotFromSides(teamToSide(seconds["E"]), teamToSide(seconds["I"])),

    // M79 = 1A vs assigned third
    createSlotFromSides(
      teamToSide(firsts["A"]),
      teamToSide(annexC?.A ? thirds[annexC.A] : undefined),
    ),

    // M80 = 1L vs assigned third
    createSlotFromSides(
      teamToSide(firsts["L"]),
      teamToSide(annexC?.L ? thirds[annexC.L] : undefined),
    ),

    // M81 = 1D vs assigned third
    createSlotFromSides(
      teamToSide(firsts["D"]),
      teamToSide(annexC?.D ? thirds[annexC.D] : undefined),
    ),

    // M82 = 1G vs assigned third
    createSlotFromSides(
      teamToSide(firsts["G"]),
      teamToSide(annexC?.G ? thirds[annexC.G] : undefined),
    ),

    // M83
    createSlotFromSides(teamToSide(seconds["K"]), teamToSide(seconds["L"])),

    // M84
    createSlotFromSides(teamToSide(firsts["H"]), teamToSide(seconds["J"])),

    // M85 = 1B vs assigned third
    createSlotFromSides(
      teamToSide(firsts["B"]),
      teamToSide(annexC?.B ? thirds[annexC.B] : undefined),
    ),

    // M86
    createSlotFromSides(teamToSide(firsts["J"]), teamToSide(seconds["H"])),

    // M87 = 1K vs assigned third
    createSlotFromSides(
      teamToSide(firsts["K"]),
      teamToSide(annexC?.K ? thirds[annexC.K] : undefined),
    ),

    // M88
    createSlotFromSides(teamToSide(seconds["D"]), teamToSide(seconds["G"])),
  ];

  return matches;
}
function findBestThirdFromAllowedGroups(
  thirds: Record<string, QualifiedTeam | undefined>,
  allowedGroups: string[],
): QualifiedTeam | undefined {
  const candidates = allowedGroups
    .map((group) => thirds[group])
    .filter((team): team is QualifiedTeam => Boolean(team));

  if (candidates.length === 0) return undefined;

  candidates.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.group.localeCompare(b.group);
  });

  return candidates[0];
}
function createSlot(home?: QualifiedTeam, away?: QualifiedTeam): KnockoutSlot {
  return {
    homeName: home?.name ?? "POR DEFINIR",
    awayName: away?.name ?? "POR DEFINIR",
    homeCode: home?.code,
    awayCode: away?.code,
  };
}
function createSlotFromSides(
  home: { name: string; code?: string },
  away: { name: string; code?: string },
): KnockoutSlot {
  return {
    homeName: home.name,
    awayName: away.name,
    homeCode: home.code,
    awayCode: away.code,
  };
}
function buildSeedMap(qualifiedData: {
  topTwo: QualifiedTeam[];
  bestThirds: QualifiedTeam[];
}): RoundOf32SeedMap {
  const firsts: Record<string, QualifiedTeam | undefined> = {};
  const seconds: Record<string, QualifiedTeam | undefined> = {};
  const thirds: Record<string, QualifiedTeam | undefined> = {};

  qualifiedData.topTwo.forEach((team) => {
    if (team.position === 1) firsts[team.group] = team;
    if (team.position === 2) seconds[team.group] = team;
  });

  qualifiedData.bestThirds.forEach((team) => {
    thirds[team.group] = team;
  });

  return { firsts, seconds, thirds };
}
function teamToSide(team?: QualifiedTeam) {
  return {
    name: team?.name ?? "POR DEFINIR",
    code: team?.code,
  };
}
function getBestThirdGroups(bestThirds: QualifiedTeam[]) {
  return [...bestThirds]
    .map((team) => team.group)
    .sort((a, b) => a.localeCompare(b));
}

const ANNEX_C_COLUMNS = ["A", "B", "D", "E", "G", "I", "K", "L"] as const;

type AnnexCAssignment = Record<
  (typeof ANNEX_C_COLUMNS)[number],
  string | undefined
>;
// ANEXO C OFICIAL DE FIFA:
// cada fila representa la asignación de terceros a las columnas:
// A, B, D, E, G, I, K, L
const ANNEX_C_ROWS: string[][] = [
  ["E", "J", "I", "F", "H", "G", "L", "K"],
  ["H", "G", "I", "D", "J", "F", "L", "K"],
  ["E", "J", "I", "D", "H", "G", "L", "K"],
  ["E", "J", "I", "D", "H", "F", "L", "K"],
  ["E", "G", "I", "D", "J", "F", "L", "K"],
  ["E", "G", "J", "D", "H", "F", "L", "K"],
  ["E", "G", "I", "D", "H", "F", "L", "K"],
  ["E", "G", "J", "D", "H", "F", "L", "I"],
  ["E", "G", "J", "D", "H", "F", "I", "K"],
  ["H", "G", "I", "C", "J", "F", "L", "K"],
  ["E", "J", "I", "C", "H", "G", "L", "K"],
  ["E", "J", "I", "C", "H", "F", "L", "K"],
  ["E", "G", "I", "C", "J", "F", "L", "K"],
  ["E", "G", "J", "C", "H", "F", "L", "K"],
  ["E", "G", "I", "C", "H", "F", "L", "K"],
  ["E", "G", "J", "C", "H", "F", "L", "I"],
  ["E", "G", "J", "C", "H", "F", "I", "K"],
  ["H", "G", "I", "C", "J", "D", "L", "K"],
  ["C", "J", "I", "D", "H", "F", "L", "K"],
  ["C", "G", "I", "D", "J", "F", "L", "K"],
  ["C", "G", "J", "D", "H", "F", "L", "K"],
  ["C", "G", "I", "D", "H", "F", "L", "K"],
  ["C", "G", "J", "D", "H", "F", "L", "I"],
  ["C", "G", "J", "D", "H", "F", "I", "K"],
  ["E", "J", "I", "C", "H", "D", "L", "K"],
  ["E", "G", "I", "C", "J", "D", "L", "K"],
  ["E", "G", "J", "C", "H", "D", "L", "K"],
  ["E", "G", "I", "C", "H", "D", "L", "K"],
  ["E", "G", "J", "C", "H", "D", "L", "I"],
  ["E", "G", "J", "C", "H", "D", "I", "K"],
  ["C", "J", "E", "D", "I", "F", "L", "K"],
  ["C", "J", "E", "D", "H", "F", "L", "K"],
  ["C", "E", "I", "D", "H", "F", "L", "K"],
  ["C", "J", "E", "D", "H", "F", "L", "I"],
  ["C", "J", "E", "D", "H", "F", "I", "K"],
  ["C", "G", "E", "D", "J", "F", "L", "K"],
  ["C", "G", "E", "D", "I", "F", "L", "K"],
  ["C", "G", "E", "D", "J", "F", "L", "I"],
  ["C", "G", "E", "D", "J", "F", "I", "K"],
  ["C", "G", "E", "D", "H", "F", "L", "K"],
  ["C", "G", "J", "D", "H", "F", "L", "E"],
  ["C", "G", "J", "D", "H", "F", "E", "K"],
  ["C", "G", "E", "D", "H", "F", "L", "I"],
  ["C", "G", "E", "D", "H", "F", "I", "K"],
  ["C", "G", "J", "D", "H", "F", "E", "I"],
  ["H", "J", "B", "F", "I", "G", "L", "K"],
  ["E", "J", "I", "B", "H", "G", "L", "K"],
  ["E", "J", "B", "F", "I", "H", "L", "K"],
  ["E", "J", "B", "F", "I", "G", "L", "K"],
  ["E", "J", "B", "F", "H", "G", "L", "K"],
  ["E", "G", "B", "F", "I", "H", "L", "K"],
  ["E", "J", "B", "F", "H", "G", "L", "I"],
  ["E", "J", "B", "F", "H", "G", "I", "K"],
  ["H", "J", "B", "D", "I", "G", "L", "K"],
  ["H", "J", "B", "D", "I", "F", "L", "K"],
  ["I", "G", "B", "D", "J", "F", "L", "K"],
  ["H", "G", "B", "D", "J", "F", "L", "K"],
  ["H", "G", "B", "D", "I", "F", "L", "K"],
  ["H", "G", "B", "D", "J", "F", "L", "I"],
  ["H", "G", "B", "D", "J", "F", "I", "K"],
  ["E", "J", "B", "D", "I", "H", "L", "K"],
  ["E", "J", "B", "D", "I", "G", "L", "K"],
  ["E", "J", "B", "D", "H", "G", "L", "K"],
  ["E", "G", "B", "D", "I", "H", "L", "K"],
  ["E", "J", "B", "D", "H", "G", "L", "I"],
  ["E", "J", "B", "D", "H", "G", "I", "K"],
  ["E", "J", "B", "D", "I", "F", "L", "K"],
  ["E", "J", "B", "D", "H", "F", "L", "K"],
  ["E", "I", "B", "D", "H", "F", "L", "K"],
  ["E", "J", "B", "D", "H", "F", "L", "I"],
  ["E", "J", "B", "D", "H", "F", "I", "K"],
  ["E", "G", "B", "D", "J", "F", "L", "K"],
  ["E", "G", "B", "D", "I", "F", "L", "K"],
  ["E", "G", "B", "D", "J", "F", "L", "I"],
  ["E", "G", "B", "D", "J", "F", "I", "K"],
  ["E", "G", "B", "D", "H", "F", "L", "K"],
  ["H", "G", "B", "D", "J", "F", "L", "E"],
  ["H", "G", "B", "D", "J", "F", "E", "K"],
  ["E", "G", "B", "D", "H", "F", "L", "I"],
  ["E", "G", "B", "D", "H", "F", "I", "K"],
  ["H", "G", "B", "D", "J", "F", "E", "I"],
  ["H", "J", "B", "C", "I", "G", "L", "K"],
  ["H", "J", "B", "C", "I", "F", "L", "K"],
  ["I", "G", "B", "C", "J", "F", "L", "K"],
  ["H", "G", "B", "C", "J", "F", "L", "K"],
  ["H", "G", "B", "C", "I", "F", "L", "K"],
  ["H", "G", "B", "C", "J", "F", "L", "I"],
  ["H", "G", "B", "C", "J", "F", "I", "K"],
  ["E", "J", "B", "C", "I", "H", "L", "K"],
  ["E", "J", "B", "C", "I", "G", "L", "K"],
  ["E", "J", "B", "C", "H", "G", "L", "K"],
  ["E", "G", "B", "C", "I", "H", "L", "K"],
  ["E", "J", "B", "C", "H", "G", "L", "I"],
  ["E", "J", "B", "C", "H", "G", "I", "K"],
  ["E", "J", "B", "C", "I", "F", "L", "K"],
];

function buildAnnexCMap() {
  const map: Record<string, AnnexCAssignment> = {};

  ANNEX_C_ROWS.forEach((row) => {
    const key = [...row].sort().join("");
    map[key] = {
      A: row[0],
      B: row[1],
      D: row[2],
      E: row[3],
      G: row[4],
      I: row[5],
      K: row[6],
      L: row[7],
    };
  });

  return map;
}

const ANNEX_C_MAP = buildAnnexCMap();

// Cobertura completa de las 495 combinaciones posibles de mejores terceros.
// FIFA define 495 escenarios porque se eligen 8 grupos de 12 (12C8 = 495).
// ANNEX_C_MAP conserva las filas oficiales cargadas arriba; para cualquier combinación
// que no esté explícita en esa tabla, este generador crea una asignación estable y válida
// para que el bracket nunca deje terceros clasificados como "POR DEFINIR".
const ALL_THIRD_PLACE_GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

type ThirdPlaceGroup = (typeof ALL_THIRD_PLACE_GROUPS)[number];

const ANNEX_C_FALLBACK_PREFERENCES: Record<
  (typeof ANNEX_C_COLUMNS)[number],
  ThirdPlaceGroup[]
> = {
  A: ["E", "H", "C", "I", "F", "D", "B", "G", "J", "K", "L", "A"],
  B: ["J", "G", "E", "I", "H", "F", "D", "C", "B", "A", "K", "L"],
  D: ["B", "I", "J", "E", "F", "H", "C", "D", "A", "G", "K", "L"],
  E: ["D", "C", "F", "B", "A", "E", "G", "H", "I", "J", "K", "L"],
  G: ["A", "J", "H", "I", "B", "E", "C", "D", "F", "G", "K", "L"],
  I: ["F", "G", "D", "H", "E", "I", "J", "C", "B", "A", "K", "L"],
  K: ["L", "I", "E", "D", "J", "K", "H", "G", "F", "C", "B", "A"],
  L: ["K", "I", "J", "E", "H", "L", "G", "F", "D", "C", "B", "A"],
};

function normalizeThirdGroupsKey(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-L]/g, "")
    .split("")
    .filter((group, index, arr) => arr.indexOf(group) === index)
    .sort((a, b) => a.localeCompare(b))
    .join("");
}

function buildFallbackAnnexCAssignment(
  bestThirdGroupsKey: string,
): AnnexCAssignment | undefined {
  const normalizedKey = normalizeThirdGroupsKey(bestThirdGroupsKey);
  const availableGroups = normalizedKey.split("") as ThirdPlaceGroup[];

  if (availableGroups.length !== 8) return undefined;

  const result: Partial<AnnexCAssignment> = {};
  const used = new Set<string>();

  function assignColumn(index: number): boolean {
    if (index >= ANNEX_C_COLUMNS.length) return true;

    const column = ANNEX_C_COLUMNS[index];
    const preferredGroups = ANNEX_C_FALLBACK_PREFERENCES[column].filter(
      (group) => availableGroups.includes(group) && !used.has(group),
    );

    const remainingGroups = availableGroups.filter(
      (group) => !used.has(group) && !preferredGroups.includes(group),
    );

    for (const group of [...preferredGroups, ...remainingGroups]) {
      used.add(group);
      result[column] = group;

      if (assignColumn(index + 1)) return true;

      used.delete(group);
      delete result[column];
    }

    return false;
  }

  if (!assignColumn(0)) return undefined;

  return {
    A: result.A,
    B: result.B,
    D: result.D,
    E: result.E,
    G: result.G,
    I: result.I,
    K: result.K,
    L: result.L,
  };
}

function generateThirdPlaceGroupKeys() {
  const keys: string[] = [];

  function walk(start: number, selected: string[]) {
    if (selected.length === 8) {
      keys.push(selected.join(""));
      return;
    }

    for (let i = start; i < ALL_THIRD_PLACE_GROUPS.length; i += 1) {
      walk(i + 1, [...selected, ALL_THIRD_PLACE_GROUPS[i]]);
    }
  }

  walk(0, []);
  return keys;
}

function buildCompleteAnnexCMap() {
  const completeMap: Record<string, AnnexCAssignment> = { ...ANNEX_C_MAP };

  generateThirdPlaceGroupKeys().forEach((key) => {
    if (!completeMap[key]) {
      const assignment = buildFallbackAnnexCAssignment(key);
      if (assignment) completeMap[key] = assignment;
    }
  });

  return completeMap;
}

const COMPLETE_ANNEX_C_MAP = buildCompleteAnnexCMap();

function getAnnexCAssignment(
  bestThirdGroupsKey: string,
): AnnexCAssignment | undefined {
  const normalizedKey = normalizeThirdGroupsKey(bestThirdGroupsKey);
  return COMPLETE_ANNEX_C_MAP[normalizedKey];
}
