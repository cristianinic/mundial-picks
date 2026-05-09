"use client";

import Link from "next/link";

const CONTACT_EMAIL = "mundialpicks2026@gmail.com";

const sections = [
  {
    title: "1. Identidad y alcance del servicio",
    paragraphs: [
      "Mundial Picks 2026 es una plataforma digital de predicción deportiva, ranking y contenido informativo relacionada con el torneo Mundial 2026. Estos Términos y Condiciones regulan el acceso, registro, uso de la plataforma, adquisición del acceso digital, participación en el ranking y consulta de contenidos disponibles dentro del sitio.",
      "Para efectos de este documento, “Mundial Picks”, “la plataforma”, “el sitio” o “el servicio” se refiere al sitio web, sus páginas, formularios, secciones de predicción, ranking global, calendario, datos informativos, sistema de puntuación, funcionalidades de cuenta y cualquier herramienta digital relacionada con Mundial Picks 2026.",
      "El uso de la plataforma implica la aceptación de estos Términos y Condiciones. Si el usuario no está de acuerdo con ellos, deberá abstenerse de registrarse, inscribirse, pagar, guardar predicciones o utilizar las funciones disponibles."
    ]
  },
  {
    title: "2. Producto digital que se adquiere",
    paragraphs: [
      "La inscripción a Mundial Picks 2026 corresponde a la adquisición de un acceso digital a la plataforma. El producto vendido es el derecho de uso de herramientas digitales, contenido informativo y funciones de participación dentro del sitio durante la vigencia operativa del torneo y del ranking final.",
      "El acceso digital puede incluir, de forma enunciativa: creación y guardado de predicciones, participación en el ranking global, consulta de posición en el ranking, revisión de calendario, grupos, selecciones, sistema de puntuación, datos formidables y demás contenido informativo disponible en la plataforma.",
      "La inscripción no representa la compra de una apuesta, boleto de azar, boleto de rifa, participación en sorteo, quiniela aleatoria, juego de casino, operación de bookmaking, momio, cuota, multiplicador de pago ni cualquier producto cuyo resultado dependa de selección aleatoria o azar puro."
    ]
  },
  {
    title: "3. Naturaleza de la competencia",
    paragraphs: [
      "Mundial Picks 2026 opera como una competencia de predicción deportiva basada en conocimiento, análisis, criterio deportivo, seguimiento del torneo y habilidad del participante para anticipar resultados conforme al sistema de puntuación publicado.",
      "La posición de cada participante en el ranking depende del desempeño de sus predicciones frente a los resultados oficiales del torneo y de la aplicación del sistema de puntuación. Ningún participante es elegido ganador por sorteo, tómbola, rifa, selección aleatoria, número al azar o mecanismo equivalente.",
      "El hecho de que los resultados deportivos reales sean inciertos no convierte la plataforma en apuesta. El usuario no apuesta contra la casa, no recibe cuotas, no puede elegir montos variables por partido, no existen momios y no hay pagos proporcionales a una cantidad arriesgada sobre un evento específico."
    ]
  },
  {
    title: "4. Declaración expresa: no es apuesta, sorteo, rifa ni juego de azar",
    paragraphs: [
      "Mundial Picks 2026 no ofrece ni administra apuestas deportivas. La inscripción no autoriza al usuario a apostar dinero sobre partidos, jugadores, marcadores, goles, campeones o cualquier otro evento deportivo.",
      "Mundial Picks 2026 no es un sorteo, rifa o concurso aleatorio. El eventual premio se asigna al participante que obtenga la mejor puntuación conforme a reglas objetivas y publicadas; no se asigna por suerte, azar, extracción, selección aleatoria o compra de oportunidad.",
      "El pago de la inscripción corresponde al acceso a un producto digital. La participación no garantiza premio, devolución, recuperación del costo de inscripción ni beneficio económico. El usuario paga por el acceso a la plataforma y sus funciones, no por una promesa de ganancia."
    ]
  },
  {
    title: "5. Registro, cuenta y veracidad de información",
    paragraphs: [
      "Para utilizar las funciones principales, el usuario deberá crear o utilizar una cuenta dentro de la plataforma. El usuario se obliga a proporcionar información veraz, actualizada y suficiente para operar su cuenta y su inscripción.",
      "El usuario es responsable de conservar el acceso a su correo electrónico, resguardar sus credenciales, mantener la confidencialidad de su cuenta y notificar cualquier uso no autorizado. Las acciones realizadas desde una cuenta se entenderán hechas por su titular salvo prueba en contrario.",
      "La plataforma podrá negar, suspender o cancelar el acceso de cuentas que presenten información falsa, duplicidad fraudulenta, manipulación técnica, abuso, intento de alterar el ranking, uso automatizado no autorizado o incumplimiento de estos Términos."
    ]
  },
  {
    title: "6. Inscripción, precio y medios de pago",
    paragraphs: [
      "El precio de inscripción, moneda aplicable, impuestos, cargos, comisiones, promociones o descuentos, en caso de existir, serán informados al usuario antes de finalizar el pago.",
      "Los pagos podrán procesarse mediante proveedores externos de pago. Al pagar mediante un proveedor externo, el usuario acepta que la operación puede estar sujeta a los términos, condiciones, políticas de privacidad, validaciones antifraude, tiempos de acreditación y reglas de dicho proveedor.",
      "El acceso se activará cuando el pago sea confirmado como aprobado por el proveedor correspondiente o por el sistema interno de la plataforma. Si el pago es rechazado, cancelado, revertido, desconocido, devuelto o no confirmado, la plataforma podrá no activar o podrá suspender el acceso."
    ]
  },
  {
    title: "7. Vigencia del acceso digital",
    paragraphs: [
      "La inscripción otorga acceso digital durante el ciclo operativo de Mundial Picks 2026, que comprende la etapa previa al cierre de predicciones, el desarrollo del torneo, el cálculo de puntuaciones y el cierre operativo del ranking final.",
      "La vigencia del acceso no debe interpretarse como una suscripción mensual indefinida, salvo que expresamente se indique lo contrario. En principio, se trata de un acceso único asociado al torneo Mundial 2026 y sus funcionalidades relacionadas.",
      "La plataforma podrá conservar determinadas secciones en modo consulta después del cierre del torneo, pero no está obligada a mantener indefinidamente todas las funciones activas una vez concluido el ciclo operativo del ranking final."
    ]
  },
  {
    title: "8. Predicciones, edición y fecha límite",
    paragraphs: [
      "El usuario podrá crear, modificar y guardar sus predicciones hasta la fecha y hora límite indicada dentro de la plataforma. Una vez alcanzado el cierre de predicciones, los picks quedarán bloqueados y no podrán modificarse.",
      "Es responsabilidad del usuario revisar que sus predicciones estén completas, correctas y guardadas antes del cierre. La plataforma no será responsable por errores de captura, omisiones, predicciones incompletas, falta de conexión, errores del dispositivo del usuario o intentos de guardado realizados fuera de plazo.",
      "La plataforma podrá impedir la edición de predicciones, ocultar picks de otros usuarios o restringir ciertas funciones antes del cierre con el propósito de preservar la integridad de la competencia y evitar copias o ventajas indebidas."
    ]
  },
  {
    title: "9. Sistema de puntuación",
    paragraphs: [
      "La puntuación se calculará conforme al sistema publicado en la sección correspondiente de la plataforma. Dicho sistema puede considerar, entre otros elementos, aciertos de resultado, marcador exacto, goles exactos, clasificados, cruces, ganador de fases, penales, campeón y criterios específicos por ronda.",
      "El usuario acepta que la posición en el ranking dependerá de la aplicación del sistema de puntuación a los resultados oficiales del torneo. La plataforma podrá realizar correcciones razonables cuando existan errores técnicos, inconsistencias de captura o ajustes necesarios para reflejar correctamente las reglas publicadas.",
      "En caso de actualización o aclaración del sistema de puntuación, la versión vigente y publicada en la plataforma será la referencia principal para resolver dudas operativas."
    ]
  },
  {
    title: "10. Ranking global",
    paragraphs: [
      "El ranking global mostrará la posición de los participantes con base en los puntos obtenidos conforme al sistema de puntuación. La plataforma podrá mostrar rankings públicos, rankings limitados, top de participantes, búsqueda por usuario o identificador público y otras vistas de clasificación.",
      "La posición en el ranking puede cambiar conforme avancen los partidos, se actualicen resultados oficiales y se recalculen puntos. La plataforma procurará actualizar la información de forma razonable, pero pueden existir tiempos de procesamiento, revisión o corrección.",
      "El usuario reconoce que el ranking tiene fines competitivos, informativos y de comparación entre participantes inscritos."
    ]
  },
  {
    title: "11. Premio al mejor predictor",
    paragraphs: [
      "Mundial Picks 2026 contempla un premio principal de $20,000 MXN para el participante que obtenga la mejor puntuación conforme al sistema publicado y a los criterios de desempate aplicables.",
      "El premio se otorga por desempeño dentro del ranking. No se otorga por azar, sorteo, rifa, selección aleatoria ni compra de oportunidad. La inscripción no garantiza ganar premio.",
      "Para recibir el premio, el posible ganador deberá cumplir con estos Términos, haber participado de forma lícita, no haber manipulado el sistema, contar con una cuenta válida y proporcionar la información razonablemente necesaria para verificar identidad, cuenta, elegibilidad y entrega del premio."
    ]
  },
  {
    title: "12. Empates y criterios de desempate",
    paragraphs: [
      "En caso de empate en la puntuación total entre dos o más participantes, Mundial Picks aplicará criterios objetivos de desempate en el siguiente orden, con el propósito de privilegiar la precisión, consistencia y desempeño real dentro de la competencia.",
      "Primer criterio: mayor número de marcadores exactos acertados durante todo el torneo. Para efectos de este criterio, se considerarán los partidos en los que el participante haya acertado exactamente el resultado final conforme al sistema de puntuación publicado.",
      "Segundo criterio: mayor número de cruces exactos acertados en fases eliminatorias. Este criterio busca reconocer la capacidad del participante para anticipar enfrentamientos concretos dentro del bracket.",
      "Tercer criterio: mayor número de aciertos en rondas avanzadas del torneo, dando prioridad a semifinales y final, debido a que dichas fases requieren mayor precisión acumulada dentro de la predicción general.",
      "Cuarto criterio: acierto del equipo campeón del Mundial 2026. Si uno o más participantes empatados acertaron correctamente al campeón y otros no, tendrán prioridad quienes lo hayan acertado.",
      "Quinto criterio: fecha y hora más temprana de guardado de predicciones completas, siempre que dichas predicciones hayan sido enviadas antes del cierre oficial. Este criterio solo se aplicará si el empate persiste después de revisar los criterios deportivos anteriores.",
      "Si después de aplicar todos los criterios anteriores el empate persiste, el premio correspondiente será dividido en partes iguales entre los participantes que permanezcan empatados.",
      "Mundial Picks podrá realizar una revisión razonable de datos, registros de guardado, puntuaciones y resultados oficiales para resolver empates, siempre procurando actuar de forma objetiva, transparente y consistente con el sistema de puntuación publicado.",
      "Cualquier situación no prevista expresamente en estos Términos será resuelta mediante una interpretación razonable y de buena fe, priorizando la equidad entre participantes y la naturaleza de Mundial Picks como competencia de predicción deportiva basada en conocimiento y habilidad."
    ]
  },
  {
    title: "13. Conductas prohibidas",
    paragraphs: [
      "Queda prohibido manipular, interferir, alterar, sobrecargar o intentar vulnerar la plataforma, sus bases de datos, sistemas de autenticación, rankings, cálculos de puntuación o mecanismos de guardado.",
      "Queda prohibido usar bots, scripts, automatizaciones abusivas, cuentas falsas, cuentas múltiples fraudulentas, suplantación de identidad, accesos no autorizados, ingeniería inversa, explotación de errores o cualquier conducta que otorgue ventaja indebida.",
      "El incumplimiento de esta sección podrá resultar en suspensión de cuenta, cancelación de inscripción, eliminación del ranking, pérdida de elegibilidad para premio y, en su caso, acciones legales."
    ]
  },
  {
    title: "14. Contenido informativo y cambios del torneo",
    paragraphs: [
      "La plataforma puede incluir calendario, sedes, grupos, selecciones, datos históricos, curiosidades, referencias estadísticas y contenido editorial. Este contenido se proporciona con fines informativos y de entretenimiento.",
      "Aunque se buscará mantener la información actualizada, pueden existir cambios oficiales de calendario, sedes, horarios, nombres comerciales, selecciones, reglamentos deportivos o datos externos. Mundial Picks podrá actualizar, corregir o ajustar contenido cuando lo considere necesario.",
      "Las marcas, nombres de selecciones, torneos, estadios, banderas o referencias futbolísticas pertenecen a sus respectivos titulares cuando corresponda. Mundial Picks no afirma tener relación oficial con FIFA, federaciones, selecciones, estadios o patrocinadores, salvo que expresamente se indique."
    ]
  },
  {
    title: "15. Cancelaciones, reembolsos y acceso digital",
    paragraphs: [
      "Al tratarse de un producto digital con acceso a funciones, herramientas y contenido, las solicitudes de cancelación o reembolso podrán depender del estado de activación, uso del servicio, momento de la solicitud, proveedor de pago y normatividad aplicable.",
      "Cuando el usuario solicite revisión de una operación, deberá escribir al correo de contacto indicando correo de registro, fecha aproximada de inscripción, comprobante o referencia de pago, descripción del problema y solicitud concreta.",
      "No procederán reembolsos por errores de predicción, bajo desempeño en el ranking, desacuerdo con resultados oficiales del torneo, no obtención de premio o uso incompleto del servicio por decisión del usuario."
    ]
  },
  {
    title: "16. Datos personales",
    paragraphs: [
      "El tratamiento de datos personales se realizará conforme al Aviso de Privacidad publicado en la plataforma. Los datos pueden ser necesarios para crear cuenta, autenticar usuarios, guardar predicciones, calcular puntos, mostrar rankings, verificar inscripción, atender soporte y administrar la participación.",
      "El usuario deberá revisar el Aviso de Privacidad antes de inscribirse o utilizar las funciones de la plataforma."
    ]
  },
  {
    title: "17. Propiedad intelectual",
    paragraphs: [
      "El diseño, estructura, textos, organización, interfaces, sistema de puntuación, rankings, contenido propio, elementos visuales y marca Mundial Picks son propiedad de sus responsables o se utilizan bajo licencias, permisos o fuentes disponibles.",
      "El usuario recibe únicamente un derecho limitado, personal, no exclusivo, no transferible y revocable para usar la plataforma durante la vigencia de su acceso. No adquiere derechos de propiedad sobre el sitio, código, marca, diseño o contenido."
    ]
  },
  {
    title: "18. Disponibilidad, mantenimiento y terceros",
    paragraphs: [
      "Mundial Picks podrá realizar mantenimiento, mejoras, actualizaciones, correcciones o cambios técnicos. Aunque se procurará mantener el servicio disponible, no se garantiza disponibilidad ininterrumpida.",
      "La plataforma puede depender de servicios externos como hospedaje, autenticación, bases de datos, procesamiento de pagos, analítica, imágenes, correo o infraestructura de internet. Mundial Picks no será responsable por interrupciones atribuibles a terceros, fallas de red, caso fortuito o fuerza mayor."
    ]
  },
  {
    title: "19. Limitación de responsabilidad",
    paragraphs: [
      "Mundial Picks no será responsable por daños derivados de uso indebido de la cuenta, pérdida de contraseña, falta de acceso al correo, errores del dispositivo del usuario, conexión deficiente, captura incorrecta de predicciones, uso no autorizado de credenciales o incumplimiento de estos Términos.",
      "La plataforma podrá realizar ajustes razonables para corregir errores técnicos, inconsistencias o problemas operativos, procurando preservar la integridad de la competencia y la igualdad entre participantes."
    ]
  },
  {
    title: "20. Modificaciones a estos Términos",
    paragraphs: [
      "Mundial Picks podrá actualizar estos Términos y Condiciones para reflejar cambios legales, técnicos, operativos, comerciales, de pago o de funcionamiento. La versión vigente será la publicada en esta página.",
      "Cuando los cambios sean relevantes para la inscripción, premio, acceso o funcionamiento de la competencia, se procurará comunicarlo dentro de la plataforma o mediante medios razonables."
    ]
  },
  {
    title: "21. Contacto",
    paragraphs: [
      `Para dudas sobre estos Términos, funcionamiento de la plataforma, pagos, acceso, privacidad, soporte o participación, puedes escribir a: ${CONTACT_EMAIL}.`,
      "Las solicitudes deberán incluir el correo asociado a la cuenta, descripción clara del asunto y, cuando aplique, comprobante o información necesaria para identificar la operación."
    ]
  }
];

export default function TerminosPage() {
  return (
    <main className="documentPage">
      <article className="documentShell">
        <header className="documentHeader">
          <Link href="/" className="backLink">← Volver al inicio</Link>
          <p className="docLabel">Mundial Picks 2026</p>
          <h1>Términos y Condiciones</h1>
          <p className="updated">Última actualización: mayo de 2026</p>
        </header>

        <section className="introBox">
          <p>
            Estos Términos y Condiciones explican las reglas de uso, acceso, inscripción y participación en Mundial Picks 2026.
            Su finalidad es describir claramente qué producto digital se adquiere, cómo opera la competencia y por qué la plataforma
            no constituye una apuesta, sorteo, rifa ni juego de azar.
          </p>
        </section>

        <div className="documentContent">
          {sections.map((section) => (
            <section key={section.title} className="docSection">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <footer className="documentFooter">
          <p>
            Al continuar con la inscripción o uso de Mundial Picks 2026, el usuario manifiesta haber leído y aceptado estos Términos y Condiciones.
          </p>
          <div>
            <Link href="/privacidad">Aviso de Privacidad</Link>
            <Link href="/inscripcion">Volver a inscripción</Link>
          </div>
        </footer>
      </article>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f3f4f6; }

        .documentPage {
          min-height: 100vh;
          padding: 36px 18px;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
          background: #f3f4f6;
        }

        .documentShell {
          width: min(100%, 920px);
          margin: 0 auto;
          padding: 54px 64px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        }

        .backLink {
          display: inline-block;
          margin-bottom: 28px;
          color: #374151;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .backLink:hover { text-decoration: underline; }

        .documentHeader {
          padding-bottom: 24px;
          border-bottom: 1px solid #d1d5db;
        }

        .docLabel {
          margin: 0 0 8px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #111827;
          font-size: 42px;
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .updated {
          margin: 12px 0 0;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
        }

        .introBox {
          margin: 28px 0;
          padding: 18px 20px;
          border-left: 4px solid #111827;
          background: #f9fafb;
        }

        .introBox p {
          margin: 0;
          color: #374151;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 500;
        }

        .documentContent {
          display: grid;
          gap: 26px;
        }

        .docSection h2 {
          margin: 0 0 10px;
          color: #111827;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 800;
        }

        .docSection p {
          margin: 10px 0 0;
          color: #374151;
          font-size: 15px;
          line-height: 1.75;
          font-weight: 400;
        }

        .documentFooter {
          margin-top: 36px;
          padding-top: 22px;
          border-top: 1px solid #d1d5db;
        }

        .documentFooter p {
          margin: 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.65;
        }

        .documentFooter div {
          margin-top: 16px;
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .documentFooter a {
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          text-decoration: underline;
        }

        @media (max-width: 720px) {
          .documentPage { padding: 0; background: #ffffff; }
          .documentShell {
            width: 100%;
            padding: 30px 22px;
            border: 0;
            box-shadow: none;
          }
          h1 { font-size: 32px; }
          .docSection h2 { font-size: 17px; }
          .docSection p, .introBox p { font-size: 14px; }
        }
      `}</style>
    </main>
  );
}
