/**
 * DÖNGÜ — Bölüm videoları
 * index.html içindeki her <div class="video-slot" data-video="ANAHTAR"> alanını,
 * config.js > VIDEOS[ANAHTAR] ayarına göre doldurur.
 * Desteklenen kaynaklar: yerel dosya (.mp4/.webm/.mov), YouTube, Vimeo, Google Drive.
 */
import { VIDEOS, TEAM, SHOW_VIDEO_SCRIPTS } from '../data/config.js';

function escapeHTML(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function presenterName(p) {
  if (p === 'team' || p === undefined) return `${TEAM.name} · tüm ekip`;
  const m = TEAM.members[p];
  return m ? `${m.name} · ${m.role}` : '';
}

/** Bir bağlantıyı gömülebilir iframe adresine çevirir; çeviremezse null döner. */
export function toEmbedURL(src) {
  try {
    const u = new URL(src, window.location.origin);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?rel=0`;
    if (host.endsWith('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${u.pathname}?rel=0`;
      if (u.pathname.startsWith('/shorts/')) return `https://www.youtube-nocookie.com/embed/${u.pathname.split('/')[2]}?rel=0`;
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    }
    if (host === 'vimeo.com') return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean)[0]}`;
    if (host === 'player.vimeo.com') return u.href;
    if (host === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      const id = m ? m[1] : u.searchParams.get('id');
      if (id) return `https://drive.google.com/file/d/${id}/preview`;
    }
  } catch (_) { /* geçersiz adres */ }
  return null;
}

function isFile(src) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(src);
}

function playerHTML(v) {
  if (isFile(v.src)) {
    const poster = v.poster ? ` poster="${escapeHTML(v.poster)}"` : '';
    return `<video class="video-player" controls playsinline preload="metadata"${poster}>
              <source src="${escapeHTML(v.src)}">
              Tarayıcınız bu videoyu oynatamıyor.
            </video>`;
  }
  const embed = toEmbedURL(v.src);
  if (embed) {
    return `<iframe class="video-player" src="${escapeHTML(embed)}" title="${escapeHTML(v.title || 'Video')}"
              loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }
  return null;
}

function placeholderHTML(key, v) {
  const script = SHOW_VIDEO_SCRIPTS && v.script
    ? `<details class="video-script">
         <summary>Konuşma metni (çekim için)</summary>
         <p>${escapeHTML(v.script)}</p>
       </details>`
    : '';
  return `<div class="video-placeholder">
            <div class="video-ph-icon" aria-hidden="true">▶</div>
            <div class="video-ph-text">
              ${SHOW_VIDEO_SCRIPTS
                ? `<strong>Video eklenecek</strong>
                   <span>Dosyayı <code>public/videos/${escapeHTML(key)}.mp4</code> olarak ekleyin ya da <code>config.js</code> içinde bağlantı verin.</span>`
                : `<strong>Video yakında</strong>
                   <span>Bu bölümün anlatım videosu hazırlanıyor.</span>`}
            </div>
          </div>
          ${script}`;
}

export function renderVideoSlots(root = document) {
  root.querySelectorAll('.video-slot[data-video]').forEach(slot => {
    const key = slot.dataset.video;
    const v = VIDEOS[key];
    if (!v) { slot.remove(); return; }

    const player = v.src ? playerHTML(v) : null;
    slot.classList.add('fade-up');
    slot.innerHTML = `
      <figure class="video-card">
        <div class="video-frame">${player || placeholderHTML(key, v)}</div>
        <figcaption class="video-meta">
          <span class="video-title">🎬 ${escapeHTML(v.title || '')}</span>
        </figcaption>
      </figure>`;
    // Placeholder'da çerçeve videonun oranını korumasın; metin sığsın
    if (!player) slot.querySelector('.video-frame').classList.add('is-empty');
  });

  // Aynı anda tek video oynasın
  root.querySelectorAll('video.video-player').forEach(vid => {
    vid.addEventListener('play', () => {
      root.querySelectorAll('video.video-player').forEach(o => { if (o !== vid) o.pause(); });
    });
  });
}
