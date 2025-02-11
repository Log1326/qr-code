'use client';
import { useRouter } from 'next/navigation';
import QRCodeStyling from 'qr-code-styling';
import { useEffect, useRef, useState } from 'react';
import { ShareButton } from './ShareButton';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type FileExtension = 'svg' | 'png' | 'jpeg' | 'webp';

const houseIcons: string[] = [
  '/images/house-1.svg',
  '/images/house-2.svg',
  '/images/house-3.svg',
  '/images/house-4.svg',
  '/images/house-5.svg',
  '/images/house-6.svg',
  '/images/house-7.svg',
  '/images/house-8.svg',
  '/images/house-9.svg',
  '/images/house-10.svg',
  '/images/house-11.svg',
  '/images/house-12.svg',
  '/images/house-13.svg',
  '/images/house-14.svg',
  '/images/house-15.svg',
  '/images/house-16.svg',
  '/images/house-17.svg',
  '/images/house-18.svg',
];

const gradientColors: string[][] = [
  ['#FFDEE9', '#B5FFFC'], // Розовый → Голубой
  ['#D4FC79', '#96E6A1'], // Лаймовый → Зеленый
  ['#FFF1EB', '#ACE0F9'], // Бежевый → Голубой
  ['#FFD3A5', '#FD6585'], // Персиковый → Розовый
  ['#F3E7E9', '#E3EEFF'], // Светло-розовый → Светло-голубой
  ['#C2E9FB', '#A1C4FD'], // Нежный голубой градиент
  ['#FAACA8', '#DDD6F3'], // Персиковый → Сиреневый
  ['#FF9A9E', '#FAD0C4'], // Розовый → Лососевый
  ['#B5FFFC', '#E8F0FF'], // Бирюзовый → Светлый голубой
  ['#FAD0C4', '#FFD3A5'], // Лососевый → Персиковый
];

interface QRGeneratorProps {
  data: string | null;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fileExt, setFileExt] = useState<FileExtension>('svg');
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const { push } = useRouter();

  const randomHouse = houseIcons[Math.floor(Math.random() * houseIcons.length)];
  const [color1, color2] =
    gradientColors[Math.floor(Math.random() * gradientColors.length)];

  const saveQRCodeToDatabase = async (
    qrCodeInstance: QRCodeStyling,
  ): Promise<void> => {
    try {
      const recipeId = data?.split('/').pop();
      if (!recipeId) return;
      const qrCodeBlob = await qrCodeInstance.getRawData('png');
      if (!qrCodeBlob) return;
      const qrCodeFile = new File([qrCodeBlob], 'qrcode.png', {
        type: 'image/png',
      });
      const formData = new FormData();
      formData.append('id', recipeId);
      formData.append('qrCode', qrCodeFile);
      const response = await fetch('/api/recipes', {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to save QR code');
    } catch (error) {
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  useEffect(() => {
    if (!data) return;
    console.log(data);
    const qr: QRCodeStyling = new QRCodeStyling({
      type: 'canvas',
      shape: 'square',
      width: 300,
      height: 300,
      data: data || '404',
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'H',
      },
      imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 2,
      },
      dotsOptions: {
        type: 'extra-rounded',
        roundSize: true,
        color: color1,
        gradient: {
          type: 'linear',
          rotation: Math.random() * Math.PI,
          colorStops: [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 },
          ],
        },
      },
      backgroundOptions: {
        round: 0,
        color: '#ffffff',
      },
      image: randomHouse,
      cornersSquareOptions: {
        type: 'dot',
        color: '#000000',
        gradient: {
          type: 'linear',
          rotation: Math.random() * Math.PI,
          colorStops: [
            { offset: 0, color: color2 },
            { offset: 1, color: color1 },
          ],
        },
      },
      cornersDotOptions: {
        type: 'dot',
        color: color1,
      },
    });

    setQrCode(qr);
    saveQRCodeToDatabase(qr);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (ref.current && qrCode) {
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  const onDownloadClick = (): void => {
    if (qrCode) qrCode.download({ extension: fileExt });
  };
  if (!data) return null;
  return (
    <div className="relative flex flex-col items-center gap-4 rounded-lg p-4 shadow-md ring-1 ring-gray-300">
      <h2 className="text-lg font-semibold">QR Code Generator</h2>
      <div className="rounded-xl border p-2" ref={ref} />
      <div className="flex w-full items-center justify-around gap-2">
        <Select
          value={fileExt}
          onValueChange={(value: FileExtension) => setFileExt(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="svg">SVG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="webp">WEBP</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" onClick={onDownloadClick}>
          Download
        </Button>
        <Button variant="link" onClick={() => push(String(data))}>
          Check
        </Button>
        <div className="absolute right-3 top-3">
          <ShareButton qrCode={qrCode} url={data} />
        </div>
      </div>
    </div>
  );
};
