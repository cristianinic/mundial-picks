"use client";

import Link from "next/link";

const CONTACT_EMAIL = "mundialpicks2026@gmail.com";

const sections = [
  {
    title: "1. Identidad del responsable",
    paragraphs: [
      "Para efectos del presente Aviso de Privacidad, el responsable del tratamiento de los datos personales es Mundial Picks 2026, plataforma digital de predicción deportiva, ranking y contenido informativo relacionada con el torneo Mundial 2026.",
      `Para cualquier asunto relacionado con privacidad, datos personales, derechos ARCO, soporte o aclaraciones sobre este Aviso, el titular puede escribir al correo electrónico: ${CONTACT_EMAIL}.`,
      "Este Aviso de Privacidad se pone a disposición de los usuarios antes de recabar datos personales mediante el sitio, formularios, registro, inicio de sesión, inscripción, guardado de predicciones o uso de funcionalidades de la plataforma."
    ]
  },
  {
    title: "2. Datos personales que pueden recabarse",
    paragraphs: [
      "Mundial Picks podrá recabar datos personales de identificación, contacto, autenticación y uso de la plataforma. Estos datos pueden incluir: correo electrónico, nombre de usuario, país o bandera seleccionada, identificador público de jugador, estado de inscripción, predicciones, picks, puntajes, posición en ranking, actividad dentro de la plataforma y fecha de registro o acceso.",
      "También podrán tratarse datos técnicos necesarios para seguridad y funcionamiento, tales como información de navegador, dispositivo, dirección IP, registros de acceso, eventos técnicos, cookies o identificadores similares cuando sean necesarios para operar, proteger o mejorar el servicio.",
      "Cuando se habilite un proveedor externo de pagos, dicho proveedor podrá recabar y procesar datos necesarios para realizar la operación. Mundial Picks no almacena directamente los datos completos de tarjetas bancarias u otros instrumentos financieros sensibles cuando el pago es procesado por un tercero autorizado."
    ]
  },
  {
    title: "3. Datos personales sensibles",
    paragraphs: [
      "Mundial Picks no solicita intencionalmente datos personales sensibles para operar la plataforma. No se requiere proporcionar información sobre origen racial o étnico, estado de salud, religión, afiliación sindical, opiniones políticas, preferencia sexual, datos biométricos o información financiera sensible fuera del proceso ordinario del proveedor de pagos.",
      "El usuario deberá abstenerse de enviar datos sensibles por formularios, mensajes o canales de soporte, salvo que exista una causa justificada y expresamente solicitada."
    ]
  },
  {
    title: "4. Finalidades principales del tratamiento",
    paragraphs: [
      "Los datos personales se utilizan para crear, autenticar y administrar cuentas de usuario; permitir el acceso a la plataforma; activar o verificar la inscripción; guardar predicciones; calcular puntuaciones; mostrar ranking; identificar participantes; consultar historial de picks; prevenir abuso; atender soporte y operar la competencia de predicción deportiva.",
      "También se utilizan para permitir el acceso a contenido informativo, calendario, datos formidables, sistema de puntuación, secciones exclusivas y otras funciones internas de Mundial Picks 2026.",
      "El tratamiento de estos datos es necesario para prestar el servicio digital contratado y permitir que la plataforma funcione de manera ordenada, segura y verificable."
    ]
  },
  {
    title: "5. Finalidades secundarias",
    paragraphs: [
      "De forma secundaria, Mundial Picks podrá utilizar información de uso para generar estadísticas internas, mejorar experiencia de usuario, corregir errores técnicos, evaluar rendimiento del sitio, optimizar contenido, detectar problemas de seguridad y comunicar novedades relacionadas con la plataforma.",
      "En caso de enviar comunicaciones promocionales no indispensables, el usuario podrá solicitar dejar de recibirlas escribiendo al correo de contacto indicado en este Aviso."
    ]
  },
  {
    title: "6. Naturaleza del servicio y datos asociados al ranking",
    paragraphs: [
      "Mundial Picks 2026 es una plataforma digital de predicción deportiva basada en conocimiento, análisis y habilidad. No vende apuestas, rifas, boletos de azar, sorteos ni participaciones aleatorias.",
      "El tratamiento de predicciones, puntos, ranking e identificador público es necesario para operar la competencia. Al participar, el usuario entiende que ciertos datos de clasificación, como nombre de usuario, país o bandera, puntos y posición, pueden mostrarse dentro de rankings o vistas públicas de la plataforma.",
      "El premio, en caso de corresponder, se determina por desempeño conforme al sistema de puntuación publicado y no por suerte, sorteo o mecanismo aleatorio."
    ]
  },
  {
    title: "7. Transferencias y encargados del tratamiento",
    paragraphs: [
      "Mundial Picks podrá utilizar proveedores tecnológicos para operar el servicio, tales como servicios de hospedaje, autenticación, base de datos, procesamiento de pagos, analítica, monitoreo, correo electrónico, soporte técnico o seguridad.",
      "Dichos proveedores podrán tratar datos personales únicamente en la medida necesaria para prestar sus servicios a Mundial Picks y conforme a sus propias políticas, contratos o términos aplicables.",
      "Cuando el usuario realice pagos mediante un tercero, como Mercado Pago, Stripe u otro proveedor que se habilite, la transacción podrá estar sujeta a los términos y avisos de privacidad del proveedor de pago correspondiente."
    ]
  },
  {
    title: "8. Uso de cookies y tecnologías similares",
    paragraphs: [
      "La plataforma puede utilizar cookies, almacenamiento local, identificadores técnicos o tecnologías similares para mantener sesión, recordar preferencias, mejorar funcionamiento, proteger la cuenta, medir uso del sitio y ofrecer una experiencia adecuada.",
      "El usuario puede configurar su navegador para bloquear o eliminar cookies; sin embargo, algunas funciones de autenticación, guardado de predicciones o acceso pueden verse afectadas."
    ]
  },
  {
    title: "9. Conservación de datos",
    paragraphs: [
      "Los datos personales se conservarán durante el tiempo necesario para operar la cuenta, prestar el servicio, mantener registros de participación, calcular ranking, atender aclaraciones, verificar acceso, cumplir obligaciones aplicables y proteger la seguridad de la plataforma.",
      "Una vez cumplidas las finalidades, los datos podrán eliminarse, anonimizarse o conservarse bloqueados cuando exista obligación legal, necesidad de defensa, prevención de fraude, aclaraciones pendientes o interés legítimo relacionado con la operación del servicio."
    ]
  },
  {
    title: "10. Medidas de seguridad",
    paragraphs: [
      "Mundial Picks implementará medidas administrativas, técnicas y razonables para proteger los datos personales contra daño, pérdida, alteración, destrucción, acceso no autorizado, uso indebido o divulgación no autorizada.",
      "Ningún sistema digital es absolutamente invulnerable. El usuario también debe proteger su cuenta, usar contraseñas seguras, no compartir credenciales y cerrar sesión en dispositivos compartidos."
    ]
  },
  {
    title: "11. Derechos ARCO",
    paragraphs: [
      "El titular de datos personales puede solicitar el acceso, rectificación, cancelación u oposición respecto de sus datos personales, conocidos como derechos ARCO, cuando legalmente proceda.",
      `Para ejercer estos derechos, el titular deberá enviar una solicitud al correo ${CONTACT_EMAIL}, indicando nombre, correo asociado a la cuenta, derecho que desea ejercer, descripción clara de la solicitud y cualquier información necesaria para identificar su cuenta.`,
      "La solicitud será atendida conforme a los plazos y requisitos aplicables. En algunos casos, la cancelación u oposición al tratamiento puede impedir la continuidad del servicio, ya que ciertos datos son necesarios para operar la cuenta, guardar predicciones o mantener rankings."
    ]
  },
  {
    title: "12. Revocación del consentimiento y limitación de uso",
    paragraphs: [
      "El usuario puede solicitar la revocación de su consentimiento o la limitación del uso de sus datos personales cuando proceda legalmente. La solicitud deberá enviarse al correo de contacto indicado en este Aviso.",
      "La revocación no tendrá efectos retroactivos y puede no proceder cuando los datos sean necesarios para cumplir obligaciones, mantener registros operativos, atender aclaraciones, proteger derechos o prestar el servicio contratado."
    ]
  },
  {
    title: "13. Menores de edad",
    paragraphs: [
      "Mundial Picks está dirigido a usuarios con capacidad legal para contratar servicios digitales. Si una persona menor de edad desea utilizar la plataforma, deberá contar con autorización y supervisión de madre, padre, tutor o representante legal, conforme a la legislación aplicable.",
      "La plataforma podrá restringir o cancelar cuentas cuando advierta que fueron creadas incumpliendo esta disposición."
    ]
  },
  {
    title: "14. Cambios al Aviso de Privacidad",
    paragraphs: [
      "Mundial Picks podrá modificar este Aviso de Privacidad para reflejar cambios legales, técnicos, operativos, comerciales, de proveedores, de medios de pago o de funcionamiento de la plataforma.",
      "La versión vigente estará disponible en esta misma página. Cuando los cambios sean relevantes, se procurará informar mediante la plataforma o medios razonables de comunicación."
    ]
  },
  {
    title: "15. Contacto",
    paragraphs: [
      `Para cualquier duda, solicitud, aclaración o ejercicio de derechos relacionados con privacidad y datos personales, el usuario podrá escribir a: ${CONTACT_EMAIL}.`,
      "La solicitud deberá incluir información suficiente para identificar la cuenta y atender el caso de forma adecuada."
    ]
  }
];

export default function PrivacidadPage() {
  return (
    <main className="documentPage">
      <article className="documentShell">
        <header className="documentHeader">
          <Link href="/" className="backLink">← Volver al inicio</Link>
          <p className="docLabel">Mundial Picks 2026</p>
          <h1>Aviso de Privacidad</h1>
          <p className="updated">Última actualización: mayo de 2026</p>
        </header>

        <section className="introBox">
          <p>
            Este Aviso de Privacidad explica qué datos personales puede tratar Mundial Picks 2026,
            para qué finalidades se utilizan, cómo pueden compartirse con proveedores necesarios,
            qué derechos tiene el titular y cómo puede ejercerlos.
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
            Al crear una cuenta, inscribirte o utilizar Mundial Picks 2026, reconoces que has leído este Aviso de Privacidad.
          </p>
          <div>
            <Link href="/terminos">Términos y Condiciones</Link>
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
