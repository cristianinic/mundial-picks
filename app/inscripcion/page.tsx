"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const benefits = [
  "Crear y guardar tu predicción completa del Mundial 2026.",
  "Competir en el ranking global contra otros participantes.",
  "Consultar calendario, grupos, selecciones y cruces del torneo.",
  "Desbloquear datos formidables y contenido extra mundialista.",
];

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    text: "Regístrate con tu correo para que tus predicciones queden ligadas a tu usuario.",
  },
  {
    number: "02",
    title: "Activa tu acceso",
    text: "Completa tu inscripción para activar tu acceso y dejar listo tu usuario para guardar predicciones.",
  },
  {
    number: "03",
    title: "Llena tus picks",
    text: "Elige resultados, clasificados, cruces y campeón antes del cierre de predicciones.",
  },
];

export default function InscripcionPage() {
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function activarInscripcion() {
  if (activating) return;

  if (!acceptedTerms) {
    setMessageType("error");
    setMessage(
      "Para continuar, primero acepta los Términos y Condiciones y el Aviso de Privacidad."
    );
    return;
  }

  setMessage("");
  setMessageType("");
  setActivating(true);

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user?.email) {
      setMessageType("error");
      setMessage("Primero inicia sesión para activar tu inscripción.");
      return;
    }

    const email = authData.user.email.trim().toLowerCase();

    const profileResponse = await fetch("/api/create-user-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.log(profileData);
      setMessageType("error");
      setMessage(
        profileData?.error ??
          "No se pudo preparar tu perfil. Inténtalo de nuevo."
      );
      return;
    }

    const response = await fetch("/api/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      setMessageType("error");
      setMessage(data?.error ?? "No se pudo iniciar el pago. Inténtalo de nuevo.");
      return;
    }

    const checkoutUrl = data.init_point;

    if (!checkoutUrl) {
      setMessageType("error");
      setMessage("Mercado Pago no devolvió una liga de pago. Inténtalo de nuevo.");
      return;
    }

    window.location.href = checkoutUrl;
  } catch (error) {
    console.log(error);
    setMessageType("error");
    setMessage("Ocurrió un error al preparar tu inscripción. Inténtalo de nuevo.");
  } finally {
    setActivating(false);
  }
}

  return (
    <main className="inscripcionPage">
      <div className="pageShell">
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandBall">⚽</span>
            <span>
              <span className="brandTitle">Mundial Picks</span>
              <span className="brandSub">Inscripción</span>
            </span>
          </Link>

          <nav className="navLinks" aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/picks">Predicciones</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/como-se-puntua">Cómo se puntúa</Link>
          </nav>
        </header>

        <section className="heroPanel">
          <div className="heroContent">
            <span className="eyebrow">Inscripción Mundial Picks 2026</span>
            <h1>Inscríbete y compite por $20,000 MXN.</h1>
            <p className="heroText">
              Activa tu acceso para guardar tus predicciones, entrar al ranking global, desbloquear contenido extra y competir por el premio al mejor predictor del Mundial 2026.
            </p>

            <div className="heroActions">
              <button className="primaryButton" type="button" onClick={activarInscripcion} disabled={activating || !acceptedTerms}>
                {activating ? "Redirigiendo..." : "Inscribirme ahora"}
              </button>
              <Link href="/picks" className="secondaryButton">
                Ver predicciones <span>→</span>
              </Link>
            </div>

            <div className="legalCheck">
              <label>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  Acepto los <Link href="/terminos">Términos y Condiciones</Link> y el <Link href="/privacidad">Aviso de Privacidad</Link>.
                </span>
              </label>
            </div>

            <p className="paymentNote">
              Acceso único para todo el torneo. Podrás guardar tus predicciones, desbloquear contenido exclusivo y competir por el premio al mejor predictor.
            </p>

            {message && (
              <p className={messageType === "success" ? "activationMessage success" : "activationMessage error"}>
                {message}
              </p>
            )}
          </div>

          <aside className="priceCard" aria-label="Resumen de inscripción">
            <div className="priceTop">
              <span>Premio principal</span>
              <strong>$20,000 MXN</strong>
            </div>

            <div className="accessBox">
              <span className="lockIcon">🔒</span>
              <div>
                <strong>Acceso exclusivo</strong>
                <p>Solo participantes inscritos podrán guardar picks y desbloquear contenido completo.</p>
              </div>
            </div>

            <div className="includedList">
              <p>Tu inscripción incluye:</p>
              {benefits.map((benefit) => (
                <div key={benefit} className="includedItem">
                  <span>✓</span>
                  <small>{benefit}</small>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="stepsPanel">
          <div className="sectionIntro">
            <span>Cómo funciona</span>
            <h2>Participar debe ser claro, rápido y sin confusiones.</h2>
          </div>

          <div className="stepsGrid">
            {steps.map((step) => (
              <div key={step.number} className="stepCard">
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="finalCta">
          <div>
            <h2>¿Quieres revisar primero cómo se juega?</h2>
            <p>Explora la página de predicciones y el sistema de puntos antes de inscribirte.</p>
          </div>

          <div className="finalActions">
            <Link href="/picks" className="secondaryButton compact">
              Ver predicciones
            </Link>
            <Link href="/como-se-puntua" className="secondaryButton compact light">
              ⓘ Cómo se puntúa
            </Link>
          </div>
        </section>

        <section className="productDisclosure">
          <div>
            <span>Qué estás adquiriendo</span>
            <h2>Acceso digital a Mundial Picks 2026</h2>
            <p>
              La inscripción corresponde a un producto digital de acceso único para el torneo Mundial 2026.
              Al inscribirte desbloqueas herramientas y contenido dentro de la plataforma: guardar tus predicciones,
              consultar tu posición en el ranking global, acceder a datos formidables, revisar calendario, grupos,
              selecciones y sistema de puntuación.
            </p>
          </div>

          <div className="disclosureGrid">
            <article>
              <strong>Producto vendido</strong>
              <p>Acceso digital a la plataforma Mundial Picks 2026 y sus funciones de predicción, ranking y contenido informativo.</p>
            </article>
            <article>
              <strong>Vigencia del acceso</strong>
              <p>El acceso aplica durante el ciclo del torneo Mundial 2026 y hasta el cierre operativo del ranking final.</p>
            </article>
            <article>
              <strong>Premio</strong>
              <p>
                El premio de $20,000 MXN se entrega al participante con mayor puntuación conforme al sistema publicado.
                En caso de empate en la puntuación final, primero se aplicarán los criterios de desempate establecidos en los Términos y Condiciones.
                Si después de aplicar dichos criterios el empate persiste, el premio será dividido en partes iguales entre los participantes empatados.
              </p>
            </article>
            <article>
              <strong>No es apuesta ni sorteo</strong>
              <p>No se vende una apuesta, boleto de azar, rifa o participación aleatoria. La clasificación depende del desempeño de tus predicciones.</p>
            </article>
          </div>
        </section>

        <section className="legalNote">
          <strong>Información importante</strong>
          <p>
            Mundial Picks es una competencia de predicción deportiva basada en conocimiento, análisis y habilidad.
            La inscripción otorga acceso a una plataforma digital con herramientas de predicción, ranking global y contenido informativo.
            El participante con mayor puntuación conforme al sistema publicado será considerado el mejor predictor del torneo.
          </p>
          <small>
            Este producto no constituye una apuesta, rifa, sorteo, juego de azar ni venta de boleto aleatorio. La participación no garantiza obtener premio.
            Al inscribirte aceptas los <Link href="/terminos">Términos y Condiciones</Link> y el <Link href="/privacidad">Aviso de Privacidad</Link>.
          </small>
        </section>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #03060b;
        }

        .inscripcionPage {
          min-height: 100vh;
          color: #ffffff;
          padding: 8px 14px 22px;
          font-family: Arial, Helvetica, sans-serif;
          background:
            radial-gradient(circle at 82% 0%, rgba(239, 68, 68, 0.14), transparent 28%),
            radial-gradient(circle at 12% 6%, rgba(245, 158, 11, 0.1), transparent 24%),
            #03060b;
        }

        .pageShell {
          width: min(100%, 1500px);
          margin: 0 auto;
        }

        .topbar,
        .heroPanel,
        .stepsPanel,
        .finalCta,
        .productDisclosure {
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
          margin-bottom: 10px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
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
          font-weight: 850;
        }

        .navLinks a {
          color: rgba(255,255,255,.82);
          text-decoration: none;
        }

        .navLinks a:hover {
          color: #ef4444;
        }

        .heroPanel {
          min-height: 500px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 430px;
          gap: 28px;
          align-items: center;
          padding: 46px;
          background:
            linear-gradient(90deg, rgba(3,6,11,1) 0%, rgba(6,13,22,.96) 45%, rgba(7,11,18,.72) 100%),
            url("/datos-formidables-hero.png");
          background-size: cover;
          background-position: center;
        }

        .heroPanel:after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(170deg, rgba(255,255,255,.024) 0 1px, transparent 1px 18px),
            radial-gradient(circle at 82% 45%, rgba(251,191,36,.2), transparent 30%);
          pointer-events: none;
        }

        .heroContent,
        .priceCard {
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          display: inline-flex;
          color: #fbbf24;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .09em;
        }

        h1 {
          max-width: 760px;
          margin: 12px 0 0;
          font-size: clamp(44px, 5vw, 74px);
          line-height: .9;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.06em;
        }

        .heroText {
          max-width: 620px;
          margin: 18px 0 0;
          color: rgba(255,255,255,.72);
          font-size: 17px;
          line-height: 1.5;
          font-weight: 650;
        }

        .heroActions,
        .finalActions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .heroActions {
          margin-top: 28px;
        }

        .primaryButton,
        .secondaryButton {
          min-height: 48px;
          border-radius: 10px;
          padding: 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 950;
          text-transform: uppercase;
          transition: transform .16s ease, background .16s ease, border-color .16s ease;
        }

        .primaryButton {
          border: 0;
          color: white;
          background: #ef111b;
          box-shadow: 0 18px 38px rgba(239,17,27,.24);
          cursor: pointer;
          opacity: 1;
        }

        .primaryButton:disabled {
          opacity: .72;
          cursor: not-allowed;
        }

        .activationMessage {
          max-width: 560px;
          margin: 14px 0 0;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 850;
        }

        .activationMessage.success {
          color: #86efac;
          background: rgba(34,197,94,.12);
          border: 1px solid rgba(34,197,94,.28);
        }

        .activationMessage.error {
          color: #fecaca;
          background: rgba(239,68,68,.13);
          border: 1px solid rgba(239,68,68,.32);
        }

        .secondaryButton {
          color: rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(0,0,0,.24);
        }

        .primaryButton:hover:not(:disabled),
        .secondaryButton:hover {
          transform: translateY(-1px);
        }

        .primaryButton:hover:not(:disabled) {
          background: #ff1f2a;
        }

        .secondaryButton:hover {
          background: rgba(255,255,255,.08);
        }

        .secondaryButton.compact {
          min-height: 44px;
          padding: 0 18px;
          font-size: 12px;
        }

        .secondaryButton.light {
          background: rgba(255,255,255,.07);
        }

        .legalCheck {
          max-width: 620px;
          margin-top: 14px;
          color: rgba(255,255,255,.66);
          font-size: 13px;
          line-height: 1.45;
          font-weight: 750;
        }

        .legalCheck label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .legalCheck input {
          width: 18px;
          height: 18px;
          margin-top: 1px;
          flex: 0 0 auto;
          accent-color: #ef111b;
          cursor: pointer;
        }

        .legalCheck a {
          color: #fbbf24;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 950;
        }

        .paymentNote {
          max-width: 560px;
          margin: 16px 0 0;
          color: rgba(255,255,255,.52);
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .priceCard {
          border-radius: 22px;
          padding: 24px;
          background: rgba(8, 12, 19, .86);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 24px 60px rgba(0,0,0,.38);
          backdrop-filter: blur(8px);
        }

        .priceTop {
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,.12);
        }

        .priceTop span {
          display: block;
          color: rgba(255,255,255,.56);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .priceTop strong {
          display: block;
          margin-top: 8px;
          color: #fbbf24;
          font-size: 42px;
          line-height: .95;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .accessBox {
          margin-top: 18px;
          display: flex;
          gap: 14px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.28);
        }

        .lockIcon {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(239,68,68,.18);
        }

        .accessBox strong {
          display: block;
          font-size: 15px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .accessBox p {
          margin: 6px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 650;
        }

        .includedList {
          margin-top: 18px;
          display: grid;
          gap: 10px;
        }

        .includedList p {
          margin: 0 0 2px;
          color: rgba(255,255,255,.88);
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .includedItem {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 13px;
          background: rgba(0,0,0,.18);
          border: 1px solid rgba(255,255,255,.07);
        }

        .includedItem span {
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(34,197,94,.14);
          color: #22c55e;
          font-weight: 950;
        }

        .includedItem small {
          color: rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 700;
        }

        .stepsPanel {
          margin-top: 10px;
          border-radius: 16px;
          padding: 28px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
        }

        .sectionIntro span {
          color: #ef4444;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .sectionIntro h2 {
          margin: 8px 0 0;
          font-size: 25px;
          line-height: 1.05;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.035em;
        }

        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .stepCard {
          min-height: 180px;
          border-radius: 16px;
          padding: 18px;
          background: rgba(0,0,0,.16);
          border: 1px solid rgba(255,255,255,.08);
        }

        .stepCard span {
          color: #fbbf24;
          font-size: 12px;
          font-weight: 950;
        }

        .stepCard h3 {
          margin: 12px 0 0;
          font-size: 18px;
          line-height: 1.05;
          font-weight: 950;
          text-transform: uppercase;
        }

        .stepCard p {
          margin: 10px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 13px;
          line-height: 1.45;
          font-weight: 650;
        }

        .finalCta {
          margin-top: 10px;
          border-radius: 16px;
          padding: 22px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .finalCta h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.025em;
        }

        .finalCta p {
          margin: 7px 0 0;
          color: rgba(255,255,255,.56);
          font-size: 14px;
          font-weight: 650;
        }


        .productDisclosure {
          margin-top: 10px;
          border-radius: 16px;
          padding: 24px 28px;
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 22px;
        }

        .productDisclosure span {
          display: block;
          color: #fbbf24;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .productDisclosure h2 {
          margin: 8px 0 0;
          color: white;
          font-size: 28px;
          line-height: .98;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -.04em;
        }

        .productDisclosure > div > p {
          margin: 12px 0 0;
          color: rgba(255,255,255,.64);
          font-size: 14px;
          line-height: 1.5;
          font-weight: 700;
        }

        .disclosureGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .disclosureGrid article {
          border-radius: 14px;
          padding: 15px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.18);
        }

        .disclosureGrid strong {
          display: block;
          color: white;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .disclosureGrid p {
          margin: 8px 0 0;
          color: rgba(255,255,255,.62);
          font-size: 13px;
          line-height: 1.42;
          font-weight: 650;
        }

        .legalNote {
          margin-top: 10px;
          border-radius: 16px;
          padding: 18px 22px;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(245, 158, 11, 0.06);
          color: rgba(255,255,255,.72);
        }

        .legalNote strong {
          display: block;
          color: #fbbf24;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .legalNote p {
          margin: 8px 0 0;
          max-width: 980px;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .legalNote a {
          color: #fbbf24;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 950;
        }

        .legalNote small {
          display: block;
          margin-top: 10px;
          max-width: 980px;
          color: rgba(255,255,255,.52);
          font-size: 12px;
          line-height: 1.45;
          font-weight: 700;
        }

        @media (max-width: 1000px) {
          .navLinks {
            display: none;
          }

          .heroPanel,
          .stepsPanel {
            grid-template-columns: 1fr;
          }

          .priceCard {
            max-width: 520px;
          }

          .stepsGrid {
            grid-template-columns: 1fr;
          }

          .productDisclosure {
            grid-template-columns: 1fr;
          }

          .disclosureGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .inscripcionPage {
            padding: 8px;
          }

          .topbar {
            padding: 16px;
          }

          .brandTitle {
            font-size: 20px;
          }

          .heroPanel {
            min-height: auto;
            padding: 28px 20px;
          }

          h1 {
            font-size: 42px;
          }

          .heroActions,
          .finalActions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .primaryButton,
          .secondaryButton {
            width: 100%;
          }

          .priceTop strong {
            font-size: 34px;
          }

          .stepsPanel,
          .finalCta,
          .productDisclosure {
            padding: 22px 20px;
          }

          .finalCta {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </main>
  );
}
