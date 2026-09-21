export const BASIC_TEMPLATE_CSS = `
*{box-sizing:border-box}
.bk{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#17171c;background:#fff}
.bk button{font:inherit}
.bk .app-shell{width:100%;max-width:708px;min-height:100vh;margin:auto;padding:0 27px 20px;background:#fff;position:relative}
.bk .topbar{height:86px;display:grid;grid-template-columns:55px 1fr auto;align-items:start;position:relative}
.bk .back-btn{border:0;background:none;padding:6px 0 0 0;width:40px;height:40px;cursor:pointer}
.bk .back-btn svg{width:28px;height:28px;fill:none;stroke:#222;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bk .heading{text-align:center;margin-top:1px}.bk .heading h1{font-size:26px;line-height:1.15;margin:0;font-weight:650;letter-spacing:-.5px}.bk .heading p{font-size:16px;color:#666d78;margin:7px 0 0}
.bk .complete{font-size:16px;color:#df0b4d;font-weight:650;white-space:nowrap;padding-top:7px}
.bk .progress{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 2px;height:9px}
.bk .progress span{height:8px;background:#ed0750;border-radius:8px}
.bk .percent{text-align:center;color:#d80b4c;font-size:15px;font-weight:500;margin:16px 0 22px}
.bk .info-card{border:1px solid #ececef;border-radius:13px;overflow:hidden;box-shadow:0 1px 4px rgba(20,20,30,.025)}
.bk .info-row{min-height:109px;display:grid;grid-template-columns:59px minmax(0,1fr) auto 29px;column-gap:11px;align-items:center;padding:13px 16px 13px 17px;border-bottom:1px solid #ececef;width:100%;text-align:left;background:#fff;cursor:pointer}
.bk .info-row:last-child{border-bottom:0}
.bk .icon-box{width:48px;height:48px;border-radius:11px;background:#fff3f7;display:flex;align-items:center;justify-content:center}
.bk .icon-box svg{width:29px;height:29px;fill:none;stroke:#dc0a4b;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.bk .labels{min-width:0}.bk .labels strong{display:block;font-size:17px;font-weight:650;margin-bottom:5px}.bk .labels small{display:block;color:#6b7280;font-size:13.5px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bk .value{text-align:right;font-size:17px;color:#4c5260;max-width:250px;white-space:nowrap}
.bk .value.two-line{white-space:normal;line-height:1.35}.bk .value.two-line b{display:block;font-size:17px;font-weight:500}.bk .value.two-line small{display:block;color:#69707c;font-size:13.5px}
.bk .edit{border:0;background:transparent;padding:2px 0;cursor:pointer}.bk .edit svg{width:26px;height:26px;fill:none;stroke:#db0a4b;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.bk .safe-card{margin-top:26px;background:#fff2f6;border-radius:13px;min-height:104px;padding:20px 24px;display:flex;gap:17px;align-items:flex-start}
.bk .safe-icon svg{width:34px;height:34px;fill:none;stroke:#dc0a4b;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.bk .safe-icon{padding-top:1px}
.bk .safe-card h2,.bk .tips-card h2{font-size:16px;margin:0 0 8px;font-weight:650}.bk .safe-card p{font-size:13.5px;color:#687080;line-height:1.45;margin:0}
.bk .tips-card{margin-top:25px;background:#fdfdfe;border-radius:13px;padding:22px 25px 20px;box-shadow:0 1px 8px rgba(20,20,30,.035)}
.bk .tips-title{display:flex;align-items:center;gap:17px}.bk .tips-title svg{width:30px;height:30px;fill:none;stroke:#20232a;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.bk .tips-title h2{margin:0}
.bk .tips-card ul{list-style:none;margin:20px 0 0;padding:0}.bk .tips-card li{display:flex;align-items:center;gap:15px;color:#606877;font-size:14px;line-height:1.35;margin:13px 0}.bk .tips-card li span{flex:0 0 21px;width:21px;height:21px;border:1.5px solid #e58caf;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#db0a4b;font-size:13px}
.bk .actions{padding:67px 0 0}.bk .save-btn{width:100%;height:55px;border:0;border-radius:30px;background:#ed0750;color:#fff;font-size:19px;font-weight:500;cursor:pointer;box-shadow:0 3px 7px rgba(237,7,80,.12)}.bk .save-btn:active{transform:scale(.99)}
.bk .skip-btn{display:block;margin:26px auto 0;border:0;background:none;color:#cf0a49;font-size:16px;cursor:pointer}
.bk .home-indicator{width:218px;height:6px;background:#080808;border-radius:8px;margin:49px auto 0}
.bk.toast,.bk .toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#222;color:white;padding:11px 17px;border-radius:10px;font-size:14px;opacity:0;pointer-events:none;transition:.25s;z-index:400;white-space:nowrap;max-width:calc(100% - 40px)}.bk.toast.show,.bk .toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:600px){
 .bk .app-shell{padding:0 24px 17px}
 .bk .topbar{height:78px;grid-template-columns:42px 1fr auto}.bk .back-btn{padding-top:3px}.bk .heading h1{font-size:21px}.bk .heading p{font-size:13px;margin-top:6px}.bk .complete{font-size:13px;padding-top:5px}
 .bk .progress{gap:9px;height:7px}.bk .progress span{height:7px}.bk .percent{font-size:13px;margin:14px 0 18px}
 .bk .info-row{grid-template-columns:50px minmax(0,1fr) auto 25px;column-gap:9px;min-height:94px;padding:11px 11px 11px 12px}.bk .icon-box{width:42px;height:42px;border-radius:10px}.bk .icon-box svg{width:25px;height:25px}.bk .labels strong{font-size:15px;margin-bottom:4px}.bk .labels small{font-size:11.5px}.bk .value{font-size:14px;max-width:145px}.bk .value.two-line b{font-size:14px}.bk .value.two-line small{font-size:11px}.bk .edit svg{width:23px;height:23px}
 .bk .safe-card{margin-top:22px;padding:16px 18px;min-height:93px;gap:12px}.bk .safe-icon svg{width:29px;height:29px}.bk .safe-card h2,.bk .tips-card h2{font-size:14px;margin-bottom:6px}.bk .safe-card p{font-size:11.5px}
 .bk .tips-card{margin-top:20px;padding:18px 19px}.bk .tips-title{gap:13px}.bk .tips-title svg{width:27px;height:27px}.bk .tips-card ul{margin-top:16px}.bk .tips-card li{font-size:11.5px;gap:11px;margin:11px 0}.bk .tips-card li span{width:18px;height:18px;flex-basis:18px;font-size:11px}
 .bk .actions{padding-top:53px}.bk .save-btn{height:51px;font-size:17px}.bk .skip-btn{font-size:14px;margin-top:23px}.bk .home-indicator{width:160px;height:5px;margin-top:42px}
}
@media(max-width:380px){
 .bk .app-shell{padding-left:17px;padding-right:17px}.bk .info-row{grid-template-columns:43px minmax(0,1fr) auto 22px;column-gap:7px;padding-left:8px;padding-right:8px}.bk .icon-box{width:38px;height:38px}.bk .icon-box svg{width:23px;height:23px}.bk .labels small{font-size:10.5px}.bk .value{font-size:12px;max-width:115px}.bk .value.two-line b{font-size:12px}.bk .value.two-line small{font-size:10px}.bk .edit svg{width:21px}.bk .safe-card{padding-left:13px;padding-right:13px}.bk .safe-card p{font-size:10.5px}.bk .tips-card li{font-size:10.5px}
}
@media(min-width:709px){.bk .app-shell{box-shadow:0 0 30px rgba(0,0,0,.04)}}
`;