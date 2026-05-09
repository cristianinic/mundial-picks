import Link from "next/link";

export default function PagoFailurePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#020617", color: "white", fontFamily: "Arial", textAlign: "center", padding: 24 }}>
      <div>
        <h1>Pago no completado</h1>
        <p>No se pudo procesar tu inscripción.</p>
        <Link href="/inscripcion" style={{ color: "#fbbf24" }}>Intentar de nuevo</Link>
      </div>
    </main>
  );
}