'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService } from '@/lib/cloudflare/services';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MyMatchesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [likesPhoto, setLikesPhoto] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = React.useRef<any>(null);

  const uid = (profile as any)?.$id || (profile as any)?.id;
  const profilePhoto = profile?.photos?.[0] ? storageService.getFilePreview(profile.photos[0]) : '';
  const firstName = ((profile as any)?.fullName || 'O').trim().split(' ')[0];

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1400);
  };

  useEffect(() => {
    if (!uid) return;
    matchService.getUserMatches(uid)
      .then((docs: any) => {
        const arr = Array.isArray(docs) ? docs : (docs?.documents || []);
        const withPhotos = arr.map((m: any) => {
          const mp = m.matchedUser;
          if (!mp) return m;
          return {
            ...m,
            matchedUser: {
              ...mp,
              _photoUrl: mp.photos?.[0] ? storageService.getFilePreview(mp.photos[0]) : '',
            },
          };
        });
        setMatches(withPhotos);
        setMessagesCount(arr.filter((d: any) => d.hasConversation).length);
      })
      .catch(() => {});
    matchService.getWhoLikedMe(uid)
      .then((docs: any) => {
        const arr = Array.isArray(docs) ? docs : (docs?.documents || []);
        setLikesCount(arr.length);
        const first = arr[0]?.matchedUser;
        if (first?.photos?.[0]) setLikesPhoto(storageService.getFilePreview(first.photos[0]));
      })
      .catch(() => {});
  }, [uid]);

  const initial = (name: string) => (name?.[0] || 'M').toUpperCase();
  const matchPhoto = matches[0]?.matchedUser?._photoUrl || '';

  return (
    <div className="app">
      <style jsx global>{`
        *{box-sizing:border-box}
        :root{--red:#ed1744;--dark:#111;--muted:#555;--border:#ececec}
        html,body{margin:0;background:#fff;color:var(--dark);font-family:Inter,Arial,Helvetica,sans-serif}
        button{font:inherit;border:0;background:none;cursor:pointer}
        .app{width:100%;max-width:1100px;min-height:100vh;margin:auto;padding-bottom:105px}

        .header{height:190px;position:relative;display:flex;align-items:flex-start;justify-content:center;padding-top:30px}
        .menu{position:absolute;left:37px;top:92px;width:42px;height:40px;display:flex;flex-direction:column;justify-content:space-between;padding:4px 0}
        .menu i{display:block;width:38px;height:3px;border-radius:5px;background:#111}
        .logo{font-family:Georgia,'Times New Roman',serif;color:#d90e1d;font-size:65px;font-weight:bold;letter-spacing:-4px;line-height:.8}
        .logoMark{display:inline-block;border:6px solid #d90e1d;border-radius:50%;width:75px;height:75px;position:relative;vertical-align:-8px;margin-right:-18px}
        .logoMark:before{content:"♥";position:absolute;top:-28px;left:-8px;background:#fff;color:#d90e1d;font-family:Arial;font-size:28px;line-height:25px}
        .logoMark:after{content:"♥";position:absolute;right:-29px;top:0;color:#d90e1d;font-size:22px}
        .tag{position:absolute;top:143px;left:50%;transform:translateX(-50%);font-size:17px;letter-spacing:10px;font-weight:500;white-space:nowrap}
        .tag:before,.tag:after{content:"";display:inline-block;width:38px;height:2px;background:#df1b39;vertical-align:middle;margin:0 18px}
        .chat{position:absolute;right:35px;top:90px;width:48px;height:48px}
        .chat svg{width:44px;height:44px;stroke:#111;fill:none;stroke-width:2}
        .badge{position:absolute;right:-1px;top:-5px;width:29px;height:29px;background:var(--red);color:#fff;border-radius:50%;font-size:15px;display:grid;place-items:center}

        .premium{height:130px;margin:0 36px 20px;border-radius:24px;background:linear-gradient(100deg,#fff2f5,#fff0f3);display:flex;align-items:center;padding:18px 35px}
        .crown{width:96px;height:96px;border-radius:50%;background:linear-gradient(145deg,#ef315a,#e5003e);display:grid;place-items:center;color:#ffe226;font-size:49px;box-shadow:0 6px 14px #ef17442b;flex:none}
        .premiumText{margin-left:38px;line-height:1.18}
        .premiumText b{font-size:25px}
        .premiumText div{font-size:20px;color:#333;margin-top:7px;max-width:320px}
        .upgrade{margin-left:auto;border-radius:40px;background:var(--red);color:#fff;font-size:25px;font-weight:700;padding:17px 38px;box-shadow:0 5px 10px #e91a3d25}

        .tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;padding:0 70px 24px}
        .tab{text-align:center;position:relative}
        .avatarRing{width:145px;height:145px;margin:auto;border-radius:50%;padding:5px;background:linear-gradient(145deg,#df123b,#e48b1a);position:relative}
        .tab:first-child .avatarRing{border:2px dashed #e71943;padding:4px;background:#fff}
        .avatarRing img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
        .ringFallback{width:100%;height:100%;border-radius:50%;display:grid;place-items:center;font-size:40px;font-weight:bold;color:#fff;background:linear-gradient(145deg,#df123b,#e48b1a)}
        .tabCount{position:absolute;right:-2px;bottom:3px;width:36px;height:36px;border-radius:50%;background:var(--red);color:#fff;border:2px solid #fff;display:grid;place-items:center;font-size:16px;font-weight:bold}
        .plus{font-size:31px}
        .tabName{font-size:21px;font-weight:600;margin-top:10px}
        .tab.active .tabName{color:var(--red)}

        .heading{display:flex;align-items:center;justify-content:space-between;padding:0 40px 20px}
        .heading h1{font-size:29px;margin:0}
        .sort{font-size:19px;color:#555}
        .sort b{color:var(--red);font-size:20px;margin-left:5px}
        .sort span{font-size:23px;color:var(--red);margin-left:5px}

        .list{padding:0 40px}
        .match{width:100%;height:158px;border:1px solid var(--border);border-radius:25px;margin-bottom:12px;display:flex;align-items:center;padding:10px 18px 10px 0;overflow:hidden;transition:.2s}
        .match:active{transform:scale(.995)}
        .photoWrap{width:192px;height:138px;flex:none;margin-right:25px;position:relative}
        .photoWrap img{width:100%;height:100%;object-fit:cover;border-radius:19px}
        .photoFallback{width:100%;height:100%;border-radius:19px;display:grid;place-items:center;font-size:54px;font-weight:bold;color:#fff;background:linear-gradient(135deg,#ef315a,#e48b1a)}
        .online{position:absolute;left:15px;top:14px;width:13px;height:13px;border-radius:50%;background:#13d86d;border:1px solid #fff}
        .smallHeart{position:absolute;right:-1px;bottom:-2px;width:39px;height:39px;border-radius:50%;background:#fff;display:grid;place-items:center;color:var(--red);font-size:22px;box-shadow:0 1px 5px #0002}
        .info{align-self:center;min-width:0}
        .personName{font-size:25px;font-weight:700;margin-bottom:10px;text-align:left}
        .verify{display:inline-grid;place-items:center;width:20px;height:20px;background:#277be0;color:#fff;border-radius:50%;font-size:12px;vertical-align:2px;margin-left:4px}
        .detail{font-size:19px;color:#565a63;margin:9px 0;display:flex;align-items:center;gap:10px;text-align:left}
        .detail svg{width:22px;height:22px;stroke:#30343a;fill:none;stroke-width:1.8;flex:none}
        .time{margin-left:auto;align-self:flex-start;margin-top:24px;color:#333;font-size:15px;white-space:nowrap}
        .arrow{font-size:37px;color:#555;margin-left:23px;margin-right:3px;font-weight:300}

        .bottom{position:fixed;z-index:50;bottom:0;left:50%;transform:translateX(-50%);width:min(1100px,100%);height:99px;background:rgba(255,255,255,.98);border-radius:27px 27px 0 0;box-shadow:0 -2px 15px #0000000d;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:7px 25px calc(5px + env(safe-area-inset-bottom))}
        .nav{color:#676a73;display:flex;flex-direction:column;align-items:center;gap:7px;font-size:15px}
        .nav svg{width:34px;height:34px;stroke:currentColor;fill:none;stroke-width:1.7}
        .nav.active{color:var(--red);font-weight:600}
        .discover{width:76px;height:76px;border-radius:50%;background:var(--red);border:5px solid #fff;color:#fff;display:grid;place-items:center;margin-top:-30px;box-shadow:0 2px 10px #0002}
        .discover svg{width:43px;height:43px}
        .msgIcon{position:relative}
        .msgCount{position:absolute;right:-4px;top:-4px;width:23px;height:23px;border-radius:50%;background:var(--red);color:#fff;display:grid;place-items:center;font-size:12px}

        .empty{padding:44px 20px;text-align:center;font-size:18px;color:#999}

        @media(max-width:700px){
         .app{padding-bottom:90px}
         .header{height:193px;padding-top:37px}
         .logo{font-size:47px;letter-spacing:-3px}
         .logoMark{width:55px;height:55px;border-width:4px;vertical-align:-5px;margin-right:-12px}
         .logoMark:before{font-size:20px;top:-20px;left:-5px}
         .logoMark:after{font-size:17px;right:-22px}
         .tag{top:145px;font-size:13px;letter-spacing:7px}
         .tag:before,.tag:after{width:31px;margin:0 13px}
         .menu{left:39px;top:96px;width:39px;height:38px}.menu i{width:37px}
         .chat{right:36px;top:91px;width:40px}.chat svg{width:40px}
         .badge{width:25px;height:25px;font-size:13px}
         .premium{height:130px;margin:0 36px 20px;padding:15px 20px;border-radius:22px}
         .crown{width:92px;height:92px}
         .premiumText{margin-left:26px}.premiumText b{font-size:22px}.premiumText div{font-size:18px}
         .upgrade{padding:16px 28px;font-size:21px}
         .tabs{gap:12px;padding:0 36px 23px}
         .avatarRing{width:126px;height:126px}
         .tabName{font-size:18px}.tabCount{width:33px;height:33px;font-size:14px}
         .heading{padding:0 40px 18px}.heading h1{font-size:27px}.sort{font-size:17px}
         .list{padding:0 38px}
         .match{height:158px;padding-right:13px}
         .photoWrap{width:192px;height:138px;margin-right:24px}
         .personName{font-size:24px}.detail{font-size:18px}
         .time{font-size:14px}.arrow{font-size:32px;margin-left:12px}
         .bottom{height:93px;padding-left:12px;padding-right:12px}
        }
        @media(max-width:560px){
         .header{height:193px}
         .premium{margin:0 16px 18px;height:120px;padding:12px 16px}
         .crown{width:78px;height:78px;font-size:40px}
         .premiumText{margin-left:18px}.premiumText b{font-size:18px}.premiumText div{font-size:15px}
         .upgrade{font-size:17px;padding:13px 20px}
         .tabs{padding:0 14px 20px;gap:4px}
         .avatarRing{width:86px;height:86px}
         .tabCount{width:27px;height:27px;font-size:12px}
         .tabName{font-size:13px;margin-top:8px}
         .heading{padding:0 20px 13px}.heading h1{font-size:23px}.sort{font-size:14px}
         .list{padding:0 16px}
         .match{height:130px;border-radius:20px;padding-right:9px}
         .photoWrap{width:155px;height:110px;margin-right:17px}
         .online{left:10px;top:10px;width:12px;height:12px}
         .smallHeart{width:36px;height:36px}
         .personName{font-size:19px;margin-bottom:5px}.verify{width:17px;height:17px;font-size:10px}
         .detail{font-size:14px;margin:6px 0;gap:7px}.detail svg{width:18px;height:18px}
         .time{font-size:12px;margin-top:18px}.arrow{font-size:27px;margin-left:7px}
         .nav{font-size:12px;gap:4px}.nav svg{width:29px;height:29px}
         .discover{width:67px;height:67px}.discover svg{width:37px;height:37px}
        }
        @media(max-width:390px){
         .menu{left:18px}.chat{right:18px}
         .logo{font-size:41px}
         .premium{margin-left:10px;margin-right:10px}
         .premiumText{margin-left:12px}.premiumText b{font-size:16px}.premiumText div{font-size:13px}
         .upgrade{font-size:15px;padding:11px 15px}
         .tabs{padding-left:7px;padding-right:7px}.avatarRing{width:75px;height:75px}.tabName{font-size:12px}
         .heading{padding-left:13px;padding-right:13px}.heading h1{font-size:21px}
         .list{padding:0 10px}
         .match{height:119px}.photoWrap{width:135px;height:101px;margin-right:12px}
         .personName{font-size:17px}.detail{font-size:12px}.time{display:none}.arrow{font-size:24px}
        }
        @media(max-width:1080px){
         .tabs{gap:14px;padding-left:30px;padding-right:30px}
         .premiumText b{font-size:21px}.premiumText div{font-size:17px}
         .upgrade{font-size:20px;padding:15px 26px}
        }
      `}</style>

      <header className="header">
        <button className="menu" onClick={() => router.push('/settings')}><i></i><i></i><i></i></button>
        <div className="logo"><span className="logoMark"></span>dogwu</div>
        <div className="tag">DATING</div>
        <button className="chat" aria-label="Messages" onClick={() => router.push('/matches')}>
          <svg viewBox="0 0 48 48"><path d="M8 23c0-8 7-14 16-14s16 6 16 14-7 14-16 14c-3 0-5-.5-8-1.7L8 39l1.6-6.4C8.6 29.9 8 26.6 8 23Z"/><path d="M17 23h.1M24 23h.1M31 23h.1"/></svg>
          {messagesCount > 0 && <span className="badge">{messagesCount}</span>}
        </button>
      </header>

      <section className="premium">
        <div className="crown">♛</div>
        <div className="premiumText"><b>Upgrade to Premium</b><div>Unlock all features and<br />connect without limits</div></div>
        <button className="upgrade" onClick={() => router.push('/premium')}>Upgrade</button>
      </section>

      <section className="tabs">
        <button className="tab" onClick={() => router.push('/home')}>
          <div className="avatarRing">{profilePhoto ? <img src={profilePhoto} alt="" /> : <div className="ringFallback">{firstName[0] || '+'}</div>}<span className="tabCount plus">+</span></div>
          <div className="tabName">Your Story</div>
        </button>
        <button className="tab" onClick={() => router.push('/likes')}>
          <div className="avatarRing">{likesPhoto ? <img src={likesPhoto} alt="" /> : <div className="ringFallback">♡</div>}{likesCount > 0 && <span className="tabCount">{likesCount}</span>}</div>
          <div className="tabName">Likes You</div>
        </button>
        <button className="tab active" onClick={() => showToast('You are on Matches')}>
          <div className="avatarRing">{matchPhoto ? <img src={matchPhoto} alt="" /> : <div className="ringFallback">♥</div>}{matches.length > 0 && <span className="tabCount">{matches.length}</span>}</div>
          <div className="tabName">Matches</div>
        </button>
        <button className="tab" onClick={() => showToast('No visitors yet')}>
          <div className="avatarRing"><div className="ringFallback">◎</div></div>
          <div className="tabName">Visitors</div>
        </button>
      </section>

      <section>
        <div className="heading"><h1>Your Matches</h1><button className="sort" onClick={() => showToast('Sort options')}>Sort by: <b>Recent</b> <span>⌄</span></button></div>
        <div className="list">
          {matches.length === 0 && <div className="empty">No matches yet — keep swiping on Discover!</div>}
          {matches.map((m: any) => {
            const mp = m.matchedUser || {};
            const name = mp.fullName || 'Member';
            const photo = mp._photoUrl || '';
            const isOnline = !!mp.lastActive && (Date.now() - new Date(mp.lastActive).getTime()) < 120000;
            return (
              <article key={m.$id} className="match" onClick={() => router.push(`/chat/${m.$id}`)}>
                <div className="photoWrap">
                  {photo ? <img src={photo} alt="" /> : <div className="photoFallback">{initial(name)}</div>}
                  {isOnline && <span className="online"></span>}
                  <span className="smallHeart">♥</span>
                </div>
                <div className="info">
                  <div className="personName">{name}{mp.age ? `, ${mp.age}` : ''}{mp.verified && <span className="verify">✓</span>}</div>
                  {mp.city && <div className="detail"><svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-12A7 7 0 0 0 5 9c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>{mp.city}</div>}
                  {mp.occupation && <div className="detail"><svg viewBox="0 0 24 24"><path d="M5 7h14v12H5zM8 7V4h8v3M8 11h8"/></svg>{mp.occupation}</div>}
                </div>
                <span className="time">{timeAgo(m.matchedAt || m.createdAt || '')}</span><span className="arrow">›</span>
              </article>
            );
          })}
        </div>
      </section>

      <nav className="bottom">
        <button className="nav" onClick={() => router.push('/home')}><svg viewBox="0 0 40 40"><path d="m6 18 14-12 14 12v16H24v-9h-8v9H6Z"/></svg>Home</button>
        <button className="nav" onClick={() => router.push('/explore')}><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14"/><path d="m26 14-4 10-10 4 4-10 10-4Z"/></svg>Explore</button>
        <button className="nav active" onClick={() => router.push('/discover')}><span className="discover"><svg viewBox="0 0 40 40"><path d="M29 10a12 12 0 1 0 2 18"/><path d="M29 7v8h-8"/></svg></span>Discover</button>
        <button className="nav" onClick={() => router.push('/matches')}><span className="msgIcon"><svg viewBox="0 0 40 40"><path d="M6 19c0-7 6-12 14-12s14 5 14 12-6 12-14 12c-2 0-5-.5-7-1.5L7 32l1.3-5C6.8 24.8 6 22 6 19Z"/></svg>{messagesCount > 0 && <span className="msgCount">{messagesCount}</span>}</span>Messages</button>
        <button className="nav" onClick={() => router.push('/edit-profile')}><svg viewBox="0 0 40 40"><circle cx="20" cy="13" r="6"/><path d="M9 34c1-7 5-11 11-11s10 4 11 11"/></svg>Profile</button>
      </nav>

      {toast && <div id="toast">{toast}</div>}
      <style jsx global>{`
        #toast{position:fixed;z-index:100;left:50%;bottom:112px;transform:translateX(-50%);background:#111;color:#fff;padding:11px 18px;border-radius:24px;font:14px Arial;opacity:1}
      `}</style>
    </div>
  );
}