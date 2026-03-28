export function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
      <div
        className="size-10 rounded-full shrink-0"
        style={{ background: "rgba(20,184,166,0.08)" }}
      />
      <div className="flex-1 space-y-2">
        <div
          className="h-3 w-2/3 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="h-2.5 w-1/2 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
      <div
        className="h-2.5 w-8 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </div>
  );
}