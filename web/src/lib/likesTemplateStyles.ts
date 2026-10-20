export const LIKES_TEMPLATE_CSS = `
        .lk{--red:#e71943;--pink:#f12655;--text:#151515;--muted:#666;--line:#eee;--bg:#fff;--soft:#fff4f6}
        .lk button{font:inherit;border:0;background:none;cursor:pointer}
        .lk .app{width:100%;max-width:1360px;margin:0 -24px;min-height:100vh;padding-bottom:10px}

        /* Header (matches home) */
        .lk .topbar{display:flex;align-items:center;justify-content:space-between;position:relative;padding:6px 10px 12px;background:#fff}
        .lk .menu{width:38px;height:auto;padding:0;display:block}
        .lk .menu span{display:block;width:34px;height:3px;background:#222;margin:7px 0;border-radius:2px}
        .lk .brand-logo{height:44px;width:auto;object-fit:contain;display:block}
        .lk .messages{position:relative;width:50px;height:50px;display:block;color:#171717;padding:0}
        .lk .messages svg{width:40px;height:40px}
        .lk .messages em{position:absolute;right:0;top:-4px;background:#d71945;color:#fff;width:24px;height:24px;border-radius:50%;font-style:normal;font-size:13px;display:grid;place-items:center;font-weight:700}

        /* Quick nav (matches home) */
        .lk .quick-nav{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:2px 10px 4px}
        .lk .quick{display:flex;flex-direction:column;align-items:center;padding:0;color:#171717;min-width:0}
        .lk .round-photo{width:54px;max-width:100%;aspect-ratio:1/1;border-radius:50%;padding:2px;display:block;position:relative;background:#fff;box-sizing:border-box}
        .lk .round-photo:not(.location):not(.story){background:conic-gradient(#E67A00 0 50%,#D90540 50% 100%)}
        .lk .quick:nth-child(3) .round-photo:not(.location):not(.story){background:conic-gradient(#D90540 0 55%,#FF5A3C 55% 100%)}
        .lk .round-photo.story{border:none;background:conic-gradient(#D90540 0 calc(var(--pct,0)*1%),transparent 0)}
        .lk .round-photo.story::after{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(#E77A99 0 6deg,transparent 6deg 11deg);-webkit-mask:conic-gradient(transparent 0 calc(var(--pct,0)*1%),#000 calc(var(--pct,0)*1%) 360deg);mask:conic-gradient(transparent 0 calc(var(--pct,0)*1%),#000 calc(var(--pct,0)*1%) 360deg);z-index:1;pointer-events:none}
        .lk .round-photo.story img,.lk .round-photo.story .initial,.lk .round-photo.story .fallback{z-index:2}
        .lk .round-photo img,.lk .round-photo .initial,.lk .round-photo .fallback{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);border-radius:50%;object-fit:cover;display:block;filter:brightness(0.85);box-shadow:0 0 0 2px #fff}
        .lk .round-photo .fallback{background:#fff;display:grid;place-items:center}
        .lk .round-photo .fallback svg{width:38%;height:38%;fill:#FF2E5F;display:block}
        .lk .round-photo .initial{display:grid;place-items:center;font-size:15px;font-weight:800;color:#fff;background:linear-gradient(135deg,#FF2E5F,#B44CFF)}
        .lk .round-photo.location{display:block;background:conic-gradient(#D90540 0 180deg,#B9CE1A 180deg 360deg)}
        .lk .round-photo.location svg{position:absolute;inset:4px;width:calc(100% - 8px);height:calc(100% - 8px);background:#F1F0EE;border-radius:50%;padding:17%;box-sizing:border-box;fill:#D90540;box-shadow:0 0 0 2px #fff}
        .lk .badge-count,.lk .plus{position:absolute;right:-3px;bottom:-3px;background:#D90540;color:#fff;border-radius:50%;width:19px;height:19px;display:grid;place-items:center;font-size:10px;font-weight:600;z-index:3;border:2px solid #fff;line-height:1;padding:0;box-sizing:border-box}
        .lk .plus{font-size:15px;font-weight:500}
        .lk .quick label{font-size:10.5px;font-weight:500;margin-top:7px;color:#111;text-align:center;line-height:13px;cursor:pointer}
        .lk .quick.active label{color:var(--red);font-weight:700}

        /* Section title */
        .lk .section-head{display:flex;align-items:center;justify-content:space-between;padding:2px 10px 6px}
        .lk .section-title{font-size:15px;font-weight:700}
        .lk .section-title span{font-size:9px;background:var(--red);color:#fff;border-radius:20px;padding:1px 4px;vertical-align:middle}
        .lk .sort{display:flex;align-items:center;gap:5px;color:var(--red);font-size:14px;padding:2px}
        .lk .sort svg{width:18px;height:18px;stroke:var(--red);fill:none;stroke-width:1.8}
        .lk .sort-wrap{position:relative}
        .lk .sort-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:20;background:#fff;border:1px solid #eee;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:150px;overflow:hidden;padding:4px}
        .lk .sort-item{display:block;width:100%;text-align:left;padding:9px 12px;font-size:13px;border-radius:8px;color:#333}
        .lk .sort-item.active{color:var(--red);font-weight:700}
        .lk .sort-item:hover{background:#fff4f6}

        /* Cards */
        .lk .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0}
        .lk .card{position:relative;height:180px;border-radius:12px;overflow:hidden;background:#222;box-shadow:0 1px 3px rgba(0,0,0,.12)}
        .lk .card-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;filter:saturate(1.02)}
        .lk .card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 25%,rgba(0,0,0,.76) 100%)}
        .lk .heart-outline{position:absolute;right:8px;top:8px;z-index:3;color:#fff;padding:0;width:28px;height:28px;display:grid;place-items:center}
        .lk .heart-outline svg{width:24px;height:24px;fill:none;stroke:#fff;stroke-width:1.7}
        .lk .card-info{position:absolute;left:10px;right:10px;bottom:48px;z-index:3;color:#fff}
        .lk .name{font-size:16px;font-weight:600;margin-bottom:4px}
        .lk .verified{display:inline-grid;place-items:center;background:var(--red);border-radius:50%;width:14px;height:14px;font-size:9px;vertical-align:1px;margin-left:2px}
        .lk .meta{font-size:12px;margin-top:3px;display:flex;align-items:center;gap:5px}
        .lk .meta svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:1.7;flex:none}
        .lk .card-actions{position:absolute;z-index:4;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:22px}
        .lk .card-btn{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#fff;color:var(--red);box-shadow:0 2px 8px rgba(0,0,0,.12);font-size:20px}
        .lk .card-btn.like{background:var(--red);color:#fff}
        .lk .card-btn:active{transform:scale(.93)}
        .lk .card-btn:disabled{opacity:.5}

        /* Toast */
        .lk.toast{position:fixed;z-index:50;left:50%;bottom:100px;transform:translateX(-50%) translateY(20px);background:#171717;color:#fff;padding:11px 17px;border-radius:30px;opacity:0;pointer-events:none;transition:.25s;font-size:14px;white-space:nowrap;max-width:calc(100% - 40px)}

        /* Loading */
        .lk .state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 12px;gap:10px;text-align:center}
        .lk .spinner{width:32px;height:32px;border-radius:10px;border:3px solid rgba(231,25,67,.2);border-top-color:#e71943;animation:lk-spin .8s linear infinite}
        @keyframes lk-spin{to{transform:rotate(360deg)}}
        .lk .state-title{font-size:16px;font-weight:800;color:#151515}
        .lk .state-sub{font-size:12px;color:#8a8a8f;max-width:240px}

        /* Mobile */
        @media(max-width:700px){
          .lk .app{margin:0 -16px;padding-bottom:8px}
          .lk .topbar{padding:4px 8px 10px}
          .lk .menu span{width:28px}
          .lk .messages{width:44px;height:44px}
          .lk .messages svg{width:34px;height:34px}
          .lk .messages em{width:21px;height:21px;font-size:12px;right:-2px}
          .lk .quick-nav{gap:6px;padding:2px 6px 4px}
          .lk .round-photo .initial{font-size:12px}
          .lk .badge-count,.lk .plus{width:18px;height:18px;font-size:9px;right:-2px;bottom:-2px}
          .lk .plus{font-size:13px}
          .lk .section-head{padding:2px 6px 4px}
          .lk .section-title{font-size:13.5px}
          .lk .sort{font-size:12px}
          .lk .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;padding:0}
          .lk .card{height:160px;border-radius:10px}
          .lk .name{font-size:13px}
          .lk .meta{font-size:10px}
          .lk .card-actions{gap:16px}.lk .card-btn{width:34px;height:34px;font-size:16px}
          .lk .card-info{bottom:40px;left:7px;right:7px}
          .lk .heart-outline{right:5px;top:5px}.lk .heart-outline svg{width:18px;height:18px}
        }
        @media(max-width:380px){
          .lk .menu span{width:24px}
          .lk .messages{width:38px;height:38px}
          .lk .messages svg{width:30px;height:30px}
          .lk .topbar{padding:4px 6px 10px}
          .lk .badge-count,.lk .plus{width:16px;height:16px;font-size:8px;right:-2px;bottom:-2px}
          .lk .plus{font-size:12px}
          .lk .card{height:150px}
          .lk .card-btn{width:30px;height:30px;font-size:14px}
          .lk .card-actions{gap:12px;bottom:5px}
          .lk .card-info{bottom:36px}
        }
`;