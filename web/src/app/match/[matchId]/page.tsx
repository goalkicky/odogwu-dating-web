'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, matchService } from '@/lib/cloudflare/services';
import { captureStream, mediaConstraints, mediaErrorMessage } from '@/lib/media';

export default function MatchPage() {
  const router = useRouter();
  const params = useParams<{ matchId: string }>();
  const { profile } = useAuth();
  const matchId = params?.matchId || '';

  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherId, setOtherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const myId = (profile as any)?.$id || (profile as any)?.id;
  const myPhoto = (profile as any)?._photoUrl || ((profile as any)?.photos?.[0] ? storageService.getFilePreview((profile as any).photos[0]) : '');

  useEffect(() => {
    if (!matchId) return;
    matchService.getMatch(matchId).then((doc: any) => {
      const other = doc.userId === myId ? doc.matchedUserId : doc.userId;
      setOtherId(other);
      userService.getProfile(other).then((p: any) => setOtherUser(p)).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, [matchId, myId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastVisible(false), 2200);
  };

  const firstName = (otherUser?.fullName || otherId || 'Someone').split(' ')[0];
  const theirPhoto = otherUser?.photos?.[0] ? storageService.getFilePreview(otherUser.photos[0]) : '';

  const startVideoCall = async () => {
    if (!otherId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints('video'));
      captureStream(stream);
      router.push(`/call/${matchId}?type=video&otherId=${otherId}`);
    } catch (err: any) {
      showToast(mediaErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #fff0f3', borderTopColor: '#ed1839', animation: 'matchSpin 0.7s linear infinite' }} />
        <style jsx>{`
          @keyframes matchSpin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="mx-page">
      <style jsx>{`
        .mx-page{--red:#ed1839;--red2:#ef1738;--orange:#ff9d00;--ink:#101014;--muted:#5d5d63;--paper:#fffafb;--card:#fff;box-sizing:border-box;min-height:100vh;font-family:Arial,Helvetica,sans-serif;background:#fff;color:var(--ink);display:flex;justify-content:center;overflow-x:hidden}
        .mx-page *{box-sizing:border-box}
        .mx-page button{font:inherit;border:0;cursor:pointer}
        .app-shell{position:relative;width:min(100%,1024px);min-height:100vh;padding:30px 7.2% 28px;overflow:hidden;background:linear-gradient(180deg,#fffafa 0%,#fff 82%,#fff 100%)}
        .brand{position:relative;text-align:center;z-index:2;margin-top:2px}
        .brand-mark{position:absolute;left:calc(50% - 187px);top:2px;width:96px;height:96px;border:8px solid #c90d1f;border-radius:50%}
        .mark-heart{position:absolute;left:-5px;top:-13px;background:#c90d1f;color:white;width:35px;height:35px;border-radius:50%;font-size:21px;display:grid;place-items:center;transform:rotate(-8deg)}
        .brand-word{display:inline-block;color:#c90d1f;font-family:Georgia,serif;font-weight:700;font-size:64px;line-height:1;letter-spacing:-3px;position:relative}
        .brand-heart{position:absolute;right:-18px;top:-14px;font-family:Arial;font-size:39px;transform:rotate(-12deg)}
        .tagline{display:flex;justify-content:center;align-items:center;gap:20px;margin-top:12px;font-size:18px;letter-spacing:7px}
        .tagline i{width:36px;height:2px;background:#df2440}
        .tagline b{color:#df2440;font-size:13px;letter-spacing:0}
        .hero{text-align:center;position:relative;z-index:2;margin-top:20px}
        .match-icon{width:190px;height:190px;border-radius:50%;margin:0 auto 9px;background:linear-gradient(145deg,#ff642f,#ef1438 72%);border:12px solid #fff;box-shadow:0 7px 30px rgba(220,30,55,.14),0 0 0 1px #f7dfe2;display:grid;place-items:center}
        .match-icon span{font-size:94px;line-height:1;color:#fff;margin-top:-5px}
        .hero h1{margin:0;font-size:68px;line-height:1.03;letter-spacing:-2.7px;font-weight:800}
        .hero h1 strong{color:#d91935}
        .subtitle{margin:18px 0 10px;color:#595b61;font-size:29px;line-height:1.2}
        .profiles{position:relative;display:flex;justify-content:center;gap:34px;margin:0 auto 27px;max-width:720px;z-index:3}
        .profile-card{width:330px;height:300px;border:8px solid #ef233c;border-radius:52px;overflow:hidden;background:#ddd;box-shadow:0 5px 13px rgba(0,0,0,.04)}
        .profile-card.left{transform:rotate(-3deg)}
        .profile-card.right{transform:rotate(3deg)}
        .profile-card img{width:100%;height:100%;object-fit:cover;display:block}
        .between-heart{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-45%);width:91px;height:91px;border-radius:50%;background:#ef1637;border:7px solid #fff;display:grid;place-items:center;box-shadow:0 5px 16px rgba(0,0,0,.08)}
        .between-heart span{color:#fff;font-size:48px;line-height:1}
        .story-card{width:min(100%,675px);margin:0 auto 29px;padding:25px 34px;background:#fff;border-radius:30px;box-shadow:0 6px 25px rgba(0,0,0,.08);display:flex;align-items:center;gap:26px;position:relative;z-index:3}
        .story-icon{font-size:57px;line-height:1;color:#f64b41;text-shadow:18px 7px 0 #ff9d00}
        .story-card strong{font-size:27px;display:block;margin-bottom:8px}
        .story-card p{font-size:25px;color:#696970;margin:0}
        .actions{display:flex;flex-direction:column;gap:17px;width:min(100%,785px);margin:0 auto 23px;position:relative;z-index:3}
        .action{width:100%;height:82px;border-radius:44px;display:flex;align-items:center;justify-content:center;gap:24px;font-size:30px;font-weight:500;transition:transform .15s,box-shadow .15s}
        .action:active,.quick-card:active{transform:scale(.98)}
        .primary{color:#fff;background:linear-gradient(100deg,#ed1238,#ff9c00);box-shadow:0 4px 12px rgba(238,31,50,.12)}
        .secondary{color:#17171a;background:#fff;border:1px solid #e4e4e6}
        .btn-icon{font-size:36px;line-height:1;color:#fff}
        .secondary .btn-icon{color:#df1937}
        .bubble{width:42px;height:34px;border:4px solid #fff;border-radius:50%;font-size:18px;display:grid;place-items:center;letter-spacing:1px;position:relative}
        .bubble:after{content:"";position:absolute;bottom:-9px;left:3px;width:10px;height:10px;border-left:4px solid #fff;transform:skew(-25deg)}
        .gift{font-size:42px;transform:rotate(180deg)}
        .quick-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:25px;width:min(100%,880px);margin:0 auto;position:relative;z-index:3}
        .quick-card{min-height:195px;background:#fff;border-radius:27px;padding:20px 15px 16px;box-shadow:0 5px 22px rgba(0,0,0,.08);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;color:#111}
        .quick-icon{font-size:45px;line-height:1;margin:0 0 16px}
        .calendar{color:#ef8d0a}.video{color:#20c984}.swipe{color:#ec193c}
        .quick-card strong{font-size:23px;margin-bottom:10px}
        .quick-card>span:last-child{font-size:20px;line-height:1.45;color:#67676d}
        .decor{position:absolute;inset:0;pointer-events:none;z-index:1}
        .heart,.mini-heart,.spark{position:absolute;line-height:1}
        .heart{font-size:47px;color:#ed1b36}
        .mini-heart{font-size:22px;color:#f0a018}
        .spark{font-size:38px;color:#f3a000}
        .s1{left:20%;top:10.5%;color:#ef2943}.s2{right:27%;top:15%;color:#f09a00}
        .s3{left:13%;top:25%;color:#e91c3d}.s4{right:11%;top:24%;color:#e91c3d}
        .s5{left:8%;top:39%;color:#f2a000}.s6{right:13%;top:42%;color:#efb100}
        .s7{right:8%;top:55%;color:#e91c3d}.s8{left:14%;top:50%;color:#f09a00}
        .h1{left:11%;top:12%;transform:rotate(-18deg)}.h2{right:14%;top:11%;transform:rotate(15deg)}
        .h3{left:5.5%;top:30%;transform:rotate(-17deg)}.h4{right:9%;top:30%;transform:rotate(-15deg)}
        .h5{right:7%;top:44%;font-size:33px}.h6{left:9%;top:50%;font-size:30px}
        .h7{right:7%;top:67%;font-size:32px}.h8{left:8%;top:61%;font-size:30px}
        .mh1{left:7%;top:20%}.mh2{right:8%;top:37%}.mh3{left:32%;top:24%}.mh4{right:27%;top:21%}
        .toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,20px);opacity:0;pointer-events:none;background:#151515;color:#fff;padding:13px 22px;border-radius:30px;font-size:16px;z-index:20;transition:.25s ease;white-space:nowrap;box-shadow:0 7px 25px rgba(0,0,0,.2)}
        .toast.show{opacity:1;transform:translate(-50%,0)}
        .ph-fallback{width:100%;height:100%;display:grid;place-items:center;font-size:110px;font-weight:800;color:#fff;background:linear-gradient(135deg,#ef315a,#e48b1a)}
        @media (max-width:760px){
          .app-shell{padding:20px 7.5% 22px}
          .brand-mark{left:calc(50% - 150px);width:76px;height:76px;border-width:7px}
          .mark-heart{width:29px;height:29px;font-size:17px;top:-11px}
          .brand-word{font-size:50px}
          .brand-heart{font-size:31px;right:-15px;top:-10px}
          .tagline{font-size:15px;letter-spacing:5px;gap:13px;margin-top:9px}
          .tagline i{width:28px}
          .match-icon{width:150px;height:150px;border-width:10px}
          .match-icon span{font-size:73px}
          .hero{margin-top:18px}
          .hero h1{font-size:52px;letter-spacing:-2px}
          .subtitle{font-size:21px;margin-top:14px}
          .profiles{gap:18px;margin-bottom:25px}
          .profile-card{width:calc(50% - 10px);height:245px;border-width:6px;border-radius:40px}
          .between-heart{width:70px;height:70px;border-width:5px}
          .between-heart span{font-size:36px}
          .story-card{padding:19px 24px;border-radius:25px;gap:18px}
          .story-icon{font-size:45px}
          .story-card strong{font-size:20px}
          .story-card p{font-size:18px}
          .action{height:68px;font-size:23px;gap:17px}
          .quick-actions{gap:12px}
          .quick-card{min-height:170px;padding:17px 7px 12px;border-radius:23px}
          .quick-icon{font-size:35px;margin-bottom:13px}
          .quick-card strong{font-size:17px;margin-bottom:8px}
          .quick-card>span:last-child{font-size:14px}
          .heart{font-size:35px}.spark{font-size:28px}
        }
        @media (max-width:480px){
          .app-shell{padding:13px 5.8% 18px}
          .brand-mark{left:calc(50% - 117px);top:0;width:59px;height:59px;border-width:5px}
          .mark-heart{width:23px;height:23px;font-size:14px;top:-8px}
          .brand-word{font-size:39px;letter-spacing:-2px}
          .brand-heart{font-size:25px;right:-12px;top:-8px}
          .tagline{font-size:11px;letter-spacing:4px;gap:9px;margin-top:7px}
          .tagline i{width:21px}
          .match-icon{width:112px;height:112px;border-width:8px;margin-bottom:6px}
          .match-icon span{font-size:55px}
          .hero{margin-top:13px}
          .hero h1{font-size:39px;letter-spacing:-1.5px}
          .subtitle{font-size:16px;margin-top:9px}
          .profiles{gap:11px;margin-bottom:18px}
          .profile-card{width:calc(50% - 6px);height:183px;border-width:5px;border-radius:29px}
          .between-heart{width:55px;height:55px;border-width:4px}
          .between-heart span{font-size:28px}
          .story-card{padding:15px 17px;border-radius:20px;gap:12px;margin-bottom:18px}
          .story-icon{font-size:34px}
          .story-card strong{font-size:15px;margin-bottom:5px}
          .story-card p{font-size:13px}
          .actions{gap:11px;margin-bottom:14px}
          .action{height:54px;font-size:17px;gap:11px}
          .btn-icon{font-size:27px}
          .bubble{width:31px;height:25px;border-width:3px;font-size:12px}
          .bubble:after{border-left-width:3px;border-bottom-width:0;bottom:-7px}
          .gift{font-size:30px}
          .quick-actions{gap:8px}
          .quick-card{min-height:135px;padding:12px 4px 9px;border-radius:17px}
          .quick-icon{font-size:27px;margin-bottom:9px}
          .quick-card strong{font-size:12px;margin-bottom:6px}
          .quick-card>span:last-child{font-size:10px;line-height:1.35}
          .heart{font-size:25px}.spark{font-size:20px}.mini-heart{font-size:14px}
          .toast{font-size:13px;max-width:90%;white-space:normal;text-align:center}
        }
        @media (max-width:350px){
          .hero h1{font-size:34px}.subtitle{font-size:14px}
          .profile-card{height:160px}.story-card p{font-size:12px}
          .quick-card{min-height:126px}.quick-card strong{font-size:11px}
        }
      `}</style>

      <main className="app-shell">
        <div className="decor" aria-hidden="true">
          <span className="spark s1">✦</span><span className="spark s2">✦</span><span className="spark s3">✦</span>
          <span className="spark s4">✦</span><span className="spark s5">✦</span><span className="spark s6">✦</span>
          <span className="spark s7">✦</span><span className="spark s8">✦</span>
          <span className="heart h1">♥</span><span className="heart h2">♥</span><span className="heart h3">♥</span>
          <span className="heart h4">♥</span><span className="heart h5">♥</span><span className="heart h6">♥</span>
          <span className="heart h7">♥</span><span className="heart h8">♥</span>
          <span className="mini-heart mh1">♥</span><span className="mini-heart mh2">♥</span>
          <span className="mini-heart mh3">♥</span><span className="mini-heart mh4">♥</span>
        </div>

        <header className="brand">
          <div className="brand-mark"><span className="mark-heart">♥</span></div>
          <div className="brand-word">dogwu<span className="brand-heart">♥</span></div>
          <div className="tagline"><i></i><span>D A T <b>♥</b> I N G</span><i></i></div>
        </header>

        <section className="hero" aria-labelledby="match-title">
          <div className="match-icon"><span>♥</span></div>
          <h1 id="match-title"><span>It&apos;s a</span> <strong>Match!</strong></h1>
          <p className="subtitle">You and {firstName} liked each other</p>
        </section>

        <section className="profiles" aria-label="Matched profiles">
          <div className="profile-card left">
            {myPhoto ? <img src={myPhoto} alt="" fetchPriority="high" decoding="async" /> : <div className="ph-fallback">{(profile as any)?.fullName?.[0] || 'O'}</div>}
          </div>
          <div className="between-heart"><span>♥</span></div>
          <div className="profile-card right">
            {theirPhoto ? <img src={theirPhoto} alt={firstName} fetchPriority="high" decoding="async" /> : <div className="ph-fallback">{firstName[0]}</div>}
          </div>
        </section>

        <section className="story-card">
          <div className="story-icon">✦</div>
          <div>
            <strong>Two hearts. One new story.</strong>
            <p>Say hi and see where it goes...</p>
          </div>
        </section>

        <section className="actions">
          <button className="primary action" onClick={() => router.push(`/chat/${matchId}`)}>
            <span className="btn-icon bubble">•••</span>
            <span>Send a Message</span>
          </button>
          <button className="secondary action" onClick={() => router.push(`/chat/${matchId}?gift=1`)}>
            <span className="btn-icon gift">♧</span>
            <span>Send a Gift</span>
          </button>
        </section>

        <section className="quick-actions">
          <button className="quick-card" onClick={() => showToast(`Let's plan a date with ${firstName}.`)}>
            <span className="quick-icon calendar">♥</span>
            <strong>Plan a Date</strong>
            <span>Turn your match<br />into a real date</span>
          </button>
          <button className="quick-card" onClick={startVideoCall}>
            <span className="quick-icon video">♥</span>
            <strong>Video Call</strong>
            <span>See each other<br />live</span>
          </button>
          <button className="quick-card" onClick={() => router.push('/discover')}>
            <span className="quick-icon swipe">♥</span>
            <strong>Keep Swiping</strong>
            <span>More people,<br />more possibilities</span>
          </button>
        </section>
      </main>

      <div className={`toast${toastVisible ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}