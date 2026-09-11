import { createFileRoute } from "@tanstack/react-router";
import { Download, FolderOpen, Link2, Save, Upload } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Candy Counter — QR Capsule Maker" },
      { name: "description", content: "Turn links, files, and folders into playful, downloadable QR capsules." },
      { property: "og:title", content: "Candy Counter — QR Capsule Maker" },
      { property: "og:description", content: "Turn links, files, and folders into playful, downloadable QR capsules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CandyCounter,
});

type SourceType = "link" | "file" | "folder";
type Ink = "ink" | "coral" | "teal" | "gold";

const inks: { name: Ink; label: string; hex: string; className: string }[] = [
  { name: "ink", label: "Ink", hex: "#241A12", className: "bg-ink" },
  { name: "coral", label: "Coral", hex: "#EA3D5A", className: "bg-coral" },
  { name: "teal", label: "Teal", hex: "#158B86", className: "bg-teal" },
  { name: "gold", label: "Gold", hex: "#C28F10", className: "bg-gold" },
];

function CandyCounter() {
  const [sourceType, setSourceType] = useState<SourceType>("link");
  const [value, setValue] = useState("https://example.com/my-sweet-link");
  const [label, setLabel] = useState("my-sweet-link");
  const [ink, setInk] = useState<Ink>("ink");
  const [quietZone, setQuietZone] = useState([4]);
  const [qrUrl, setQrUrl] = useState("");
  const [dispensed, setDispensed] = useState(42);
  const [turning, setTurning] = useState(false);
  const [message, setMessage] = useState("Ready for a link");
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const selectedInk = useMemo(
    () => inks.find((item) => item.name === ink) ?? { name: "ink" as const, label: "Ink", hex: "#241A12", className: "bg-ink" },
    [ink],
  );

  useEffect(() => {
    if (!value) { setQrUrl(""); return; }
    QRCode.toDataURL(value, { width: 512, margin: quietZone[0], color: { dark: selectedInk.hex, light: "#F7E8D0" }, errorCorrectionLevel: "H" })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [value, quietZone, selectedInk]);

  const chooseType = (type: SourceType) => {
    setSourceType(type);
    setMessage(type === "link" ? "Ready for a link" : `Choose a ${type}`);
    if (type === "file") fileInput.current?.click();
    if (type === "folder") folderInput.current?.click();
  };

  const readSelection = (files: FileList | null, type: SourceType) => {
    if (!files?.length) return;
    const first = files[0];
    if (!first) return;
    const names = Array.from(files).slice(0, 40).map((file) => file.webkitRelativePath || file.name);
    const payload = type === "folder"
      ? `Folder: ${first.webkitRelativePath.split("/")[0]}\nFiles:\n${names.join("\n")}`
      : `File: ${first.name}\nType: ${first.type || "unknown"}\nSize: ${first.size} bytes`;
    setValue(payload);
    setLabel(type === "folder" ? first.webkitRelativePath.split("/")[0] : first.name);
    setMessage(`${files.length} ${files.length === 1 ? "item" : "items"} loaded`);
  };

  const dispense = () => {
    if (!value.trim()) { setMessage("Feed the machine first"); return; }
    setTurning(true);
    setDispensed((count) => count + 1);
    setMessage("Capsule dispensed");
    window.setTimeout(() => setTurning(false), 700);
  };

  const download = () => {
    if (!qrUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrUrl;
    anchor.download = `${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "candy-qr"}.png`;
    anchor.click();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 top-1/2 h-[380px] w-[380px] rounded-full bg-coral/15 blur-3xl" />
      <div className="relative mx-auto max-w-[1180px] px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-foreground/15 pb-4 font-head">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-coral text-background ring-1 ring-foreground/20">CC</span>
            <div><p className="text-[15px] font-bold leading-none">CANDY COUNTER</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/50">QR capsule maker</p></div>
          </div>
          <nav aria-label="Sections" className="hidden gap-6 text-xs uppercase tracking-[0.15em] text-foreground/60 sm:flex"><span>Maker</span><span className="text-foreground/30">/</span><span>Capsules</span><span className="text-foreground/30">/</span><span>How it works</span></nav>
        </header>

        <main className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <section className="rounded-lg border border-foreground/20 bg-card p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between font-head"><h1 className="text-2xl font-bold sm:text-[28px]">Feed the machine.</h1><span className="rounded-md bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ring-1 ring-foreground/20">{message}</span></div>
            <StepLabel>01 · Source type</StepLabel>
            <div className="grid grid-cols-3 gap-2">
              {(["link", "file", "folder"] as SourceType[]).map((type) => <Button key={type} type="button" variant={sourceType === type ? "secondary" : "outline"} className="h-11 font-head text-xs uppercase" onClick={() => chooseType(type)}>{type === "link" ? <Link2 /> : type === "file" ? <Upload /> : <FolderOpen />}{type}</Button>)}
            </div>
            <input ref={fileInput} className="sr-only" type="file" onChange={(event) => readSelection(event.target.files, "file")} />
            <input ref={folderInput} className="sr-only" type="file" {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)} onChange={(event) => readSelection(event.target.files, "folder")} />

            <StepLabel className="mt-5">02 · Insert source</StepLabel>
            <div className="rounded-md border border-foreground/20 bg-background/70 p-3">
              <label htmlFor="source" className="text-[10px] uppercase tracking-[0.15em] text-foreground/50">{sourceType === "link" ? "URL" : "Loaded item"}</label>
              <div className="mt-1 flex items-center gap-2">
                <input id="source" value={value} onChange={(event) => { setValue(event.target.value); setLabel(event.target.value.replace(/^https?:\/\//, "").split("/")[0] || "new-capsule"); }} readOnly={sourceType !== "link"} placeholder="Paste a link here" className="w-full bg-transparent text-[13px] outline-none placeholder:text-foreground/30" />
                <span className="rounded bg-foreground px-2 py-1 font-head text-[10px] font-bold uppercase text-background">Set</span>
              </div>
            </div>

            <StepLabel className="mt-5">03 · Customize capsule</StepLabel>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="mb-2 flex justify-between text-[11px] text-foreground/60"><span>Module ink</span><span className="font-head text-[10px]">{String(inks.findIndex((item) => item.name === ink) + 1).padStart(2, "0")}</span></div><div className="flex gap-2">{inks.map((item) => <button key={item.name} type="button" aria-label={`${item.label} QR ink`} onClick={() => setInk(item.name)} className={`size-7 rounded ${item.className} ring-1 ring-foreground/20 ${ink === item.name ? "outline-2 outline-offset-2 outline-foreground" : ""}`} />)}</div></div>
              <div><div className="mb-3 flex justify-between text-[11px] text-foreground/60"><span>Quiet zone</span><span className="font-head text-[10px]">0{quietZone[0]}</span></div><Slider value={quietZone} min={1} max={8} step={1} onValueChange={setQuietZone} aria-label="QR quiet zone" /></div>
            </div>
            <Button variant="candy" size="crank" className="mt-6" onClick={dispense}>Turn crank · Dispense QR</Button>
          </section>

          <section className="relative flex flex-col rounded-lg border border-foreground/20 bg-card/70 p-5 backdrop-blur-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between font-head"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">Dispenser · live preview</p><p className="text-xs font-bold text-coral">CAPSULE #{String(dispensed).padStart(3, "0")}</p></div>
            <div className="grid flex-1 grid-cols-2 gap-4">
              <div className="rounded-lg border-2 border-foreground/20 bg-background/70 p-4 font-head"><p className="text-[9px] uppercase tracking-[0.2em] text-foreground/50">Hopper</p><div className="mt-4 flex flex-wrap justify-center gap-2">{["bg-coral","bg-teal","bg-gold","bg-ink","bg-coral","bg-teal"].map((color, index) => <span key={index} style={{ animationDelay: `${index * 50}ms` }} className={`size-9 rounded-full ring-1 ring-foreground/25 candy-settle ${color} ${index % 2 ? "mt-3" : ""}`} />)}</div></div>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-foreground/20 bg-background/70 p-4 font-head"><p className="self-start text-[9px] uppercase tracking-[0.2em] text-foreground/50">Crank</p><div className={`relative mt-3 size-16 ${turning ? "crank-turn" : ""}`}><span className="absolute inset-0 rounded-full border-4 border-foreground/25" /><span className="absolute inset-2 rounded-full border-2 border-foreground/15" /><span className="absolute left-1/2 top-0 h-1/2 w-1.5 -translate-x-1/2 rounded-full bg-coral" /><span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" /></div></div>
            </div>
            <div className="mt-4 rounded-lg border-2 border-foreground/20 bg-background/70 p-4"><p className="font-head text-[9px] uppercase tracking-[0.2em] text-foreground/50">Eject tray · your QR</p><div className="mt-3 flex items-center gap-4">{qrUrl ? <img key={dispensed} src={qrUrl} alt={`QR code for ${label}`} className="size-28 rounded-md ring-1 ring-foreground/20 candy-drop" /> : <div className="grid size-28 place-items-center rounded-md border border-dashed border-foreground/30 text-center text-xs text-foreground/50">Awaiting<br />source</div>}<div className="min-w-0 flex-1"><p className="truncate font-head text-[13px] font-bold">{label}</p><p className="mt-1 text-[11px] text-foreground/55">capsule #{String(dispensed).padStart(3, "0")} · 512×512</p><div className="mt-3 flex gap-2"><Button variant="machine" size="sm" onClick={download}><Download /> Download</Button><Button variant="outline" size="sm" onClick={() => setMessage("Saved on this counter")}><Save /> Save</Button></div></div></div></div>
          </section>
        </main>
      </div>
      <section className="relative mt-5 border-t border-foreground/15"><div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8"><p className="font-head text-[11px] uppercase tracking-[0.2em] text-foreground/55">Your capsule shelf · {dispensed} dispensed</p><div className="flex -space-x-2">{["bg-coral","bg-teal","bg-gold","bg-ink"].map((color) => <span key={color} className={`size-8 rounded-full ring-2 ring-background ${color}`} />)}</div></div></section>
    </div>
  );
}

function StepLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`mb-2 font-head text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 ${className}`}>{children}</p>;
}