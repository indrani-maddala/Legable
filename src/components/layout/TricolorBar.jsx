export default function TricolorBar() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      <span className="flex-1 bg-saffron" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-india-green" />
    </div>
  );
}
