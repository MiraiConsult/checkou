"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface CameraCaptureProps {
  onCapture: (photo: Blob) => void;
  onClose: () => void;
}

// Abre a câmera dentro do app: sem seletor de arquivos, a foto não pode vir da galeria
export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este navegador não permite abrir a câmera. Use o Chrome ou o Safari atualizados.");
        return;
      }
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Não foi possível abrir a câmera. Libere o acesso à câmera nas permissões do navegador e tente de novo.");
      }
    };
    start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) onCapture(blob); }, "image/jpeg", 0.85);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative min-h-0">
        <video ref={videoRef} playsInline muted className="w-full h-full object-contain" />
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="material-symbols-outlined text-white text-[40px]">no_photography</span>
            <p className="text-sm text-white">{error}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 p-4 bg-black">
        <Button variant="outline" className="flex-1 bg-white" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" className="flex-1" onClick={takePhoto} disabled={!ready}>
          <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          Tirar foto
        </Button>
      </div>
    </div>
  );
}
