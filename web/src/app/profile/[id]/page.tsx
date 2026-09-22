'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/AuthContext';
import { matchService, userService, storageService } from '@/lib/cloudflare/services';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const INTEREST_ICONS: [RegExp, string][] = [
  [/music|afro|beat|spotify|sound|song|dance|rap|hiphop|hip-hop|culture/i, '♪'],
  [/football|soccer|sport|ball|chelsea|arsenal|back|man utd|manchester|basket/i, '⚽'],
  [/gym|fitness|workout|train|exercise|yoga|jog|run/i, '◉'],
  [/jollof|rice|food|cook|eat|dinner|restaurant|cuisine|meat|chicken/i, '♨'],
  [/travel|trip|tour|abroad|vacation|hike|beach|safari/i, '♧'],
  [/movie|film|nollywood|netflix|cinema|hollywood|series|tv/i, '♧'],
  [/love|relationship|romance|heart|friendship/i, '♡'],
  [/prayer|church|god|gospel|faith|bible|christian/i, '✝'],
  [/fashion|style|clothes|design|beauty|makeup/i, '❁'],
  [/book|read|novel|write|author|poetry/i, '✎'],
];

function interestIcon(t: string): string {
  const match = INTEREST_ICONS.find(([re]) => re.test(t));
  return match ? match[1] : '✦';
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const uid = (profile as any)?.$id || (profile as any)?.id;
  const id = params?.id;
  const matchId = searchParams.get('match') || '';

  const [user, setUser] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
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
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!uid) return;
    matchService.getWhoLikedMe(uid).then((docs: any) => setLikesCount(Array.isArray(docs) ? docs.length : 0)).catch(() => {});
    matchService.getUserMatches(uid).then((docs: any) => {
      const arr = Array.isArray(docs) ? docs : (docs?.documents || []);
      setMessagesCount(arr.filter((d: any) => d.hasConversation).length);
    }).catch(() => {});
  }, [uid]);

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

  const hero = photos[heroIdx] || '';
  const gallery = photos.length > 1 ? photos.filter((_, i) => i !== heroIdx).slice(0, 4) : [];
  const online = !!user?.lastActive && (Date.now() - new Date(user.lastActive).getTime()) < 120000;

  const swapPhoto = (idx: number, src: string) => {
    setPhotos(prev => {
      const next = [...prev];
      const currentHero = next[heroIdx];
      next[heroIdx] = src;
      next[idx] = currentHero;
      return next;
    });
    setHeroIdx(heroIdx); // hero slot now holds the clicked image
  };

  const name = user?.fullName || 'Member';
  const age = user?.age || '';
  const city = user?.city || '';
  const initial = (name[0] || 'M').toUpperCase();

  const details: { icon: string; label: string; value: string }[] = [];
  if (user?.institution || user?.education) details.push({ icon: '♧', label: 'Education', value: user.institution || user.education });
  if (user?.occupation) details.push({ icon: '▣', label: 'Occupation', value: user.occupation });
  if (user?.height) details.push({ icon: '↕', label: 'Height', value: user.height });
  if (user?.relationshipGoals) details.push({ icon: '♡', label: 'Relationship goal', value: user.relationshipGoals });

  return (
    <div className="profile-page">
      <style jsx global>{`
        *{box-sizing:border-box}
        .profile-page{--pink:#df003d;--text:#17171b;--muted:#64646b;--line:#ececef;--page:#f7f7f8}
        .profile-page{display:flex;justify-content:center;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:var(--text);background:var(--page)}
        .profile-page button{font:inherit}
        .app-shell{width:min(100%,1180px);min-height:100vh;display:flex;gap:20px;padding:0 18px}
        .sidebar{width:150px;min-width:150px;height:100vh;position:sticky;top:0;background:#fff;border-radius:0 18px 18px 0;overflow:hidden;display:flex;flex-direction:column}
        .upgrade-wrap{height:116px;background:#fff3f6;padding:44px 8px 0}
        .upgrade{border:0;background:var(--pink);color:#fff;border-radius:25px;padding:11px 16px;font-size:14px;cursor:pointer}
        .visitor-block{text-align:center;padding:27px 0 12px}
        .visitor-photo-wrap{width:82px;height:82px;margin:auto;position:relative;border-radius:50%;padding:3px;background:linear-gradient(135deg,#ff9f00,#d90042)}
        .visitor-photo{width:100%;height:100%;object-fit:cover;border-radius:50%;border:2px solid #fff}
        .visitor-count{position:absolute;right:-5px;bottom:-2px;width:27px;height:27px;border-radius:50%;background:var(--pink);color:#fff;display:grid;place-items:center;font-size:13px;border:2px solid #fff}
        .visitor-label{font-size:14px;margin-top:9px}
        .sort-row{border-bottom:1px solid var(--line);padding:19px 4px 11px;font-size:13px;white-space:nowrap}
        .sort-row button{border:0;background:none;color:var(--pink);padding:0}
        .activity-list{padding-top:8px}
        .activity-card{height:132px;border-bottom:1px solid var(--line);border-radius:0 16px 16px 0;padding:37px 16px 0 47px;display:flex;justify-content:space-between;color:#444;font-size:12px}
        .activity-card b{font-size:30px;font-weight:300;line-height:14px;color:#222}
        .sidebar-bottom{margin-top:auto;border-top:1px solid var(--line);height:102px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:13px;color:#3e3e46}
        .profile-icon{font-size:27px}
        .profile-card{width:min(100%,540px);margin:0 auto;background:#fff;box-shadow:0 0 0 1px #ededee;border-radius:0 0 18px 18px;overflow:hidden}
        .hero{height:498px;position:relative;background:#ddd}
        .hero>img{width:100%;height:100%;display:block;object-fit:cover}
        .online{position:absolute;top:14px;left:18px;background:#111;color:#fff;border-radius:22px;padding:9px 13px;font-size:14px;display:flex;align-items:center;gap:7px}
        .online i{width:9px;height:9px;background:#00dc63;border-radius:50%;display:block}
        .counter{position:absolute;right:18px;top:14px;background:rgba(20,20,20,.75);color:#fff;border-radius:22px;padding:9px 13px;font-size:14px}
        .back{position:absolute;bottom:14px;left:18px;width:40px;height:40px;border-radius:50%;background:rgba(20,20,20,.75);color:#fff;display:grid;place-items:center;font-size:24px;line-height:1;cursor:pointer;border:0}
        .content{padding:20px 12px 24px}
        .name-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
        .name-row h1{margin:0;font-size:30px;line-height:1.1;letter-spacing:-.6px;font-weight:400}
        .name-row h1 .pf-name{font-weight:800}
        .name-row h1 .pf-interests{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--pink);color:#fff;font-size:11px;font-weight:400;font-style:normal;vertical-align:middle;margin-left:4px}
        .name-row h1 span{font-weight:500}
        .name-row h1 em{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#2184ee;color:#fff;font-size:12px;font-style:normal;vertical-align:middle;margin-left:4px}
        .location{font-size:15px;color:#222;margin-top:12px;display:flex;gap:7px;align-items:center}
        .location span{color:#4c4c54}
        .actions{display:flex;gap:10px}
        .action-btn{width:61px;height:61px;border-radius:50%;display:grid;place-items:center;cursor:pointer}
        .action-btn svg{width:28px;height:28px;fill:none;stroke-width:2.2}
        .message{background:#fff;border:2px solid var(--pink);color:#111}
        .gift{background:var(--pink);border:2px solid var(--pink);color:#fff}
        .tags{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 19px}
        .tags span{border:1px solid #e1e1e4;border-radius:20px;padding:8px 12px;font-size:14px;color:#303038;white-space:nowrap}
        .tags span .tag-icon{font-style:normal;color:var(--pink)}
        .profile-page hr{border:0;border-top:1px solid var(--line);margin:0}
        .about{padding:20px 0 17px}
        .about h2{font-size:19px;margin:0 0 12px;letter-spacing:-.2px}
        .about p{margin:0;color:#53535c;font-size:16px;line-height:1.48;max-width:500px}
        .details{padding:10px 0 17px}
        .details h2{font-size:19px;margin:0 0 12px;letter-spacing:-.2px}
        .detail-row{display:grid;grid-template-columns:29px 1fr 1fr;align-items:center;min-height:48px;font-size:15px}
        .detail-icon{font-size:20px;color:#2d2d35}
        .detail-row strong{font-weight:400;color:#4f4f57}
        .more{padding-top:21px}
        .more h2{font-size:19px;margin:0 0 12px;letter-spacing:-.2px}
        .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}
        .gallery img{width:100%;aspect-ratio:1/1.32;object-fit:cover;border-radius:13px;display:block;cursor:pointer}
        .tmpl-bottom-nav{display:none}
        .profile-state{padding:70px 20px;text-align:center;color:#888;font-size:15px;width:min(100%,540px);margin:0 auto;background:#fff;box-shadow:0 0 0 1px #ededee}
        .profile-state button{margin-top:14px;padding:12px 28px;border-radius:9999px;background:var(--pink);color:#fff;font-size:14px;font-weight:700;cursor:pointer;border:0}
        @media (max-width:760px){
          .profile-page{background:#fff}
          .app-shell{display:block;width:100%;padding:0}
          .sidebar{display:none}
          .profile-card{width:100%;max-width:none;border-radius:0;box-shadow:none}
          .hero{height:min(108vw,560px)}
          .content{padding:18px 16px 120px}
          .name-row{align-items:center}
          .name-row h1{font-size:27px}
          .location{font-size:14px}
          .action-btn{width:54px;height:54px}
          .action-btn svg{width:25px;height:25px}
          .tags{margin-top:22px}
          .tags span{font-size:13px;padding:7px 10px}
          .detail-row{grid-template-columns:27px 1fr 1.08fr;min-height:46px;font-size:14px}
          .gallery{gap:9px}
          .tmpl-bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:710px;height:101px;background:#fff;border-top:1px solid #eee;display:grid;grid-template-columns:1fr 1fr 1.1fr 1fr 1fr;align-items:end;padding:8px 15px 13px;z-index:30;box-sizing:border-box}
          .tmpl-nav-item{height:70px;color:#777;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:13px;text-decoration:none;background:none;border:0;padding:0;cursor:pointer}
          .tmpl-nav-item svg{width:29px;height:29px;stroke:currentColor;stroke-width:2.2;fill:currentColor}
          .tmpl-nav-item:not(.active) svg{fill:none}
          .tmpl-nav-item.active{color:#d81043}
          .tmpl-nav-icon-wrap{position:relative;display:grid}
          .tmpl-nav-icon-wrap b{position:absolute;right:-7px;top:-7px;background:#d81043;color:#fff;border-radius:50%;font-size:11px;width:20px;height:20px;display:grid;place-items:center;font-weight:700}
          .tmpl-nav-center{height:70px;display:flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer}
          .tmpl-nav-center img{width:66px;height:66px;object-fit:cover;border-radius:50%}
          .back{bottom:auto;top:16px;left:18px}
        }
        @media (min-width:761px) and (max-width:1050px){
          .app-shell{width:100%;padding:0 8px;gap:10px}
          .sidebar{width:135px;min-width:135px}
          .profile-card{width:min(100%,540px)}
        }
        @media (max-width:420px){
          .hero{height:104vw}
          .content{padding-left:13px;padding-right:13px}
          .actions{gap:6px}
          .action-btn{width:50px;height:50px}
          .name-row{gap:5px}
          .name-row h1{font-size:25px}
          .gallery{gap:7px}
        }
        @media (max-width:560px){
          .tmpl-bottom-nav{height:88px;padding:6px 10px 10px}
          .tmpl-nav-item{height:62px;font-size:12px;gap:4px}
          .tmpl-nav-item svg{width:26px;height:26px}
          .tmpl-nav-center{height:62px}
          .tmpl-nav-center img{width:58px;height:58px}
          .tmpl-nav-icon-wrap b{width:18px;height:18px;font-size:10px}
        }
      `}</style>

      <div className="app-shell">
        <aside className="sidebar">
          <div className="upgrade-wrap"><button className="upgrade" onClick={() => router.push('/premium')}>Upgrade</button></div>
          <div className="visitor-block">
            <div className="visitor-photo-wrap">
              {(profile as any)?.photos?.[0] ? (
                <img src={storageService.getFilePreview((profile as any).photos[0])} className="visitor-photo" alt="" />
              ) : (
                <div className="visitor-photo" style={{ display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#ff9f00,#d90042)', color: '#fff', fontSize: 26, fontWeight: 700 }}>{initial}</div>
              )}
              <span className="visitor-count">{likesCount}</span>
            </div>
            <div className="visitor-label">Visitors</div>
          </div>
          <div className="sort-row"><span>Sort by:</span> <button>Recent <span>⌄</span></button></div>
          <div className="activity-list">
            <div className="activity-card"><span>2m ago</span><b>›</b></div>
            <div className="activity-card"><span>15m ago</span><b>›</b></div>
            <div className="activity-card"><span>1h ago</span><b>›</b></div>
            <div className="activity-card"><span>2h ago</span><b>›</b></div>
          </div>
          <div className="sidebar-bottom" role="button" tabIndex={0} onClick={() => router.push('/edit-profile')}>
            <div className="profile-icon">♙</div>
            <div>Profile</div>
          </div>
        </aside>

        {failed ? (
          <div className="profile-state">
            Profile not found.
            <div><button onClick={() => router.back()}>Go back</button></div>
          </div>
        ) : loading && !user ? (
          <div className="profile-state">Loading…</div>
        ) : user ? (
          <main className="profile-card">
            <section className="hero">
              {hero ? <img src={hero} alt={name} /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 90, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg,#ef315a,#e48b1a)' }}>{initial}</div>}
              <div className="online"><i></i> {online ? 'Online' : 'Offline'}</div>
              <div className="counter">{heroIdx + 1}/{Math.max(1, photos.length)}</div>
              <button className="back" aria-label="Back" onClick={() => router.back()}>‹</button>
            </section>

            <section className="content">
              <div className="name-row">
                <div>
                  <h1><b className="pf-name">{name}</b>{Array.isArray(user.interests) && user.interests.length > 0 && <span className="pf-interests">♥</span>}{age ? <span>, {age}</span> : null}{user.verified ? <em>✓</em> : null}</h1>
                  {city && <div className="location">⌖ <span>{city}{distance !== null && distance !== undefined && isFinite(distance) ? ` (${distance}km away)` : ''}</span></div>}
                </div>
                <div className="actions">
                  <button className="action-btn message" aria-label="Message" onClick={() => matchId ? router.push(`/chat/${matchId}`) : router.push('/matches')}>
                    <svg viewBox="0 0 48 48"><path d="M10 36l2-8a14 14 0 1 1 6 6l-8 2Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="19" cy="23" r="1.6" fill="currentColor" stroke="none"/><circle cx="24" cy="23" r="1.6" fill="currentColor" stroke="none"/><circle cx="29" cy="23" r="1.6" fill="currentColor" stroke="none"/></svg>
                  </button>
                  <button className="action-btn gift" aria-label="Gift" onClick={() => router.push('/wallet')}>
                    <svg viewBox="0 0 48 48"><path d="M10 21h28v3a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2ZM12 26h24v9a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2ZM24 20v17M24 20c-5 0-8-3-8-6 0-2 2-4 4-4 3 0 4 2 4 4 0-2 1-4 4-4 2 0 4 2 4 4 0 3-3 6-8 6Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>

              {Array.isArray(user.interests) && user.interests.length > 0 && (
                <div className="tags">
                  {user.interests.map((t: string, i: number) => (
                    <span key={i}><i className="tag-icon">{interestIcon(t)}</i> {t}</span>
                  ))}
                </div>
              )}

              {user.bio && <hr />}

              {user.bio && (
                <section className="about">
                  <h2>About me</h2>
                  <p>{user.bio}</p>
                </section>
              )}

              {details.length > 0 && (
                <section className="details">
                  {!user.bio && <hr />}
                  {details.map((d, i) => (
                    <div className="detail-row" key={i}>
                      <span className="detail-icon">{d.icon}</span>
                      <span>{d.label}</span>
                      <strong>{d.value}</strong>
                    </div>
                  ))}
                </section>
              )}

              {gallery.length > 0 && (
                <>
                  <hr />
                  <section className="more">
                    <h2>More about {name.split(' ')[0]}</h2>
                    <div className="gallery">
                      {gallery.map((src, i) => (
                        <img key={i} src={src} alt="" onClick={() => swapPhoto(photos.indexOf(src), src)} />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </section>
          </main>
        ) : null}
      </div>

      <nav className="tmpl-bottom-nav">
        <Link href="/home" className="tmpl-nav-item">
          <svg viewBox="0 0 48 48"><path d="M8 22 24 9l16 13v17H29V28H19v11H8Z"/></svg><span>Home</span>
        </Link>
        <Link href="/explore" className="tmpl-nav-item">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" fill="none"/><path d="m19 29 4-10 9-4-4 9-9 5Z"/></svg><span>Explore</span>
        </Link>
        <Link href="/discover" className="tmpl-nav-center"><img src="/logo-icon.png?v=2" alt="Discover" /></Link>
        <Link href="/matches" className="tmpl-nav-item">
          <span className="tmpl-nav-icon-wrap"><svg viewBox="0 0 48 48"><path d="M9 34l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none"/><circle cx="19" cy="22" r="2"/><circle cx="25" cy="22" r="2"/><circle cx="31" cy="22" r="2"/></svg><b>{messagesCount || 0}</b></span><span>Messages</span>
        </Link>
        <Link href="/edit-profile" className="tmpl-nav-item">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="17" r="7" fill="none"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none"/></svg><span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}