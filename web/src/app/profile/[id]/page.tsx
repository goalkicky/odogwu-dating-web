'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
        .name-row h1{margin:0;font-size:30px;line-height:1.1;letter-spacing:-.6px}
        .name-row h1 span{font-weight:500}
        .name-row h1 em{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;background:#2184ee;color:#fff;font-size:12px;font-style:normal;vertical-align:middle;margin-left:4px}
        .location{font-size:15px;color:#222;margin-top:12px;display:flex;gap:7px;align-items:center}
        .location span{color:#4c4c54}
        .actions{display:flex;gap:10px}
        .action-btn{width:61px;height:61px;border-radius:50%;display:grid;place-items:center;font-size:25px;cursor:pointer}
        .message{background:#fff;border:2px solid var(--pink);color:#111;letter-spacing:-2px}
        .gift{background:var(--pink);border:2px solid var(--pink);color:#fff}
        .tags{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 19px}
        .tags span{border:1px solid #e1e1e4;border-radius:20px;padding:8px 12px;font-size:14px;color:#303038;white-space:nowrap}
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
        .mobile-bar{display:none}
        .profile-state{padding:70px 20px;text-align:center;color:#888;font-size:15px;width:min(100%,540px);margin:0 auto;background:#fff;box-shadow:0 0 0 1px #ededee}
        .profile-state button{margin-top:14px;padding:12px 28px;border-radius:9999px;background:var(--pink);color:#fff;font-size:14px;font-weight:700;cursor:pointer;border:0}
        @media (max-width:760px){
          .profile-page{background:#fff}
          .app-shell{display:block;width:100%;padding:0}
          .sidebar{display:none}
          .profile-card{width:100%;max-width:none;border-radius:0;box-shadow:none}
          .hero{height:min(108vw,560px)}
          .content{padding:18px 16px 88px}
          .name-row{align-items:center}
          .name-row h1{font-size:27px}
          .location{font-size:14px}
          .action-btn{width:54px;height:54px}
          .tags{margin-top:22px}
          .tags span{font-size:13px;padding:7px 10px}
          .detail-row{grid-template-columns:27px 1fr 1.08fr;min-height:46px;font-size:14px}
          .gallery{gap:9px}
          .mobile-bar{position:fixed;left:0;right:0;bottom:0;height:66px;background:#fff;border-top:1px solid #e8e8ea;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;font-size:12px;box-shadow:0 -2px 12px rgba(0,0,0,.04)}
          .mobile-user{font-size:25px;line-height:24px}
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
                  <h1>{name}{age ? <span>, {age}</span> : null}{user.verified ? <em>✓</em> : null}</h1>
                  {city && <div className="location">⌖ <span>{city}{distance !== null && distance !== undefined && isFinite(distance) ? ` (${distance}km away)` : ''}</span></div>}
                </div>
                <div className="actions">
                  <button className="action-btn message" aria-label="Message" onClick={() => matchId ? router.push(`/chat/${matchId}`) : router.push('/matches')}>•••</button>
                  <button className="action-btn gift" aria-label="Gift" onClick={() => router.push('/wallet')}>♔</button>
                </div>
              </div>

              {Array.isArray(user.interests) && user.interests.length > 0 && (
                <div className="tags">
                  {user.interests.map((t: string, i: number) => (
                    <span key={i}>◉ {t}</span>
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

      <div className="mobile-bar" onClick={() => router.push('/edit-profile')}>
        <span className="mobile-user">♙</span>
        <span>Profile</span>
      </div>
    </div>
  );
}