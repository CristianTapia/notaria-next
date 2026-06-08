"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";

import { Button, Card } from "@/components/ui";

type TenantRow = {
  id: string;
  slug: string;
  name: string;
};

export default function QrGenerator({ tenant }: { tenant: TenantRow }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${tenant.slug}` : "";

  useEffect(() => {
    if (!publicUrl) return;

    QRCode.toDataURL(publicUrl, {
      margin: 2,
      width: 420,
      color: {
        dark: "#071B3A",
        light: "#FFFFFF",
      },
    })
      .then(setQr)
      .catch(console.error);
  }, [publicUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  function drawCenteredSpacedText(pdf: jsPDF, text: string, centerX: number, y: number, charSpacing: number) {
    const chars = text.split("");
    const totalWidth = chars.reduce((sum, char) => sum + pdf.getTextWidth(char), 0) + (chars.length - 1) * charSpacing;

    let x = centerX - totalWidth / 2;

    chars.forEach((char) => {
      pdf.text(char, x, y);
      x += pdf.getTextWidth(char) + charSpacing;
    });
  }

  const downloadPdf = () => {
    if (!qr) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, 297, "F");

    pdf.setTextColor(7, 27, 58);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(7, 27, 58);

    drawCenteredSpacedText(pdf, tenant.name.toUpperCase(), pageWidth / 2, 38, 2.2);
    pdf.setFontSize(24);
    pdf.text("Solicite su documento", pageWidth / 2, 55, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.setTextColor(80, 96, 120);
    pdf.text("Escanee con la cámara de su teléfono", pageWidth / 2, 66, {
      align: "center",
    });

    pdf.addImage(qr, "PNG", 55, 86, 100, 100);

    pdf.setFontSize(11);
    pdf.setFont("courier", "normal");
    pdf.setTextColor(80, 96, 120);
    pdf.text(publicUrl, pageWidth / 2, 205, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(150, 160, 175);
    pdf.text("Desarrollado por Lab3c.app", pageWidth / 2, 260, {
      align: "center",
    });

    pdf.save(`${tenant.slug}-qr.pdf`);
  };

  return (
    <div className="mt-6 min-w-0 space-y-4">
      <Card className="print:border-none print:shadow-none">
        <div className="mx-auto min-w-0 max-w-xl text-center">
          <p className="break-words text-xs font-medium uppercase tracking-[0.35em] text-[var(--color-muted)]">{tenant.name}</p>

          <h2 className="mt-4 break-words text-2xl font-normal sm:text-3xl">Solicite su documento</h2>

          <p className="mt-2 text-sm text-[var(--color-muted)]">Escanee con la cámara de su teléfono</p>

          <div className="mx-auto mt-8 flex w-full max-w-[18rem] rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-sm sm:w-fit sm:max-w-none sm:p-4">
            {qr ? (
              <img src={qr} alt={`Código QR de ${tenant.name}`} className="aspect-square h-auto w-full sm:h-72 sm:w-72" />
            ) : (
              <div className="grid aspect-square w-full place-items-center text-sm text-[var(--color-muted)] sm:h-72 sm:w-72">Generando QR...</div>
            )}
          </div>

          <p className="mx-auto mt-6 max-w-md break-all font-mono text-sm text-[var(--color-muted)]">{publicUrl}</p>
        </div>
      </Card>

      <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:flex-wrap">
        <Button type="button" variant="secondary" onClick={copyLink} className="w-full sm:w-auto">
          <Copy className="h-4 w-4" />
          {copied ? "Link copiado" : "Copiar link"}
        </Button>

        <Button type="button" variant="secondary" onClick={downloadPdf} disabled={!qr} className="w-full sm:w-auto">
          <FileDown className="h-4 w-4" />
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
