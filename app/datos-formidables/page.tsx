"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Group = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

type Team = {
  group: Group;
  name: string;
  flagCode: string;
  stadium: string;
  stadiumImg: string;
  stadiumMain?: string;
  stadiumAccent?: string;
  facts: string[];
};

function stadiumArt(title: string, main: string, accent: string) {
  const safeTitle = title.toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640">
      <defs>
        <radialGradient id="sky" cx="67%" cy="17%" r="76%">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.95"/>
          <stop offset="0.28" stop-color="#172033" stop-opacity="0.98"/>
          <stop offset="1" stop-color="#03060b"/>
        </radialGradient>
        <linearGradient id="field" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#2c9b4b"/>
          <stop offset="1" stop-color="#06391d"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="1200" height="640" fill="url(#sky)"/>
      <circle cx="830" cy="104" r="130" fill="${accent}" opacity=".34" filter="url(#blur)"/>
      <path d="M0 396 C178 350 330 375 506 332 C726 280 950 315 1200 250 L1200 640 L0 640 Z" fill="#06101d" opacity=".94"/>

      <g transform="translate(600 390)">
        <ellipse rx="442" ry="168" fill="#0c1220" stroke="${main}" stroke-width="18" opacity=".98" filter="url(#glow)"/>
        <ellipse rx="385" ry="132" fill="#182233" stroke="#dbeafe" stroke-opacity=".34" stroke-width="12"/>
        <ellipse rx="307" ry="99" fill="#111827" stroke="#94a3b8" stroke-opacity=".28" stroke-width="6"/>
        <ellipse rx="246" ry="72" fill="url(#field)" stroke="#bbf7d0" stroke-opacity=".48" stroke-width="5"/>
        <path d="M-170 0 Q0 -55 170 0" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="4"/>
        <path d="M-170 0 Q0 55 170 0" fill="none" stroke="#ffffff" stroke-opacity=".22" stroke-width="3"/>
        <path d="M-310 -62 C-160 -156 160 -156 310 -62" fill="none" stroke="#f8fafc" stroke-opacity=".55" stroke-width="16"/>
        <path d="M-385 -15 C-228 -142 228 -142 385 -15" fill="none" stroke="${main}" stroke-opacity=".78" stroke-width="13" filter="url(#glow)"/>
        ${Array.from({ length: 26 }).map((_, i) => {
          const x = -380 + i * 30;
          return `<path d="M${x} -4 L${x + 86} -132" stroke="#e5e7eb" stroke-opacity=".24" stroke-width="4"/>`;
        }).join("")}
        ${Array.from({ length: 16 }).map((_, i) => {
          const x = -470 + i * 63;
          return `<circle cx="${x}" cy="-146" r="4" fill="${accent}" opacity=".9"/>`;
        }).join("")}
      </g>

      <rect y="468" width="1200" height="172" fill="url(#grad)" opacity="0"/>
      <rect y="474" width="1200" height="166" fill="#03060b" opacity=".18"/>
      <text x="42" y="565" fill="#ffffff" fill-opacity=".95" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" letter-spacing="2">${safeTitle}</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


function wikiImage(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=720`;
}


function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const teamSearchAliases: Record<string, string[]> = {
  "México": ["Mexico"],
  "Sudáfrica": ["South Africa", "Southafrica"],
  "Corea del Sur": ["South Korea", "Korea", "Republic of Korea"],
  "Chequia": ["Czechia", "Czech Republic"],
  "Canadá": ["Canada"],
  "Bosnia y Herzegovina": ["Bosnia and Herzegovina", "Bosnia", "Herzegovina"],
  "Qatar": ["Qatar"],
  "Suiza": ["Switzerland", "Swiss"],
  "Brasil": ["Brazil"],
  "Marruecos": ["Morocco"],
  "Haití": ["Haiti"],
  "Escocia": ["Scotland"],
  "Estados Unidos": ["United States", "USA", "US", "America"],
  "Paraguay": ["Paraguay"],
  "Australia": ["Australia"],
  "Turquía": ["Turkey", "Turkiye", "Türkiye"],
  "Alemania": ["Germany"],
  "Curazao": ["Curacao", "Curaçao"],
  "Costa de Marfil": ["Ivory Coast", "Cote d Ivoire", "Côte d Ivoire"],
  "Ecuador": ["Ecuador"],
  "Países Bajos": ["Netherlands", "Holland", "Dutch"],
  "Japón": ["Japan"],
  "Suecia": ["Sweden"],
  "Túnez": ["Tunisia"],
  "Bélgica": ["Belgium"],
  "Egipto": ["Egypt"],
  "Irán": ["Iran"],
  "Nueva Zelanda": ["New Zealand"],
  "España": ["Spain"],
  "Cabo Verde": ["Cape Verde"],
  "Arabia Saudita": ["Saudi Arabia"],
  "Uruguay": ["Uruguay"],
  "Francia": ["France"],
  "Senegal": ["Senegal"],
  "Iraq": ["Iraq", "Irak"],
  "Noruega": ["Norway"],
  "Argentina": ["Argentina"],
  "Argelia": ["Algeria"],
  "Austria": ["Austria"],
  "Jordania": ["Jordan"],
  "Portugal": ["Portugal"],
  "República Democrática del Congo": ["Democratic Republic of the Congo", "DR Congo", "DRC", "Congo"],
  "Uzbekistán": ["Uzbekistan"],
  "Colombia": ["Colombia"],
  "Inglaterra": ["England"],
  "Croacia": ["Croatia"],
  "Ghana": ["Ghana"],
  "Panamá": ["Panama"],
};

function getTeamSearchText(team: Team) {
  return normalizeSearchText([team.name, team.stadium, ...(teamSearchAliases[team.name] ?? [])].join(" "));
}


const teams: Team[] = [
  // ===== GRUPO A =====
  {
    group: "A",
    name: "México",
    flagCode: "mx",
    stadium: "Estadio Azteca",
    stadiumImg: wikiImage("Estadio_Azteca_2.JPG"),
    facts: [
      "El Azteca está a más de 2,200 metros sobre el nivel del mar: esa altura reduce la resistencia del aire y puede hacer que la pelota viaje distinto que en sedes al nivel del mar.",
      "En México 1970 se hizo el primer cambio de jugador en la historia de los Mundiales; antes, si alguien se lesionaba, el equipo debía seguir incompleto.",
      "En 2026, México será el primer país que inaugure tres Mundiales distintos: 1970, 1986 y 2026."
    ]
  },
  {
    group: "A",
    name: "Sudáfrica",
    flagCode: "za",
    stadium: "FNB Stadium / Soccer City",
    stadiumImg: wikiImage("FNB_Stadium,_Johannesburg.jpg"),
    facts: [
      "El FNB Stadium fue remodelado con una fachada inspirada en una calabaza africana; de noche, el diseño busca parecer brasas encendidas alrededor del estadio.",
      "Sudáfrica 2010 fue el primer Mundial jugado en África y también el primero donde el país anfitrión quedó eliminado en fase de grupos.",
      "El primer gol mundialista en suelo africano fue el de Siphiwe Tshabalala: un zurdazo de Sudáfrica contra México en el partido inaugural de 2010."
    ]
  },
  {
    group: "A",
    name: "Corea del Sur",
    flagCode: "kr",
    stadium: "Seoul World Cup Stadium",
    stadiumImg: wikiImage("AFC_Champions_League_Final_1st_leg.jpg"),
    facts: [
      "El techo del Seoul World Cup Stadium fue diseñado para recordar el hanji, el papel tradicional coreano; visto de noche parece una lámpara ceremonial gigante.",
      "Corea del Sur 2002 fue la primera selección asiática en llegar a semifinales de un Mundial masculino.",
      "El estadio de Seúl tiene una estructura sostenida por mástiles que se inspira en formas tradicionales coreanas, no solo en arquitectura deportiva moderna."
    ]
  },
  {
    group: "A",
    name: "Chequia",
    flagCode: "cz",
    stadium: "Fortuna Arena / Eden Arena",
    stadiumImg: wikiImage("Praha,_Slavia,_fotbalový_stadion_(2).jpg"),
    facts: [
      "La Fortuna Arena tiene todas sus gradas techadas y forma parte de un complejo con hotel, oficinas, estacionamiento y zonas comerciales.",
      "Antes de competir como Chequia, la antigua Checoslovaquia jugó dos finales de Mundial: 1934 y 1962.",
      "El fútbol checo tiene una rareza histórica: llegó a la final de la Euro 1996 siendo una federación recién separada de Checoslovaquia."
    ]
  },

  // ===== GRUPO B =====
  {
    group: "B",
    name: "Canadá",
    flagCode: "ca",
    stadium: "BMO Field / Toronto Stadium",
    stadiumImg: wikiImage("BMO_Field_in_2016.png"),
    facts: [
      "El BMO Field será llamado Toronto Stadium durante el Mundial por reglas de patrocinio; es una de las sedes más compactas del torneo.",
      "Canadá pasó 36 años sin jugar un Mundial masculino: de México 1986 a Qatar 2022.",
      "Alphonso Davies marcó en 2022 el primer gol de Canadá en toda la historia de los Mundiales masculinos."
    ]
  },
  {
    group: "B",
    name: "Bosnia y Herzegovina",
    flagCode: "ba",
    stadium: "Bilino Polje",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/en/7/77/Bilino_Polje_Stadium_%28wide_angle%29.jpeg",
    facts: [
      "Bilino Polje, en Zenica, es pequeño comparado con los gigantes europeos, pero Bosnia lo usa como fortaleza por la presión de sus gradas pegadas al campo.",
      "Bosnia debutó en Mundiales en 2014 y su primer gol lo anotó Vedad Ibišević contra Argentina en el Maracaná.",
      "En la eliminatoria rumbo a Brasil 2014, Bosnia terminó líder de grupo y clasificó por diferencia de goles sobre Grecia."
    ]
  },
  {
    group: "B",
    name: "Qatar",
    flagCode: "qa",
    stadium: "Lusail Stadium",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Lusail_Iconic_Stadium_-_2022_FIFA_WC.jpg",
    facts: [
      "El Lusail Stadium fue diseñado con una piel dorada inspirada en recipientes y faroles tradicionales árabes; por eso cambia de tono con la luz del desierto.",
      "Qatar 2022 fue el primer Mundial donde casi todos los estadios usaron sistemas de enfriamiento diseñados específicamente para cada sede.",
      "Qatar se convirtió en el primer anfitrión que perdió el partido inaugural de un Mundial."
    ]
  },
  {
    group: "B",
    name: "Suiza",
    flagCode: "ch",
    stadium: "St. Jakob-Park",
    stadiumImg: wikiImage("StJakobParkB.JPG"),
    facts: [
      "El St. Jakob-Park de Basilea, apodado Joggeli, fue diseñado por Herzog & de Meuron, el mismo estudio detrás del Allianz Arena de Múnich.",
      "Suiza fue eliminada del Mundial 2006 sin recibir un solo gol en jugada: cayó ante Ucrania en penales tras empatar 0-0.",
      "Durante la Euro 2008, la cancha de St. Jakob-Park quedó tan dañada por la lluvia que tuvieron que cambiar todo el césped a mitad del torneo."
    ]
  },

  // ===== GRUPO C =====
  {
    group: "C",
    name: "Brasil",
    flagCode: "br",
    stadium: "Maracanã",
    stadiumImg: wikiImage("Maracana_2022.jpg"),
    facts: [
      "El Maracanã fue diseñado para multitudes enormes y en 1950 recibió una asistencia que durante décadas simbolizó el límite extremo del fútbol de masas.",
      "Brasil es la única selección que ha jugado absolutamente todos los Mundiales masculinos desde 1930.",
      "La final de 1950 no fue una final tradicional: el campeón se decidió en una liguilla final, por eso el 'Maracanazo' fue técnicamente el último partido del grupo decisivo."
    ]
  },
  {
    group: "C",
    name: "Marruecos",
    flagCode: "ma",
    stadium: "Estadio Mohammed V",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Mohammed_V_stadium.jpg",
    facts: [
      "El Estadio Mohammed V, en Casablanca, es famoso por una acústica muy agresiva: las gradas cerradas amplifican los cánticos y hacen que parezca más grande de lo que es.",
      "Marruecos fue el primer país africano en terminar líder de grupo en un Mundial: lo hizo en México 1986.",
      "En Qatar 2022, Marruecos fue la primera selección africana y árabe en llegar a semifinales de un Mundial."
    ]
  },
  {
    group: "C",
    name: "Haití",
    flagCode: "ht",
    stadium: "Stade Sylvio Cator",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Stade_Sylvio_Cator_after_earthquake_2010.jpg",
    facts: [
      "El Stade Sylvio Cator está nombrado por un atleta haitiano que fue medallista olímpico y récord mundial de salto de longitud, no por un futbolista.",
      "Haití jugó su único Mundial masculino en 1974 y su primer gol mundialista se lo marcó a Italia, rompiendo una larga racha italiana sin recibir gol.",
      "Emmanuel Sanon, autor de ese gol, es una figura casi mítica en Haití porque un solo sprint cambió la memoria mundialista del país."
    ]
  },
  {
    group: "C",
    name: "Escocia",
    flagCode: "gb-sct",
    stadium: "Hampden Park",
    stadiumImg: wikiImage("Hampden_Park_Stadium_-_geograph.org.uk_-_7932300.jpg"),
    facts: [
      "Hampden Park llegó a ser uno de los estadios más grandes del mundo y durante décadas tuvo récords de asistencia imposibles para el fútbol moderno con asientos.",
      "Escocia ha jugado varios Mundiales, pero nunca ha superado la fase de grupos, una de las maldiciones estadísticas más conocidas del torneo.",
      "En 1978, Escocia llegó con expectativas enormes y venció a Países Bajos, pero quedó eliminada por diferencia de goles."
    ]
  },

  // ===== GRUPO D =====
  {
    group: "D",
    name: "Estados Unidos",
    flagCode: "us",
    stadium: "MetLife Stadium / New York New Jersey Stadium",
    stadiumImg: wikiImage("Metlife_stadium_(Aerial_view).jpg"),
    facts: [
      "El MetLife será llamado New York New Jersey Stadium por reglas FIFA; su nombre comercial no se usa oficialmente durante el Mundial.",
      "Estados Unidos 1994 sigue siendo el Mundial con mayor asistencia total de la historia, pese a que tuvo menos partidos que el formato de 2026.",
      "El famoso 1-0 de Estados Unidos sobre Inglaterra en 1950 fue tan inesperado que algunos periódicos británicos pensaron que el resultado enviado por cable tenía un error."
    ]
  },
  {
    group: "D",
    name: "Paraguay",
    flagCode: "py",
    stadium: "Estadio Defensores del Chaco",
    stadiumImg: wikiImage("Estadio_Defensores_del_Chaco_en_2019.jpg"),
    facts: [
      "El Defensores del Chaco está ligado a la identidad nacional paraguaya: su nombre recuerda la Guerra del Chaco, no solo una marca deportiva o una zona de la ciudad.",
      "Paraguay 2010 llegó a cuartos de final y estuvo a un penal fallado de ponerse arriba contra España, que terminaría siendo campeona.",
      "José Luis Chilavert cambió la percepción mundial del arquero paraguayo: fue capitán, cobrador de faltas y símbolo competitivo de la selección."
    ]
  },
  {
    group: "D",
    name: "Australia",
    flagCode: "au",
    stadium: "Accor Stadium / Stadium Australia",
    stadiumImg: wikiImage("Stadium_Australia.jpg"),
    facts: [
      "El Stadium Australia fue construido para los Juegos Olímpicos de Sídney 2000 y después fue reconfigurado para eventos de fútbol y rugby.",
      "Australia cambió de confederación: dejó Oceanía y pasó a competir en Asia para tener una ruta mundialista más competitiva y estable.",
      "En 2006, Australia volvió a un Mundial tras 32 años y alcanzó octavos, donde cayó ante Italia con un penal en tiempo agregado."
    ]
  },
  {
    group: "D",
    name: "Turquía",
    flagCode: "tr",
    stadium: "Atatürk Olympic Stadium",
    stadiumImg: wikiImage("Istanbul_Atatürk_Olympic_Stadium_4.jpg"),
    facts: [
      "El Atatürk Olympic Stadium es famoso mundialmente por la final de Champions 2005, la llamada 'Milagro de Estambul', más que por partidos de selección.",
      "Turquía terminó tercera en el Mundial 2002 y marcó el gol más rápido en la historia de los Mundiales por el tercer lugar: Hakan Şükür contra Corea del Sur.",
      "Entre 1954 y 2002, Turquía pasó 48 años sin disputar un Mundial masculino, una de las esperas más largas entre participaciones destacadas."
    ]
  }
,
  // ===== GRUPO E =====
  {
    group: "E",
    name: "Alemania",
    flagCode: "de",
    stadium: "Olympiastadion Berlin",
    stadiumImg: wikiImage("Olympiastadionberlin.jpg"),
    facts: [
      "El Olympiastadion de Berlín conserva una arquitectura monumental de 1936, pero fue modernizado con techo y tecnología para el Mundial 2006 sin perder su forma histórica.",
      "Alemania es una de las selecciones más constantes del Mundial: durante décadas fue casi imposible verla fuera de semifinales, combinando generaciones muy distintas.",
      "En Brasil 2014, Alemania no solo ganó el Mundial: también se convirtió en el primer europeo campeón en territorio sudamericano."
    ]
  },
  {
    group: "E",
    name: "Curazao",
    flagCode: "cw",
    stadium: "Ergilio Hato Stadium",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Stadion_Ergilio_Hato.jpg/960px-Stadion_Ergilio_Hato.jpg",
    facts: [
      "El Ergilio Hato Stadium lleva el nombre de un portero curazoleño apodado 'Pantera Negra', considerado una leyenda caribeña antes de que el fútbol local tuviera visibilidad global.",
      "Curazao heredó parte de la historia futbolística de las Antillas Neerlandesas, por eso su identidad internacional es mucho más compleja que la de una selección recién aparecida.",
      "El país tiene una población muy pequeña comparada con potencias mundialistas, pero una enorme diáspora futbolística conectada con Países Bajos."
    ]
  },
  {
    group: "E",
    name: "Costa de Marfil",
    flagCode: "ci",
    stadium: "Stade Alassane Ouattara",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/6/62/Stade_Alassane_Ouattara_d%27Ebimp%C3%A9_3.jpg",
    facts: [
      "El Stade Alassane Ouattara, en Ebimpé, fue construido como símbolo moderno del fútbol marfileño y se volvió pieza central de la Copa Africana 2023.",
      "Costa de Marfil tuvo una generación dorada con Drogba, Yaya Touré y Kolo Touré, pero coincidió con grupos mundialistas durísimos en 2006 y 2010.",
      "Didier Drogba es recordado no solo por goles: en Costa de Marfil se le atribuye un papel simbólico en llamados de unidad durante años de tensión nacional."
    ]
  },
  {
    group: "E",
    name: "Ecuador",
    flagCode: "ec",
    stadium: "Estadio Rodrigo Paz Delgado",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/2/2a/LaCasaBlanca.jpg",
    facts: [
      "El Rodrigo Paz Delgado está en Quito, a más de 2,700 metros de altitud; esa altura convierte a Ecuador en uno de los locales más incómodos de Sudamérica.",
      "Ecuador llegó por primera vez a un Mundial en 2002 y apenas cuatro años después ya estaba jugando octavos de final en Alemania 2006.",
      "La selección ecuatoriana suele construir ventaja competitiva con ritmo, presión y adaptación a la altura, algo que cambia por completo el desgaste del rival."
    ]
  },

  // ===== GRUPO F =====
  {
    group: "F",
    name: "Países Bajos",
    flagCode: "nl",
    stadium: "Johan Cruyff Arena",
    stadiumImg: wikiImage("Arena,_Ajax_stadion,_Amsterdam.JPG"),
    facts: [
      "La Johan Cruyff Arena fue uno de los primeros grandes estadios europeos con techo retráctil y césped pensado para eventos múltiples, no solo fútbol.",
      "Países Bajos ha jugado tres finales de Mundial y perdió las tres; por eso es una de las selecciones más grandes sin título mundial.",
      "La 'Naranja Mecánica' de 1974 cambió la táctica moderna: su influencia fue mayor que su trofeo, porque no ganó el Mundial pero sí transformó cómo se entendía el juego."
    ]
  },
  {
    group: "F",
    name: "Japón",
    flagCode: "jp",
    stadium: "Saitama Stadium 2002",
    stadiumImg: wikiImage("Saitama_Stadium_200113b24.jpg"),
    facts: [
      "El Saitama Stadium 2002 fue construido específicamente pensando en el Mundial Corea-Japón y sigue siendo una de las casas más reconocibles del fútbol japonés.",
      "Japón ha construido una rareza estadística: suele competir muy bien contra gigantes, pero varias veces ha quedado eliminado en octavos de forma dramática.",
      "En Qatar 2022, Japón venció a Alemania y España en el mismo grupo, algo rarísimo para una selección que no era cabeza de serie."
    ]
  },
  {
    group: "F",
    name: "Suecia",
    flagCode: "se",
    stadium: "Friends Arena",
    stadiumImg: wikiImage("Friends_Arena.jpg"),
    facts: [
      "La Friends Arena tiene techo retráctil y fue diseñada para sobrevivir al clima nórdico, permitiendo eventos masivos incluso en invierno sueco.",
      "Suecia fue subcampeona del mundo como local en 1958, en el torneo donde Pelé apareció ante el planeta con solo 17 años.",
      "Zlatan Ibrahimović nunca jugó un Mundial en su mejor etapa: una de las grandes rarezas modernas entre superestrellas y Copas del Mundo."
    ]
  },
  {
    group: "F",
    name: "Túnez",
    flagCode: "tn",
    stadium: "Stade Olympique de Radès",
    stadiumImg: wikiImage("ExterieureStadeFootballRades.JPG"),
    facts: [
      "El Stade Olympique de Radès fue construido para los Juegos Mediterráneos de 2001 y se volvió el gran escenario moderno del fútbol tunecino.",
      "Túnez fue la primera selección africana en ganar un partido de Mundial: venció 3-1 a México en Argentina 1978.",
      "Aunque ha participado varias veces, Túnez ha vivido una constante cruel: competir bien por momentos, pero sufrir para convertir eso en clasificaciones a octavos."
    ]
  }
,
  // ===== GRUPO G =====
  {
    group: "G",
    name: "Bélgica",
    flagCode: "be",
    stadium: "King Baudouin Stadium",
    stadiumImg: wikiImage("King_Baudouin_Stadium.jpg"),
    facts: [
      "El King Baudouin Stadium ocupa el sitio del antiguo Heysel; por eso carga una memoria futbolística muy pesada y fue remodelado con otra identidad tras la tragedia de 1985.",
      "Bélgica fue número 1 del ranking FIFA durante largos periodos sin ganar Eurocopa ni Mundial, una rareza estadística de la era moderna.",
      "En Rusia 2018, Bélgica eliminó a Brasil con un plan táctico poco común: De Bruyne jugó como falso nueve para atacar los espacios entre centrales y mediocampo."
    ]
  },
  {
    group: "G",
    name: "Egipto",
    flagCode: "eg",
    stadium: "Cairo International Stadium",
    stadiumImg: wikiImage("Cairo_International_Stadium.jpg"),
    facts: [
      "El Cairo International Stadium fue diseñado como un coloso panárabe y durante décadas fue uno de los escenarios más intimidantes de África por el ruido continuo de sus gradas.",
      "Egipto jugó el Mundial de 1934, lo que lo convierte en una de las primeras selecciones no europeas ni sudamericanas en aparecer en la Copa del Mundo.",
      "Mohamed Salah rompió una espera larguísima: su generación devolvió a Egipto a un Mundial en 2018 después de 28 años de ausencia."
    ]
  },
  {
    group: "G",
    name: "Irán",
    flagCode: "ir",
    stadium: "Azadi Stadium",
    stadiumImg: wikiImage("Azadi_Stadium.jpg"),
    facts: [
      "El Azadi Stadium de Teherán fue concebido para eventos masivos de los Juegos Asiáticos de 1974 y durante años superó capacidades que hoy serían impensables por normas modernas.",
      "Irán consiguió su primera victoria mundialista en 1998 contra Estados Unidos, un partido cargado de simbolismo político fuera de la cancha.",
      "La selección iraní suele sufrir una paradoja: domina durante años en Asia, pero en Mundiales casi siempre queda atrapada en grupos muy cerrados por detalles mínimos."
    ]
  },
  {
    group: "G",
    name: "Nueva Zelanda",
    flagCode: "nz",
    stadium: "Eden Park",
    stadiumImg: wikiImage("Eden_Park_at_Dusk,_2013,_cropped.jpg"),
    facts: [
      "Eden Park es más famoso por rugby que por fútbol, pero esa mezcla de culturas deportivas hace que Nueva Zelanda tenga una identidad de estadio muy distinta a la europea o sudamericana.",
      "Nueva Zelanda 2010 terminó invicta el Mundial: empató sus tres partidos y aun así quedó eliminada en fase de grupos.",
      "Los All Whites cargan una de las rarezas más curiosas del torneo: en Sudáfrica 2010 sumaron más partidos sin perder que varias selecciones que avanzaron más lejos."
    ]
  },

  // ===== GRUPO H =====
  {
    group: "H",
    name: "España",
    flagCode: "es",
    stadium: "Santiago Bernabéu",
    stadiumImg: wikiImage("Estadio_Santiago_Bernabeu.jpg"),
    facts: [
      "El Santiago Bernabéu fue sede de la final del Mundial 1982 y su remodelación moderna incluye un sistema para guardar el césped bajo tierra cuando hay eventos no futbolísticos.",
      "España ganó el Mundial 2010 marcando solo 8 goles en 7 partidos: es uno de los campeones con menor producción ofensiva total de la historia.",
      "Entre Euro 2008, Mundial 2010 y Euro 2012, España logró una triple corona internacional que ninguna selección europea había conseguido de esa forma."
    ]
  },
  {
    group: "H",
    name: "Cabo Verde",
    flagCode: "cv",
    stadium: "Estádio Nacional de Cabo Verde",
    stadiumImg: wikiImage("Estadio_Nacional_de_Cabo_Verde.jpg"),
    facts: [
      "El Estádio Nacional de Cabo Verde está en Praia y representa una rareza geográfica: una selección de islas volcánicas compitiendo desde una infraestructura muy pequeña frente a potencias continentales.",
      "Cabo Verde tiene una de las diásporas futbolísticas más importantes proporcionalmente a su población; muchos jugadores se forman fuera del archipiélago.",
      "Su crecimiento internacional ha sido silencioso: pasó de ser una selección casi invisible a competir seriamente en torneos africanos en apenas unas décadas."
    ]
  },
  {
    group: "H",
    name: "Arabia Saudita",
    flagCode: "sa",
    stadium: "King Fahd International Stadium",
    stadiumImg: wikiImage("KingFahdInternationalStadium.jpg"),
    facts: [
      "El King Fahd International Stadium es conocido por su techo en forma de tienda beduina, uno de los diseños más reconocibles del fútbol de Medio Oriente.",
      "Arabia Saudita protagonizó una de las mayores sorpresas mundialistas recientes al vencer a Argentina en Qatar 2022, cortando una larguísima racha invicta argentina.",
      "Saeed Al-Owairan marcó en 1994 un gol maradoniano contra Bélgica que sigue siendo probablemente el gol saudí más famoso en Copas del Mundo."
    ]
  },
  {
    group: "H",
    name: "Uruguay",
    flagCode: "uy",
    stadium: "Estadio Centenario",
    stadiumImg: wikiImage("Estadio_Centenario_(vista_aérea).jpg"),
    facts: [
      "El Estadio Centenario fue construido para el Mundial de 1930 y la FIFA lo declaró Monumento Histórico del Fútbol Mundial por su papel fundacional.",
      "Uruguay ganó el primer Mundial de la historia y también el de 1950, pese a tener una población mucho menor que casi todas las potencias campeonas.",
      "La camiseta uruguaya conserva cuatro estrellas: dos por Mundiales FIFA y dos por oros olímpicos previos reconocidos como campeonatos mundiales por la propia tradición federativa uruguaya."
    ]
  }

,
  // ===== GRUPO I =====
  {
    group: "I",
    name: "Francia",
    flagCode: "fr",
    stadium: "Stade de France",
    stadiumImg: wikiImage("France-Islande_Stade_de_France_03.jpg"),
    facts: [
      "El Stade de France tiene una ingeniería poco común: su techo parece flotar sobre las gradas porque está sostenido por una estructura exterior separada del bowl principal.",
      "Francia 1998 no solo ganó en casa: recibió únicamente dos goles en todo el torneo, uno de los caminos defensivos más limpios de un campeón moderno.",
      "En 2022, Kylian Mbappé hizo hat-trick en una final de Mundial y aun así no fue campeón; algo que no ocurría desde Geoff Hurst en 1966, pero con desenlace opuesto."
    ]
  },
  {
    group: "I",
    name: "Senegal",
    flagCode: "sn",
    stadium: "Stade Abdoulaye Wade",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/fr/2/2f/Stade-Senegal-Me-Abdoulaye-Wade-768x475.jpg",
    facts: [
      "El Stade Abdoulaye Wade fue levantado en Diamniadio como símbolo de una nueva ciudad administrativa, no solo como estadio de fútbol.",
      "Senegal debutó en Mundiales en 2002 venciendo al campeón vigente Francia en el partido inaugural, una de las sorpresas más teatrales del torneo.",
      "En 2002, Senegal llegó a cuartos de final con una generación que jugaba gran parte en Francia, creando una historia cargada de ironía futbolística y colonial."
    ]
  },
  {
    group: "I",
    name: "Iraq",
    flagCode: "iq",
    stadium: "Basra International Stadium",
    stadiumImg: wikiImage("Basra_International_Stadium_Opening_2.JPG"),
    facts: [
      "El Basra International Stadium es conocido como la Palm Trunk por su diseño inspirado en el tronco de una palmera, un símbolo muy ligado al sur de Iraq.",
      "Iraq solo había jugado un Mundial masculino antes: México 1986, donde compartió grupo con Paraguay, Bélgica y el anfitrión México.",
      "La selección iraquí tiene una historia continental enorme: ganó la Copa Asiática 2007 en medio de un contexto nacional durísimo, convirtiéndose en un símbolo de unión."
    ]
  },
  {
    group: "I",
    name: "Noruega",
    flagCode: "no",
    stadium: "Ullevaal Stadion",
    stadiumImg: wikiImage("Ullevaal_Stadion,_the_Norway_national_football_team_home_stadium_in_Oslo.jpg"),
    facts: [
      "El Ullevaal Stadion no pertenece a un club gigante como muchos estadios nacionales europeos: históricamente ha funcionado como casa institucional del fútbol noruego.",
      "Noruega tiene una rareza mundialista impresionante: nunca ha perdido contra Brasil en partidos oficiales o amistosos reconocidos, incluyendo el Mundial 1998.",
      "En Francia 1998, Noruega eliminó a Marruecos indirectamente al remontar y vencer a Brasil en los últimos minutos de la fase de grupos."
    ]
  },

  // ===== GRUPO J =====
  {
    group: "J",
    name: "Argentina",
    flagCode: "ar",
    stadium: "Estadio Monumental",
    stadiumImg: wikiImage("Monu2023_u.jpg"),
    facts: [
      "El Monumental fue construido en una zona ganada al Río de la Plata; por eso su historia urbana está ligada a rellenos, expansión de Buenos Aires y obra pública.",
      "Argentina ha ganado Mundiales con identidades tácticas muy distintas: la presión emocional de 1978, el genio individual de 1986 y la estructura colectiva de 2022.",
      "Lionel Messi es el jugador con más partidos disputados en la historia de los Mundiales, una marca que mezcla longevidad, rendimiento y cinco ediciones distintas."
    ]
  },
  {
    group: "J",
    name: "Argelia",
    flagCode: "dz",
    stadium: "Stade Nelson Mandela",
    stadiumImg: wikiImage("Nelson_Mandela_Stadium.jpg"),
    facts: [
      "El Stade Nelson Mandela de Argel lleva el nombre de un líder sudafricano, un gesto político-deportivo poco común para un estadio nacional fuera de su país.",
      "Argelia 1982 venció a Alemania Federal en uno de los golpes más grandes de fase de grupos, pero quedó fuera tras el polémico partido Alemania-Austria.",
      "En Brasil 2014, Argelia llevó a Alemania a tiempo extra en octavos; ese partido es recordado como uno de los sustos más serios del posterior campeón."
    ]
  },
  {
    group: "J",
    name: "Austria",
    flagCode: "at",
    stadium: "Ernst-Happel-Stadion",
    stadiumImg: wikiImage("Austria_4879_Wien_SE_Ernst_Happel_Stadion_Knotenprater_E59_from_south.jpg"),
    facts: [
      "El Ernst-Happel-Stadion está dentro del Prater de Viena y conserva una vibra de estadio clásico europeo, lejos de los diseños comerciales ultramodernos.",
      "Austria fue tercera en el Mundial 1954, una posición histórica que suele olvidarse porque quedó eclipsada por el 'Milagro de Berna'.",
      "El 'Wunderteam' austríaco de los años 30 fue una de las primeras selecciones europeas admiradas por jugar con automatismos colectivos avanzados para su época."
    ]
  },
  {
    group: "J",
    name: "Jordania",
    flagCode: "jo",
    stadium: "Amman International Stadium",
    stadiumImg: wikiImage("Aerial_View_of_Amman_International_Stadium.jpg"),
    facts: [
      "El Amman International Stadium está en una ciudad construida sobre colinas, lo que hace que el entorno urbano alrededor del estadio sea muy distinto al de sedes planas tradicionales.",
      "Jordania ha crecido futbolísticamente desde una posición muy discreta en Asia hasta competir finales continentales, algo impensable para generaciones anteriores.",
      "La selección jordana se ha vuelto reconocible por su disciplina táctica: suele competir mejor como bloque que por grandes nombres individuales globales."
    ]
  }

,
  // ===== GRUPO K =====
  {
    group: "K",
    name: "Portugal",
    flagCode: "pt",
    stadium: "Estádio da Luz",
    stadiumImg: wikiImage("Estadio_da_Luz_2012.jpg"),
    facts: [
      "El Estádio da Luz no es el estadio original del Benfica: el antiguo fue demolido y el actual heredó el nombre, pero no exactamente la misma estructura histórica.",
      "Portugal tuvo que esperar hasta 1966 para jugar su primer Mundial y en ese debut terminó tercero, impulsado por Eusébio y una de las generaciones más potentes de su historia.",
      "Cristiano Ronaldo es el primer futbolista que ha marcado en cinco Mundiales distintos, una marca que mezcla longevidad, adaptación física y permanencia en élite."
    ]
  },
  {
    group: "K",
    name: "República Democrática del Congo",
    flagCode: "cd",
    stadium: "Stade des Martyrs",
    stadiumImg: wikiImage("Stade_des_Martyrs01.jpg"),
    facts: [
      "El Stade des Martyrs de Kinshasa es uno de los estadios más imponentes de África central y su nombre honra a figuras políticas ejecutadas en la historia congoleña.",
      "Cuando el país compitió como Zaire en 1974, fue la primera selección del África subsahariana en jugar un Mundial masculino.",
      "La famosa escena del tiro libre contra Brasil en 1974 suele contarse como broma, pero detrás había tensión política, presión extrema y un equipo completamente rebasado por el contexto."
    ]
  },
  {
    group: "K",
    name: "Uzbekistán",
    flagCode: "uz",
    stadium: "Bunyodkor Stadium",
    stadiumImg: wikiImage("Bunyodkor_Stadium.jpg"),
    facts: [
      "El Bunyodkor Stadium fue diseñado como una arena moderna para Tashkent y simboliza el intento de Uzbekistán por construir identidad futbolística tras la era soviética.",
      "Uzbekistán cargó durante años una etiqueta cruel en Asia: selección fuerte en eliminatorias, pero incapaz de romper la puerta mundialista por detalles mínimos.",
      "Su fútbol tiene una mezcla poco común de escuela soviética, técnica centroasiática y una liga local que ha invertido fuerte para desarrollar talento propio."
    ]
  },
  {
    group: "K",
    name: "Colombia",
    flagCode: "co",
    stadium: "Estadio Metropolitano Roberto Meléndez",
    stadiumImg: wikiImage("Estadio_Metropolitano_Roberto_Melendez.jpg"),
    facts: [
      "El Metropolitano de Barranquilla es una ventaja climática disfrazada de estadio: humedad, calor y ritmo caribeño convierten muchos partidos de Colombia en pruebas físicas extremas.",
      "Colombia 1990 volvió a un Mundial después de 28 años y lo hizo con una generación que cambió la estética del fútbol colombiano: toque corto, pausa y personalidad.",
      "El gol de James Rodríguez contra Uruguay en 2014 no solo fue el mejor del torneo: condensó pecho, giro y volea en una jugada de dificultad técnica rarísima."
    ]
  },

  // ===== GRUPO L =====
  {
    group: "L",
    name: "Inglaterra",
    flagCode: "gb-eng",
    stadium: "Wembley Stadium",
    stadiumImg: wikiImage("Wembley_Stadium_interior.jpg"),
    facts: [
      "El nuevo Wembley conserva simbólicamente el lugar del viejo estadio, pero reemplazó las torres gemelas por un arco de 133 metros que sostiene parte de la cubierta.",
      "Inglaterra ganó su único Mundial en 1966 como local y el famoso gol fantasma de Hurst sigue siendo una de las discusiones técnicas más largas del fútbol.",
      "Pese a inventar muchas reglas modernas del fútbol, Inglaterra tardó hasta 1950 en participar en un Mundial, porque antes no competía regularmente con FIFA."
    ]
  },
  {
    group: "L",
    name: "Croacia",
    flagCode: "hr",
    stadium: "Stadion Maksimir",
    stadiumImg: wikiImage("Stadion_Maksimir_areal.jpg"),
    facts: [
      "El Maksimir de Zagreb es más que un estadio: está cargado de simbolismo político y social por el famoso Dinamo Zagreb-Estrella Roja de 1990.",
      "Croacia debutó como país independiente en Mundiales en 1998 y terminó tercera, una irrupción casi imposible para una selección recién instalada en la élite.",
      "Entre 2018 y 2022, Croacia jugó dos semifinales mundialistas seguidas con una población menor que muchas ciudades grandes del mundo."
    ]
  },
  {
    group: "L",
    name: "Ghana",
    flagCode: "gh",
    stadium: "Baba Yara Stadium",
    stadiumImg: wikiImage("Baba_Yara_Sports_Stadium_in_Kumasi.jpg"),
    facts: [
      "El Baba Yara Stadium de Kumasi lleva el nombre de una leyenda ghanesa cuya carrera terminó por un accidente, una historia trágica detrás de un recinto nacional clave.",
      "Ghana estuvo a un penal de ser la primera selección africana en semifinales de un Mundial en 2010, tras la mano de Luis Suárez y el fallo de Asamoah Gyan.",
      "Las Black Stars toman su apodo de la estrella negra de la bandera, símbolo panafricano que conecta fútbol, independencia e identidad nacional."
    ]
  },
  {
    group: "L",
    name: "Panamá",
    flagCode: "pa",
    stadium: "Estadio Rommel Fernández",
    stadiumImg: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Estadio_Rommel_Fern%C3%A1ndez_Guti%C3%A9rrez.jpg",
    facts: [
      "El Estadio Rommel Fernández honra a un delantero panameño que brilló en España y murió joven; por eso el nombre del estadio tiene una carga emocional enorme.",
      "Panamá jugó su primer Mundial en 2018 y su primer gol mundialista, anotado por Felipe Baloy contra Inglaterra, fue celebrado casi como un título nacional.",
      "La clasificación de Panamá a Rusia 2018 llegó en una noche caótica: gol histórico, eliminación de Estados Unidos y fiesta nacional declarada al día siguiente."
    ]
  }


];

const groups: Group[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function DatosFormidablesPage() {
  const [activeGroup, setActiveGroup] = useState<Group>("A");
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAccess() {
      setAccessLoading(true);

      if (!userEmail) {
        if (!mounted) return;
        setHasAccess(false);
        setAccessLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("has_paid")
        .eq("username", userEmail)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.log(error);
        setHasAccess(false);
      } else {
        setHasAccess(Boolean(data?.has_paid));
      }

      setAccessLoading(false);
    }

    loadAccess();

    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const contentLocked = accessLoading || !hasAccess;

  const filteredTeams = useMemo(() => {
    const cleanSearch = normalizeSearchText(search);

    if (cleanSearch) {
      return teams.filter((team) => getTeamSearchText(team).includes(cleanSearch));
    }

    return teams.filter((team) => team.group === activeGroup);
  }, [activeGroup, search]);

  const currentLabel = search.trim()
    ? `Resultados para "${search.trim()}"`
    : `Grupo ${activeGroup}`;

  return (
    <main className="datosPage">
      <div className="datosShell">
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandBall">⚽</span>
            <span>
              <span className="brandTitle">Mundial Picks</span>
              <span className="brandSub">Datos formidables</span>
            </span>
          </Link>

          <nav className="navLinks" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/picks">Mis Predicciones</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/como-se-puntua">Cómo se puntúa</Link>
            <Link href="/calendario">Calendario</Link>
            <Link className="active" href="/datos-formidables">Datos formidables</Link>
          </nav>

          <div className="topRight">
            <span className="prizeChip">Premio $20,000 MXN</span>
          </div>
        </header>

        <section className="heroDatos">
          <div className="heroTextBlock">
            <h1>Datos formidables</h1>
            <p className="heroKicker">48 selecciones, 144 datos que no conocías</p>
            <p className="heroCopy">
              Curiosidades poco conocidas, estadios históricos y detalles escondidos de cada selección que participa en el Mundial 2026.
            </p>
          </div>
        </section>

        <div className="exclusiveArea">
          <div className={contentLocked ? "exclusiveContent locked" : "exclusiveContent"}>
            <section className="controlsBar">
              <div className="searchWrap">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar selección..."
                  aria-label="Buscar selección"
                  disabled={contentLocked}
                />
              </div>

              <div className="groupTabs" aria-label="Grupos disponibles">
                {groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    className={activeGroup === group && !search.trim() ? "active" : ""}
                    disabled={contentLocked}
                    onClick={() => {
                      setActiveGroup(group);
                      setSearch("");
                    }}
                  >
                    Grupo {group}
                  </button>
                ))}
              </div>
            </section>

            <section className="sectionHeader">
              <div>
                <span>Contenido por grupo</span>
                <h2>{currentLabel}</h2>
              </div>
              <p>{filteredTeams.length} selecciones</p>
            </section>

            <section className="cardsGrid">
              {filteredTeams.map((team) => (
                <article className="teamCard" key={`${team.group}-${team.name}`}>
                  <div className="stadiumImageWrap">
                    <img
                      className="stadiumImage"
                      src={team.stadiumImg}
                      alt={`Estadio de referencia: ${team.stadium}`}
                      loading={team.group === activeGroup ? "eager" : "lazy"}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        const img = event.currentTarget;
                        if (img.dataset.fallback === "true") return;
                        img.dataset.fallback = "true";
                        img.src = stadiumArt(team.stadium, "#ef4444", "#f59e0b");
                      }}
                    />
                    <div className="stadiumOverlay" />
                    <div className="stadiumName">{team.stadium}</div>
                  </div>

                  <div className="cardBody">
                    <div className="teamHeader">
                      <img
                        className="flagImg"
                        src={`https://flagcdn.com/w80/${team.flagCode}.png`}
                        alt={`Bandera de ${team.name}`}
                      />
                      <div>
                        <h3>{team.name}</h3>
                        <span>Grupo {team.group}</span>
                      </div>
                    </div>

                    <ol className="factsList">
                      {team.facts.map((fact, index) => (
                        <li key={fact}>
                          <strong>{index + 1}</strong>
                          <p>{fact}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </section>
          </div>

          {contentLocked && (
            <div className="exclusiveLockOverlay">
              <div className="exclusiveLockCard">
                <div className="exclusiveLockIcon">🔒</div>
                <span>{accessLoading ? "Verificando acceso" : "Contenido exclusivo"}</span>
                <h2>Datos formidables para participantes inscritos</h2>
                <p>
                  {accessLoading
                    ? "Estamos revisando tu acceso. Esto solo toma un momento."
                    : "Inscríbete para desbloquear las curiosidades, estadios y datos especiales de las 48 selecciones."}
                </p>
                {!accessLoading && (
                  <Link href="/inscripcion" className="exclusiveLockButton">
                    Inscribirme ahora <strong>→</strong>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #03060b; }

        .datosPage {
          min-height: 100vh;
          color: white;
          padding: 8px 14px 28px;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at 82% 0%, rgba(239,68,68,.12), transparent 28%),
            radial-gradient(circle at 16% 0%, rgba(245,158,11,.08), transparent 23%),
            #03060b;
        }

        .datosShell { width: min(100%, 1500px); margin: 0 auto; }

        .topbar,
        .heroDatos,
        .teamCard {
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(7, 11, 18, 0.96);
          box-shadow: 0 18px 50px rgba(0,0,0,.35);
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
          font-size: 10px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 28px;
          font-size: 13px;
          font-weight: 850;
        }

        .navLinks a {
          color: rgba(255,255,255,.86);
          text-decoration: none;
          padding: 25px 0 20px;
          white-space: nowrap;
        }

        .navLinks a:hover,
        .navLinks a.active { color: #ef4444; }
        .navLinks a.active { border-bottom: 3px solid #ef4444; }

        .topRight {
          min-width: 210px;
          display: flex;
          justify-content: flex-end;
        }

        .prizeChip {
          height: 36px;
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0 14px;
          color: #fbbf24;
          background: rgba(245,158,11,.09);
          border: 1px solid rgba(245,158,11,.26);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .heroDatos {
          min-height: 330px;
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          padding: 42px 66px;
          background:
            linear-gradient(90deg, rgba(3,6,11,1) 0%, rgba(7,11,18,.96) 34%, rgba(7,11,18,.62) 58%, rgba(7,11,18,.22) 100%),
            linear-gradient(180deg, rgba(3,6,11,.15), rgba(3,6,11,.45)),
            url("/datos-formidables-hero.png"),
            radial-gradient(ellipse at 78% 58%, rgba(245,158,11,.32), transparent 26%),
            radial-gradient(ellipse at 78% 68%, rgba(239,68,68,.20), transparent 34%),
            linear-gradient(135deg, #050913, #111827 48%, #2a1208);
          background-size: cover;
          background-position: center;
        }

        .heroDatos:after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 74% 45%, rgba(245,158,11,.18), transparent 26%),
            repeating-linear-gradient(170deg, rgba(255,255,255,.024) 0 1px, transparent 1px 18px);
          pointer-events: none;
        }

        .heroTextBlock { position: relative; z-index: 1; max-width: 680px; }


        h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 68px);
          line-height: .92;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.055em;
        }

        .heroKicker {
          margin: 12px 0 0;
          color: #ef4444;
          font-size: 16px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .heroCopy {
          margin: 18px 0 0;
          max-width: 560px;
          color: rgba(255,255,255,.72);
          font-size: 17px;
          line-height: 1.45;
          font-weight: 650;
        }

        .controlsBar {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .searchWrap {
          width: min(100%, 370px);
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
          border: 1px solid rgba(148,163,184,.17);
          background: rgba(8,13,21,.92);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
        }

        .searchWrap span { color: rgba(255,255,255,.6); font-size: 24px; }
        .searchWrap input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
        }
        .searchWrap input::placeholder { color: rgba(255,255,255,.42); }

        .groupTabs {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 7px;
          flex: 1;
          min-width: 0;
        }

        .groupTabs button {
          width: 100%;
          min-width: 0;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,.18);
          color: rgba(255,255,255,.78);
          background: rgba(8,13,21,.72);
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 950;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          padding: 0 8px;
        }

        .groupTabs button.active,
        .groupTabs button:hover {
          color: white;
          background: #ef111b;
          border-color: #ef111b;
          box-shadow: 0 12px 28px rgba(239,17,27,.22);
        }

        .sectionHeader {
          margin: 24px 0 14px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .sectionHeader span {
          display: block;
          color: #ef4444;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .sectionHeader h2 {
          margin: 6px 0 0;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.035em;
        }

        .sectionHeader p {
          margin: 0;
          color: rgba(255,255,255,.55);
          font-size: 13px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .cardsGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .teamCard {
          min-height: 520px;
          border-radius: 18px;
          overflow: hidden;
          background:
            radial-gradient(circle at 16% 0%, rgba(239,68,68,.08), transparent 28%),
            linear-gradient(180deg, rgba(15,23,42,.97), rgba(7,11,18,.98));
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        .teamCard:hover {
          transform: translateY(-3px);
          border-color: rgba(239,68,68,.42);
          box-shadow: 0 24px 60px rgba(0,0,0,.45);
        }

        .stadiumImageWrap {
          position: relative;
          height: 175px;
          overflow: hidden;
          background-color: #111827;
        }

        .stadiumImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(1.08) contrast(1.08);
          transform: scale(1.02);
        }

        .localStadiumArt {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background:
            radial-gradient(circle at 72% 18%, var(--stadium-accent), transparent 25%),
            radial-gradient(circle at 20% 5%, color-mix(in srgb, var(--stadium-main) 42%, transparent), transparent 30%),
            linear-gradient(135deg, #03060b 0%, #111827 48%, #020617 100%);
        }

        .localStadiumSky {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(160deg, rgba(255,255,255,.045) 0 1px, transparent 1px 22px),
            linear-gradient(180deg, rgba(255,255,255,.08), transparent 55%);
        }

        .localStadiumGlow {
          position: absolute;
          width: 210px;
          height: 210px;
          right: -55px;
          top: -95px;
          border-radius: 999px;
          background: var(--stadium-accent);
          filter: blur(30px);
          opacity: .34;
        }

        .localStadiumBowl {
          position: absolute;
          left: 50%;
          bottom: -46px;
          width: 118%;
          height: 220px;
          transform: translateX(-50%) perspective(520px) rotateX(58deg);
          border-radius: 50%;
          background: #0b1120;
          border: 16px solid var(--stadium-main);
          box-shadow:
            0 0 35px color-mix(in srgb, var(--stadium-main) 48%, transparent),
            inset 0 0 0 14px rgba(255,255,255,.14),
            inset 0 0 0 42px rgba(15,23,42,.92);
        }

        .localStadiumRing {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 8px solid rgba(255,255,255,.22);
        }

        .localStadiumRingOne { width: 78%; height: 60%; }
        .localStadiumRingTwo { width: 58%; height: 42%; border-width: 5px; opacity: .65; }

        .localStadiumField {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 42%;
          height: 27%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #166534);
          border: 4px solid rgba(255,255,255,.35);
          box-shadow: inset 0 0 0 8px rgba(255,255,255,.08);
        }

        .localStadiumLights {
          position: absolute;
          left: 10%;
          right: 10%;
          top: 15%;
          height: 10px;
          border-radius: 999px;
          background: repeating-linear-gradient(90deg, var(--stadium-accent) 0 8px, transparent 8px 34px);
          filter: drop-shadow(0 0 8px var(--stadium-accent));
          opacity: .8;
        }

        .stadiumOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(3,6,11,.04), rgba(3,6,11,.72)),
            radial-gradient(circle at 50% 20%, rgba(255,255,255,.12), transparent 42%);
        }

        .stadiumName {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 12px;
          color: rgba(255,255,255,.84);
          font-size: 11px;
          line-height: 1.15;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
          text-shadow: 0 2px 10px rgba(0,0,0,.65);
        }

        .cardBody { padding: 18px 16px 20px; }

        .teamHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .flagImg {
          width: 38px;
          height: 27px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,.16);
          box-shadow: 0 8px 18px rgba(0,0,0,.22);
        }

        .teamHeader h3 {
          margin: 0;
          color: white;
          font-size: 21px;
          line-height: 1;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .teamHeader span {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.46);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .factsList {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 15px;
        }

        .factsList li {
          display: grid;
          grid-template-columns: 25px 1fr;
          gap: 10px;
          align-items: flex-start;
        }

        .factsList strong {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(239,68,68,.58);
          color: white;
          font-size: 12px;
          font-weight: 950;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        }

        .factsList p {
          margin: 2px 0 0;
          color: rgba(255,255,255,.68);
          font-size: 14px;
          line-height: 1.42;
          font-weight: 650;
        }



        .exclusiveArea {
          position: relative;
        }

        .exclusiveContent.locked {
          filter: blur(5px);
          opacity: .42;
          pointer-events: none;
          user-select: none;
        }

        .exclusiveLockOverlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          min-height: 560px;
          display: grid;
          place-items: start center;
          padding: 118px 18px 40px;
          background: linear-gradient(180deg, rgba(3,6,11,.32), rgba(3,6,11,.86));
          border-radius: 18px;
        }

        .exclusiveLockCard {
          width: min(100%, 520px);
          border-radius: 24px;
          padding: 30px 28px;
          text-align: center;
          border: 1px solid rgba(255,255,255,.13);
          background:
            radial-gradient(circle at 50% 0%, rgba(239,68,68,.18), transparent 36%),
            rgba(7, 11, 18, .96);
          box-shadow: 0 28px 90px rgba(0,0,0,.58);
          backdrop-filter: blur(10px);
        }

        .exclusiveLockIcon {
          width: 58px;
          height: 58px;
          margin: 0 auto 14px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(239,68,68,.18);
          border: 1px solid rgba(239,68,68,.44);
          font-size: 26px;
        }

        .exclusiveLockCard span {
          display: block;
          color: #ef4444;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .09em;
        }

        .exclusiveLockCard h2 {
          margin: 9px 0 0;
          color: white;
          font-size: clamp(27px, 4vw, 38px);
          line-height: .98;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.045em;
        }

        .exclusiveLockCard p {
          margin: 14px auto 0;
          max-width: 430px;
          color: rgba(255,255,255,.68);
          font-size: 15px;
          line-height: 1.45;
          font-weight: 700;
        }

        .exclusiveLockButton {
          min-height: 48px;
          margin-top: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-radius: 12px;
          padding: 0 24px;
          color: white;
          background: #ef111b;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          box-shadow: 0 18px 42px rgba(239,17,27,.24);
        }


        @media (max-width: 1220px) {
          .navLinks { display: none; }
          .cardsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .topRight { min-width: auto; }
        }

        @media (max-width: 1220px) {
          .controlsBar { align-items: stretch; flex-direction: column; }
          .searchWrap { width: min(100%, 420px); }
          .groupTabs { width: 100%; grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }

        @media (max-width: 760px) {
          .datosPage { padding: 8px; }
          .topbar { padding: 14px; }
          .brandTitle { font-size: 20px; }
          .prizeChip { display: none; }
          .heroDatos { min-height: 300px; padding: 30px 22px; }
          h1 { font-size: 42px; }
          .controlsBar { align-items: stretch; flex-direction: column; }
          .searchWrap { width: 100%; }
          .groupTabs {
            width: 100%;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          .groupTabs button { height: 38px; font-size: 10px; padding: 0 5px; }
          .cardsGrid { grid-template-columns: 1fr; }
          .sectionHeader { align-items: flex-start; flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
