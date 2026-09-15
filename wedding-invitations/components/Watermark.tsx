/**
 * Watermark — sobreposição diagonal "USO NÃO AUTORIZADO"
 * Usar dentro de um container position:relative / overflow:hidden
 */
export function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      {/* Repetição de linhas diagonais */}
      <div
        style={{
          position: "absolute",
          inset: "-60%",
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
          transform: "rotate(-35deg)",
          userSelect: "none",
        }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "3rem",
              whiteSpace: "nowrap",
            }}
          >
            {Array.from({ length: 6 }).map((_, j) => (
              <span
                key={j}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "rgba(0,0,0,0.18)",
                  textTransform: "uppercase",
                  fontFamily: "sans-serif",
                }}
              >
                USO NÃO AUTORIZADO
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
