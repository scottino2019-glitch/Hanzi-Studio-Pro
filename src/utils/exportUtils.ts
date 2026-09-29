import { toPng, toJpeg, toBlob } from 'html-to-image';

export interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
  quality?: number;
}

export async function exportCardAsPng(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const pixelRatio = options.pixelRatio ?? 2;
  const fileName = (options.fileName || 'scheda-cinese').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');

  const dataUrl = await toPng(element, {
    pixelRatio,
    cacheBust: true,
    skipFonts: false,
    filter: (node) => {
      // Exclude non-printable elements if any
      if (node instanceof HTMLElement && node.classList.contains('no-export')) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportCardAsJpeg(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const pixelRatio = options.pixelRatio ?? 2;
  const quality = options.quality ?? 0.95;
  const fileName = (options.fileName || 'scheda-cinese').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');

  const dataUrl = await toJpeg(element, {
    pixelRatio,
    quality,
    cacheBust: true,
    skipFonts: false,
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains('no-export')) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = `${fileName}.jpg`;
  link.href = dataUrl;
  link.click();
}

export async function copyCardToClipboard(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<boolean> {
  try {
    const pixelRatio = options.pixelRatio ?? 2;
    const blob = await toBlob(element, {
      pixelRatio,
      cacheBust: true,
      skipFonts: false,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });

    if (!blob) {
      throw new Error('Impossibile generare immagine per gli appunti');
    }

    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Errore copia appunti:', err);
    return false;
  }
}
