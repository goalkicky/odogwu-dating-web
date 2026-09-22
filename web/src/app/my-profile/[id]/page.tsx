'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/cloudflare/services';

const INTEREST_EMOJI: [RegExp, string][] = [
  [/music|afro|amapiano|beat|spotify|sound|song|dance|rap|hiphop|hip-hop|culture/i, '🎵'],
  [/movie|film|nollywood|netflix|cinema|hollywood|series|tv/i, '🎬'],
  [/football|soccer|sport|ball|chelsea|arsenal|man utd|manchester|basket/i, '⚽'],
  [/gym|fitness|workout|yoga|spa|wellness|health|meditation/i, '🌿'],
  [/jollof|food|cook|eat|restaurant|cuisine|meat|chicken/i, '🍴'],
  [/travel|trip|tour|abroad|vacation|hike|beach|safari/i, '✈️'],
  [/pan|africa|heritage|history|bini|bronze/i, '🌍'],
  [/instagram|photo|selfie|social|snap/i, '📷'],
  [/love|relationship|romance|heart|friendship/i, '💘'],
  [/book|read|novel|write|poetry|author/i, '📚'],
  [/fashion|style|clothes|design|beauty|makeup/i, '👗'],
  [/prayer|church|god|gospel|faith|bible|christian/i, '⛪'],
];

function interestEmoji(t: string): string {
  const match = INTEREST_EMOJI.find(([re]) => re.test(t));
  return match ? match[1] : '🔵';
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function MyProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const id = params?.id;
  void searchParams;

  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainIdx, setMainIdx] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService.getProfile(id)
      .then((p: any) => {
        const raw: string[] = Array.isArray(p?.photos) ? p.photos : [];
        setUser(p);
        setPhotos(raw.filter(Boolean).map((fid: string) => storageService.getFilePreview(fid)));
        setMainIdx(0);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  const distance = useMemo(() => {
    const me: any = profile;
    if (!me || !user) return null;
    const aLat = Number(me.latitude);
    const aLng = Number(me.longitude);
    const bLat = Number(user.latitude);
    const bLng = Number(user.longitude);
    if (!isFinite(aLat) || !isFinite(aLng) || !isFinite(bLat) || !isFinite(bLng)) return null;
    return haversineKm(aLat, aLng, bLat, bLng);
  }, [profile, user]);

  const name = user?.fullName || 'Member';
  const initial = (name[0] || 'M').toUpperCase();
  const avatar = photos[0] || '';
  const main = photos[mainIdx] || '';
  const online = !!user?.lastActive && (Date.now() - new Date(user.lastActive).getTime()) < 120000;

  const basic: { icon: string; label: string; value: string }[] = [];
  if (user?.institution || user?.education) basic.push({ icon: '◆', label: 'Education', value: user.institution || user.education });
  if (user?.occupation) basic.push({ icon: '▣', label: 'Occupation', value: user.occupation });
  if (user?.relationshipGoals) basic.push({ icon: '♥', label: 'Looking for', value: user.relationshipGoals });

  const toastTimer = React.useRef<any>(null);
  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1400);
  };

  return (
    <div className="mp-page">
      <style jsx global>{`
        .mp-page{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#111}
        .mp-page .page{width:100%;max-width:720px;margin:auto;background:#fff;min-height:100vh}
        .mp-page .topbar{height:162px;padding:65px 18px 10px;display:grid;grid-template-columns:50px 1fr 50px;align-items:center}
        .mp-page .icon{border:0;background:none;font-size:42px;line-height:1;cursor:pointer;padding:0;color:#111}
        .mp-page .more{font-size:22px}
        .mp-page .head{display:flex;align-items:center;gap:13px;min-width:0}
        .mp-page .head img{width:78px;height:78px;border-radius:50%;object-fit:cover}
        .mp-page .head .avatar-fallback{width:78px;height:78px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ef315a,#e48b1a);color:#fff;font-size:30px;font-weight:800;flex-shrink:0}
        .mp-page .name{font-size:28px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mp-page .name b,.mp-page h1 b{display:inline-grid;place-items:center;background:#1688ed;color:#fff;border-radius:50%;font-size:13px;width:21px;height:21px;font-style:normal}
        .mp-page .active{font-size:16px;margin-top:5px}
        .mp-page .active i{display:inline-block;width:10px;height:10px;background:#19bf57;border-radius:50%;margin-right:6px}
        .mp-page .photos{display:grid;grid-template-columns:1.5fr 1fr;gap:9px;padding:0 12px}
        .mp-page .photos.single{grid-template-columns:1fr}
        .mp-page .photos.single .mainpic{width:100%}
        .mp-page .photos img{width:100%;object-fit:cover;border-radius:16px;display:block}
        .mp-page .mainpic{height:630px}
        .mp-page .side{display:grid;grid-auto-rows:310px;gap:9px}
        .mp-page .side img{height:310px}
        .mp-page .profile{padding:31px 26px 28px}
        .mp-page h1{font-size:37px;margin:0;letter-spacing:-1px;font-weight:800}
        .mp-page h1 b{vertical-align:5px}
        .mp-page .location{display:flex;align-items:center;gap:9px;color:#777;font-size:18px;margin-top:13px}
        .mp-page .location:first-letter{font-size:27px}
        .mp-page .bio{font-size:19px;line-height:1.55;margin:27px 0}
        .mp-page q::before{content:"“";color:#e90046;font-size:45px;font-weight:800;vertical-align:-12px;margin-right:6px}
        .mp-page q::after{content:"”"}
        .mp-page .profile h2{font-size:18px;margin:0 0 17px;font-weight:800}
        .mp-page .chips{display:flex;flex-wrap:wrap;gap:10px 8px}
        .mp-page .chips span{border:1px solid #e7e7ea;border-radius:28px;padding:10px 15px;font-size:15px;white-space:nowrap;cursor:pointer;background:#fff}
        .mp-page .chips span.selected{border-color:#e90046;background:#fff0f3;color:#c4003d}
        .mp-page .basic{border:1px solid #e4e4e7;border-radius:17px;margin-top:27px;overflow:hidden}
        .mp-page .basic-title{padding:13px 16px 8px;font-size:19px;font-weight:800}
        .mp-page .basic-grid{display:grid;grid-template-columns:repeat(3,1fr)}
        .mp-page .basic-grid>div{text-align:center;padding:4px 8px 18px;min-height:135px}
        .mp-page .basic-grid>div+div{border-left:1px solid #e2e2e5}
        .mp-page .basic-grid strong{display:block;color:#e90046;font-size:29px;height:45px}
        .mp-page .basic-grid small{font-size:15px;color:#666}
        .mp-page .basic-grid p{font-size:15px;margin:10px 0 0;color:#222;line-height:1.35}
        .mp-page .home{display:none}
        .mp-page .mp-state{padding:70px 20px;text-align:center;color:#888;font-size:15px;min-height:60vh}
        .mp-page .mp-state button{margin-top:14px;padding:12px 28px;border-radius:9999px;background:#e90046;color:#fff;font-size:14px;font-weight:700;cursor:pointer;border:0}
        .mp-page #mp-toast{position:fixed;z-index:100;left:50%;bottom:112px;transform:translateX(-50%);background:#111;color:#fff;padding:11px 18px;border-radius:24px;font:14px Arial}
        @media(max-width:560px){
          .mp-page .page{height:100dvh;max-height:100dvh;display:flex;flex-direction:column;overflow:hidden}
          .mp-page main{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
          .mp-page .topbar{height:auto;flex:none;padding:17px 10px 8px;grid-template-columns:38px 1fr 38px}
          .mp-page .icon{font-size:34px}
          .mp-page .more{font-size:20px}
          .mp-page .head{gap:10px}
          .mp-page .head img,.mp-page .head .avatar-fallback{width:50px;height:50px}
          .mp-page .head .avatar-fallback{font-size:20px}
          .mp-page .name{font-size:20px}
          .mp-page .active{font-size:12px;margin-top:1px}
          .mp-page .active i{width:8px;height:8px}
          .mp-page .photos{flex:1;min-height:0;padding:0 10px;gap:7px}
          .mp-page .mainpic{height:100%}
          .mp-page .side{display:grid;grid-auto-rows:minmax(48px,1fr);gap:7px;overflow:auto;scrollbar-width:none}
          .mp-page .side::-webkit-scrollbar{display:none}
          .mp-page .side img{height:100%;width:100%;min-height:48px;cursor:pointer}
          .mp-page .profile{flex:none;padding:12px 16px 13px}
          .mp-page h1{font-size:25px;letter-spacing:-.5px}
          .mp-page h1 b{width:18px;height:18px;font-size:11px;vertical-align:2px}
          .mp-page .location{font-size:13px;margin-top:7px;gap:7px}
          .mp-page .location:first-letter{font-size:17px}
          .mp-page .bio{font-size:13px;line-height:1.4;margin:9px 0}
          .mp-page q::before{font-size:26px;vertical-align:-7px}
          .mp-page .profile h2{font-size:14px;margin:0 0 7px}
          .mp-page .chips{gap:5px}
          .mp-page .chips span{font-size:11px;padding:5px 9px}
          .mp-page .basic{margin-top:10px;border-radius:12px}
          .mp-page .basic-title{padding:7px 12px 4px;font-size:14px}
          .mp-page .basic-grid>div{min-height:58px;padding:3px 4px 9px}
          .mp-page .basic-grid>div+div{border-left:1px solid #e2e2e5}
          .mp-page .basic-grid strong{font-size:18px;height:24px}
          .mp-page .basic-grid small{font-size:10px}
          .mp-page .basic-grid p{font-size:11px;margin:4px 0 0}
          .mp-page .home{display:block;position:fixed;bottom:5px;left:50%;transform:translateX(-50%);width:110px;height:4px;background:#080808;border-radius:5px}
          .mp-page #mp-toast{bottom:80px}
        }
        @media(max-width:390px){
          .mp-page .topbar{padding:12px 8px 6px;grid-template-columns:34px 1fr 34px}
          .mp-page .head img,.mp-page .head .avatar-fallback{width:42px;height:42px}
          .mp-page .name{font-size:18px}
          .mp-page .active{font-size:11px}
          .mp-page .photos{padding:0 8px;gap:6px}
          .mp-page .side{gap:6px}
          .mp-page .profile{padding:10px 13px 11px}
          .mp-page h1{font-size:22px}
          .mp-page .location{font-size:12px}
          .mp-page .bio{font-size:12px;line-height:1.35;margin:7px 0}
          .mp-page .chips span{font-size:10px;padding:4px 8px}
          .mp-page .basic{margin-top:8px}
          .mp-page .basic-grid>div{min-height:52px}
          .mp-page .basic-grid strong{font-size:16px;height:22px}
          .mp-page .basic-grid small{font-size:9px}
          .mp-page .basic-grid p{font-size:10px;margin:3px 0 0}
        }
        @media(min-width:900px){
          .mp-page{background:#f3f3f4;padding:25px 0;min-height:100vh}
          .mp-page .page{border-radius:18px;overflow:hidden;box-shadow:0 8px 35px #00000012}
          .mp-page .topbar{padding-top:40px}
        }
      `}</style>

      <div className="page">
        <header className="topbar">
          <button className="icon back" aria-label="Back" onClick={() => router.back()}>‹</button>
          <div className="head">
            {avatar ? <img src={avatar} alt={name} decoding="async" /> : <div className="avatar-fallback">{initial}</div>}
            <div>
              <div className="name">{name}{user?.verified ? <b>✓</b> : null}</div>
              <div className="active"><i></i> {online ? 'Active now' : 'Last seen recently'}</div>
            </div>
          </div>
          <button className="icon more" aria-label="More" onClick={() => showToast('More options')}>•••</button>
        </header>

        <main>
          {failed ? (
            <div className="mp-state">
              Profile not found.
              <div><button onClick={() => router.back()}>Go back</button></div>
            </div>
          ) : loading && !user ? (
            <div className="mp-state">Loading…</div>
          ) : user ? (
            <>
              <div className={`photos${photos.length > 1 ? '' : ' single'}`}>
                {main ? (
                  <img className="mainpic" src={main} alt={name} fetchPriority="high" decoding="async" />
                ) : (
                  <div className="mainpic" style={{ display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#ef315a,#e48b1a)', color: '#fff', fontSize: 90, fontWeight: 800 }}>{initial}</div>
                )}
                {photos.length > 1 && (
                  <div className="side">
                    {photos.map((src, i) => i === mainIdx ? null : (
                      <img key={i} src={src} alt="" onClick={() => setMainIdx(i)} loading="lazy" decoding="async" />
                    ))}
                  </div>
                )}
              </div>

              <section className="profile">
                <h1>{name}{user.age ? `, ${user.age}` : null} {user.verified ? <b>✓</b> : null}</h1>
                <div className="location">⌖ <span>{user.city || 'Member'}</span>{distance !== null && distance !== undefined && isFinite(distance) ? <><strong>•</strong><span>{distance}km away</span></> : null}</div>
                {user.bio && (
                  <p className="bio"><q>{user.bio}</q></p>
                )}
                {Array.isArray(user.interests) && user.interests.length > 0 && (
                  <>
                    <h2>Interests</h2>
                    <div className="chips">
                      {user.interests.map((t: string, i: number) => (
                        <span
                          key={i}
                          className={selected.has(i) ? 'selected' : ''}
                          onClick={() => setSelected(prev => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i); else next.add(i);
                            return next;
                          })}
                        >{interestEmoji(t)} {t}</span>
                      ))}
                    </div>
                  </>
                )}
                {basic.length > 0 && (
                  <div className="basic">
                    <div className="basic-title">Basic</div>
                    <div className="basic-grid">
                      {basic.map((b, i) => (
                        <div key={i}><strong>{b.icon}</strong><small>{b.label}</small><p>{b.value}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : null}
        </main>
        <div className="home"></div>
      </div>

      {toast && <div id="mp-toast">{toast}</div>}
    </div>
  );
}