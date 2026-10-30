// Marcação simples do editor de checklists: **negrito** e ==destaque==
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|==.+?==)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.length > 4 && part.startsWith("==") && part.endsWith("==")) {
          return <mark key={i} className="bg-amber-200 text-amber-950 font-semibold rounded px-1">{part.slice(2, -2)}</mark>;
        }
        return part;
      })}
    </>
  );
}
