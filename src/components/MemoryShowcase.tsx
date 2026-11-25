import React, { useState, useEffect } from 'react';
import { Maximize2, Film, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { SURPRISE_CONFIG, type MemoryPhoto } from '../config/surpriseConfig';
import { KeepsakeArtwork } from './KeepsakeArtwork';

export const MemoryShowcase: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [availablePhotos, setAvailablePhotos] = useState<Record<number, boolean>>({});
  const [videoMissing, setVideoMissing] = useState(true);
  const [posterAvailable, setPosterAvailable] = useState(false);

  const photos = SURPRISE_CONFIG.photos;

  useEffect(() => {
    let active = true;

    fetch(SURPRISE_CONFIG.video.url, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (active && res.ok && !ct.includes('text/html')) {
          setVideoMissing(false);
        }
      })
      .catch(() => {});

    fetch(SURPRISE_CONFIG.video.poster, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (active && res.ok && !ct.includes('text/html')) {
          setPosterAvailable(true);
        }
      })
      .catch(() => {});

    photos.forEach((p, idx) => {
      fetch(p.url, { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          if (active && res.ok && !ct.includes('text/html')) {
            setAvailablePhotos((prev) => ({ ...prev, [idx]: true }));
          }
        })
        .catch(() => {});
    });

    return () => {
      active = false;
    };
  }, [photos]);

  const selectedPhoto: MemoryPhoto | null = selectedIndex !== null ? photos[selectedIndex] : null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === null ? 0 : (prev - 1 + photos.length) % photos.length
        );
      }
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, photos.length]);

  const renderPhotoMedia = (photo: MemoryPhoto, idx: number, imgClass = '') => {
    if (availablePhotos[idx]) {
      return (
        <img
          src={photo.url}
          alt={photo.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() =>
            setAvailablePhotos((prev) => ({
              ...prev,
              [idx]: false
            }))
          }
          className={`w-full h-full object-cover transition-transform duration-700 ease-silky group-hover:scale-105 ${imgClass}`}
        />
      );
    }
    return <KeepsakeArtwork variant={photo.artworkVariant} title={photo.title} />;
  };

  return (
    <section
      id="kenangan"
      className="relative z-10 py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto scroll-mt-10"
    >
      {/* Editorial Wedding-Monograph Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="text-xs font-bold tracking-[0.26em] uppercase text-amber-800 mb-3">
          Kapsul Waktu &amp; Cahaya
        </p>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2C1205] mb-3 text-balance">
          Taman Kenangan Kita
        </h2>
        <div className="flex items-center justify-center gap-3 mb-4 text-amber-700/70" aria-hidden="true">
          <span className="w-12 h-px bg-amber-700/30" />
          <Heart className="w-3.5 h-3.5 fill-amber-500/40 text-amber-700" />
          <span className="w-12 h-px bg-amber-700/30" />
        </div>
        <p className="text-[13.5px] sm:text-base text-[#6E4726] font-medium leading-[1.7] sm:leading-relaxed max-w-[300px] sm:max-w-xl mx-auto text-pretty">
          Potret senyum, tawa, dan langkah yang dirangkai layaknya lembaran kisah cinta. Ketuk setiap bingkai untuk memperbesar kenangan kita.
        </p>
      </div>

      {/* Invitation-Style Asymmetric Botanical Photo Collage (4 Frames) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch mb-14 sm:mb-20">
        {/* Foto 1: Featured Cathedral Arch Frame */}
        {photos[0] && (
          <div className="lg:col-span-5 flex justify-center">
            <button
              type="button"
              onClick={() => setSelectedIndex(0)}
              aria-label={`Buka foto ${photos[0].title}`}
              className="group w-full max-w-[305px] sm:max-w-[360px] lg:max-w-none text-left rounded-t-[9rem] sm:rounded-t-[12rem] rounded-b-[1.75rem] sm:rounded-b-[2rem] surface-champagne p-3 sm:p-4 pb-5 sm:pb-6 transition-all duration-300 ease-silky hover:-translate-y-1.5 hover:border-amber-600/50 focus-visible:outline-2 focus-visible:outline-amber-700 flex flex-col"
            >
              <figure className="flex flex-col flex-1 w-full">
                <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:flex-1 lg:min-h-[340px] rounded-t-[8rem] sm:rounded-t-[11rem] rounded-b-2xl overflow-hidden bg-amber-100 mb-4 sm:mb-5 ring-1 ring-amber-700/25">
                  {renderPhotoMedia(photos[0], 0)}
                  <span className="absolute bottom-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full surface-monograph text-[#2C1205] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                </div>

                <figcaption className="px-2.5 sm:px-3 text-center">
                  <div className="inline-flex flex-wrap items-center justify-center gap-x-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-amber-800 mb-1">
                    <span>{photos[0].date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{photos[0].location}</span>
                  </div>
                  <h3 className="font-editorial text-xl sm:text-3xl font-bold text-[#2C1205] leading-tight text-balance">
                    {photos[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E4726] font-medium mt-1.5 leading-[1.68] text-pretty max-w-[260px] sm:max-w-sm mx-auto">
                    {photos[0].caption}
                  </p>
                </figcaption>
              </figure>
            </button>
          </div>
        )}

        {/* Right Editorial Collage: Tilted Scrapbook Pair + Wide Story Spread */}
        <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6 lg:gap-7">
          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 pt-2">
            {/* Foto 2: Polaroid Keepsake with Translucent Gold Ribbon Tape */}
            {photos[1] && (
              <button
                type="button"
                onClick={() => setSelectedIndex(1)}
                aria-label={`Buka foto ${photos[1].title}`}
                className="group relative text-left rounded-xl sm:rounded-2xl surface-monograph p-2 sm:p-3.5 pb-3.5 sm:pb-5 -rotate-[1.6deg] sm:-rotate-[1.1deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-300 ease-silky hover:border-amber-600/45 focus-visible:outline-2 focus-visible:outline-amber-700"
              >
                <span
                  aria-hidden="true"
                  className="block w-10 sm:w-14 h-2 sm:h-2.5 -mt-3.5 sm:-mt-5 mx-auto mb-2 sm:mb-2.5 rounded-sm bg-gradient-to-r from-amber-300/75 via-yellow-100/90 to-amber-300/75 border border-amber-500/30 shadow-xs"
                />
                <figure>
                  <div className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-amber-100 mb-2.5 sm:mb-3.5 border border-amber-700/15">
                    {renderPhotoMedia(photos[1], 1)}
                    <span className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full surface-monograph text-[#2C1205] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                  <figcaption className="px-1 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-x-1 text-[8.5px] sm:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.12em] uppercase text-amber-800 mb-1">
                      <span>{photos[1].date}</span>
                      <span aria-hidden="true" className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{photos[1].location}</span>
                    </div>
                    <h3 className="font-editorial text-base sm:text-2xl font-bold text-[#2C1205] leading-tight text-balance">
                      {photos[1].title}
                    </h3>
                    <p className="hidden sm:block text-xs text-[#6E4726] font-medium mt-1.5 leading-[1.65] text-pretty max-w-[235px] mx-auto">
                      {photos[1].caption}
                    </p>
                  </figcaption>
                </figure>
              </button>
            )}

            {/* Foto 3: Soft Botanical Arch Medallion */}
            {photos[2] && (
              <button
                type="button"
                onClick={() => setSelectedIndex(2)}
                aria-label={`Buka foto ${photos[2].title}`}
                className="group text-left rounded-t-[4.25rem] sm:rounded-t-[6.5rem] rounded-b-xl sm:rounded-b-2xl surface-champagne p-2 sm:p-3.5 pb-3.5 sm:pb-5 rotate-[1.6deg] sm:rotate-[1.1deg] hover:rotate-0 hover:-translate-y-1 transition-all duration-300 ease-silky hover:border-amber-600/45 focus-visible:outline-2 focus-visible:outline-amber-700"
              >
                <figure>
                  <div className="relative aspect-[4/3] rounded-t-[3.75rem] sm:rounded-t-[5.5rem] rounded-b-lg sm:rounded-b-xl overflow-hidden bg-amber-100 mb-2.5 sm:mb-3.5 border border-amber-700/20">
                    {renderPhotoMedia(photos[2], 2)}
                    <span className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full surface-monograph text-[#2C1205] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                  <figcaption className="px-1 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-x-1 text-[8.5px] sm:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.12em] uppercase text-amber-800 mb-1">
                      <span>{photos[2].date}</span>
                      <span aria-hidden="true" className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{photos[2].location}</span>
                    </div>
                    <h3 className="font-editorial text-base sm:text-2xl font-bold text-[#2C1205] leading-tight text-balance">
                      {photos[2].title}
                    </h3>
                    <p className="hidden sm:block text-xs text-[#6E4726] font-medium mt-1.5 leading-[1.65] text-pretty max-w-[235px] mx-auto">
                      {photos[2].caption}
                    </p>
                  </figcaption>
                </figure>
              </button>
            )}
          </div>

          {/* Foto 4: Wide Panoramic Invitation Spread (Horizontal on both Mobile & Desktop) */}
          {photos[3] && (
            <button
              type="button"
              onClick={() => setSelectedIndex(3)}
              aria-label={`Buka foto ${photos[3].title}`}
              className="group block w-full text-left rounded-2xl sm:rounded-3xl surface-monograph p-3 sm:p-4 overflow-hidden transition-all duration-300 ease-silky hover:-translate-y-1 hover:border-amber-600/45 focus-visible:outline-2 focus-visible:outline-amber-700"
            >
              <figure className="grid grid-cols-12 gap-3.5 sm:gap-6 items-center w-full">
                <div className="col-span-5 sm:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-amber-100 border border-amber-700/20">
                  {renderPhotoMedia(photos[3], 3)}
                  <span className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full surface-monograph text-[#2C1205] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                </div>
                <figcaption className="col-span-7 sm:col-span-6 pl-0.5 pr-4 sm:px-1 sm:pr-2">
                  <div className="flex flex-wrap items-center gap-x-1 text-[9px] sm:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-rose-800 mb-1">
                    <span>{photos[3].date}</span>
                    <span aria-hidden="true" className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{photos[3].location}</span>
                  </div>
                  <h3 className="font-editorial text-lg sm:text-[1.75rem] font-bold text-[#2C1205] leading-tight mb-1.5 sm:mb-2 text-balance">
                    {photos[3].title}
                  </h3>
                  <p className="text-[11.5px] sm:text-sm text-[#6E4726] font-medium leading-[1.6] sm:leading-relaxed text-pretty mb-2 sm:mb-3">
                    {photos[3].caption}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-800 group-hover:text-amber-600 transition-colors">
                    <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>Ketuk Foto Penuh</span>
                  </span>
                </figcaption>
              </figure>
            </button>
          )}
        </div>
      </div>

      {/* Twilight Velvet & Gold-Foil Cinema Capsule for Video */}
      <article className="surface-twilight rounded-[2rem] p-5 sm:p-9 lg:p-11 relative overflow-hidden text-[#FDFBF5]">
        {/* Ambient Golden-Hour Spotlight Behind Cinema Frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(251,191,36,0) 70%)'
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(225,29,72,0.16) 0%, rgba(225,29,72,0) 70%)'
          }}
        />

        {/* Delicate Gold Corner Flourishes */}
        <span aria-hidden="true" className="hidden sm:block absolute top-4 left-4 w-6 h-6 border-t border-l border-amber-300/40 rounded-tl-lg" />
        <span aria-hidden="true" className="hidden sm:block absolute top-4 right-4 w-6 h-6 border-t border-r border-amber-300/40 rounded-tr-lg" />
        <span aria-hidden="true" className="hidden sm:block absolute bottom-4 left-4 w-6 h-6 border-b border-l border-amber-300/40 rounded-bl-lg" />
        <span aria-hidden="true" className="hidden sm:block absolute bottom-4 right-4 w-6 h-6 border-b border-r border-amber-300/40 rounded-br-lg" />

        {/* Cinema Header Masthead */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-4 sm:pb-5 mb-6 sm:mb-8 pr-6 sm:pr-0 border-b border-amber-200/15">
          <div className="flex items-center gap-2 text-[10.5px] sm:text-xs font-bold tracking-[0.14em] sm:tracking-[0.22em] uppercase text-amber-300">
            <Film className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Kapsul Waktu Video · Bioskop Cinta</span>
          </div>
          <p className="text-xs font-medium text-amber-100/75">
            Untuk {SURPRISE_CONFIG.wifeName} · Persembahan {SURPRISE_CONFIG.husbandName}
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-11 items-center">
          {/* Left: Double Gold-Rimmed Cinema Screen */}
          <div className="lg:col-span-7">
            <div className="p-1.5 rounded-2xl bg-gradient-to-br from-amber-300/50 via-amber-500/20 to-rose-400/35 shadow-[0_24px_56px_-14px_rgba(0,0,0,0.65)]">
              <figure className="relative rounded-xl overflow-hidden bg-[#180B10] aspect-video flex items-center justify-center">
                {!videoMissing ? (
                  <video
                    src={SURPRISE_CONFIG.video.url}
                    poster={posterAvailable ? SURPRISE_CONFIG.video.poster : undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoMissing(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                    <div className="absolute inset-0 opacity-85">
                      <KeepsakeArtwork variant="cinema" title={SURPRISE_CONFIG.video.title} />
                    </div>
                    <div className="relative z-10 max-w-[270px] sm:max-w-sm rounded-2xl bg-[#2C1205]/82 border border-amber-300/35 px-4 py-3.5 sm:p-5 shadow-xl">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-300/15 border border-amber-300/45 flex items-center justify-center text-amber-300 mx-auto mb-2.5 sm:mb-3">
                        <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <p className="font-editorial italic text-xl sm:text-2xl font-bold text-[#FFFDF5] mb-1">
                        {SURPRISE_CONFIG.video.title}
                      </p>
                      <p className="text-[11.5px] sm:text-xs text-amber-100/85 font-medium leading-[1.65] text-pretty">
                        Setiap kenangan indah kita tersimpan hangat di dalam hati, menanti momen video berikutnya kita abadikan bersama.
                      </p>
                    </div>
                  </div>
                )}
              </figure>
            </div>
          </div>

          {/* Right: Editorial Romantic Story Note */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 pr-6 lg:pr-0">
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.22em] uppercase text-amber-300">
              Bab Istimewa · Kenangan Kita
            </p>

            <h3 className="font-editorial italic text-3xl sm:text-4xl font-bold text-[#FFFDF5] leading-tight text-balance">
              {SURPRISE_CONFIG.video.title}
            </h3>

            <p className="text-[13.5px] sm:text-base text-amber-100/85 font-medium leading-[1.7] sm:leading-relaxed text-pretty">
              {SURPRISE_CONFIG.video.caption}
            </p>

            <div className="pt-4 border-t border-amber-200/15 flex items-center gap-2 text-xs font-semibold text-amber-200/80">
              <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
              <span>{SURPRISE_CONFIG.birthdayDate}</span>
            </div>
          </div>
        </div>
      </article>

      {/* Keyboard-Accessible Fullscreen Lightbox */}
      {selectedPhoto && selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-[#2C1205]/84 flex items-center justify-center p-4 sm:p-8 animate-reveal-smooth"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#FFFDF8] rounded-3xl overflow-hidden border border-amber-500/60 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="Tutup Foto"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full surface-monograph text-[#2C1205] hover:bg-amber-200 flex items-center justify-center shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-amber-50 flex items-center justify-center h-[52vh] sm:h-[60vh] overflow-hidden">
              {availablePhotos[selectedIndex] ? (
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setAvailablePhotos((prev) => ({
                      ...prev,
                      [selectedIndex]: false
                    }))
                  }
                  className="w-full h-full object-contain"
                />
              ) : (
                <KeepsakeArtwork
                  variant={selectedPhoto.artworkVariant}
                  title={selectedPhoto.title}
                />
              )}

              <button
                type="button"
                onClick={() =>
                  setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)
                }
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full surface-monograph text-[#2C1205] hover:bg-amber-100 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex((selectedIndex + 1) % photos.length)}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full surface-monograph text-[#2C1205] hover:bg-amber-100 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase text-amber-800">
                  <span>{selectedPhoto.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPhoto.location}</span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2C1205] mt-1">
                  {selectedPhoto.title}
                </h3>
                <p className="text-sm sm:text-base text-[#6E4726] font-medium mt-1.5 leading-relaxed text-pretty">
                  {selectedPhoto.caption}
                </p>
              </div>
              <span className="text-xs font-bold text-[#6E4726] tabular-nums shrink-0">
                {selectedIndex + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
