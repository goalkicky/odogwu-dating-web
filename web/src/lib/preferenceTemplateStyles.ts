export const PREFERENCE_TEMPLATE_CSS = `
*{box-sizing:border-box}
.pf{font-family:var(--font-montserrat),-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Roboto,Arial,sans-serif;color:#17171a;-webkit-font-smoothing:antialiased;background:#fff}
.pf button{cursor:pointer;font:inherit}
.pf input{font:inherit}
.pf .app-shell{width:100%;max-width:1200px;min-height:100vh;margin:0 auto;padding:18px 8px 18px;background:#fff}
.pf .title-row{display:grid;grid-template-columns:45px 1fr 105px;align-items:center;margin-top:8px}
.pf .back{border:0;background:transparent;padding:6px 0;text-align:left;color:#15153b;font-size:35px;line-height:1;font-weight:300;cursor:pointer}
 .pf .back svg{width:26px;height:26px;display:block}
 .pf .heading{text-align:center}.pf .heading h1{margin:0;font-size:19px;line-height:1.15;font-weight:700;letter-spacing:-.4px}
.pf .complete{text-align:right;color:#c92a58;font-size:14px;font-weight:700}
.pf .subtitle{text-align:center;color:#656875;font-size:15px;margin:5px 0 14px}
.pf .progress{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;height:7px}
.pf .progress span{height:7px;border-radius:7px;background:#d51b56}
.pf .complete-percent{text-align:center;color:#c92a58;font-size:14px;font-weight:700;margin:11px 0 16px}
.pf .card{border:1px solid #ededf1;border-radius:16px;background:#fff;box-shadow:0 1px 8px rgba(20,20,30,.035);overflow:hidden;margin-bottom:18px}
.pf .card-head{display:flex;align-items:flex-start;gap:12px;padding:13px 16px 10px}
.pf .icon-box{flex:0 0 36px;width:36px;height:36px;border-radius:8px;display:grid;place-items:center;background:#fff1f6;color:#d81d55}
.pf .icon-box svg{width:21px;height:21px;stroke:currentColor;stroke-width:2;fill:none}
.pf .head-copy{min-width:0;flex:1}
.pf .head-title{font-size:14px;font-weight:700;line-height:1.2;margin:2px 0 4px}
.pf .head-title.compact{font-size:12px}
.pf .head-sub{font-size:10.5px;color:#5e6370;line-height:1.35}
.pf .head-value{margin-left:auto;color:#c92957;font-size:14px;font-weight:700;white-space:nowrap;padding-top:2px}
.pf .age-body{padding:15px 24px 18px}
.pf .age-labels,.pf .age-ticks{display:flex;justify-content:space-between;align-items:center}
.pf .age-labels{font-size:12px;font-weight:500;margin-bottom:7px}
.pf .range{position:relative;height:9px;background:#dfe0e4;border-radius:10px;touch-action:none}
.pf .range-fill{position:absolute;top:0;height:9px;background:#e90057;border-radius:10px}
.pf .thumb{position:absolute;top:50%;width:16px;height:16px;border-radius:50%;background:#dc1651;transform:translate(-50%,-50%);box-shadow:0 0 0 1px rgba(0,0,0,.02);cursor:grab;touch-action:none}
.pf .age-ticks{margin-top:15px;color:#555a68;font-size:11px}
.pf .age-ticks span{width:40px;text-align:center}
.pf .age-ticks span:first-child{text-align:left}
.pf .age-ticks span:last-child{text-align:right}
.pf .options{border-top:1px solid #f0f0f2}
.pf .option{min-height:74px;padding:12px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #ededf0;width:100%;text-align:left;background:#fff;cursor:pointer}
.pf .option:last-child{border-bottom:0}
.pf .option-icon{flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:#fff1f6;display:grid;place-items:center;color:#db2459}
.pf .option-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:2}
.pf .option-copy{flex:1;min-width:0}
.pf .option-title{font-size:11px;font-weight:700;margin-bottom:4px}
.pf .option-sub{font-size:10.5px;color:#656976}
.pf .radio{flex:0 0 22px;width:22px;height:22px;border:2px solid #dfe0e4;border-radius:50%;display:grid;place-items:center}
.pf .radio.selected{border-color:#db1653}
.pf .radio.selected:after{content:"";width:10px;height:10px;background:#db1653;border-radius:50%}
.pf .option:hover{background:#fffafd}
.pf .distance-body{padding:8px 16px 16px}
.pf .distance-buttons{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:4px}
.pf .distance-btn{height:46px;border:1px solid #e9e9ed;border-radius:12px;background:#fff;color:#575b68;font-size:11.5px;white-space:nowrap}
.pf .distance-btn.selected{border:2px solid #df2a61;color:#d52358;font-weight:700}
.pf .kids-body{padding:8px 16px 16px}
.pf .kids-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.pf .kids-btn{height:46px;border:1px solid #e9e9ed;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 12px;color:#555a67;font-size:11.5px}
.pf .kids-btn.selected{border:2px solid #e02a61}
.pf .mini-radio{width:20px;height:20px;border:2px solid #dedfe3;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}
.pf .kids-btn.selected .mini-radio{border-color:#dc1e57}
.pf .kids-btn.selected .mini-radio:after{content:"";width:9px;height:9px;border-radius:50%;background:#dc1e57}
.pf .save{width:100%;height:62px;border:0;border-radius:34px;background:linear-gradient(90deg,#e50058,#f00064);color:#fff;font-size:20px;font-weight:500;box-shadow:0 3px 8px rgba(229,0,88,.08);margin:1px 0 3px}
.pf .save:active{transform:scale(.995)}
.pf .home-indicator{width:133px;height:5px;border-radius:10px;background:#080808;margin:17px auto 0}
@media(min-width:769px){
 .pf .app-shell{margin:20px auto;min-height:calc(100vh - 40px);border-radius:24px;box-shadow:0 12px 50px rgba(0,0,0,.08)}
}
@media(max-width:600px){
 .pf .app-shell{padding:10px 5px 12px}
 .pf .title-row{grid-template-columns:35px 1fr 86px;margin-top:3px}
 .pf .back{padding:4px 0;font-size:26px}.pf .back svg{width:20px;height:20px}
 .pf .heading h1{font-size:15px}
 .pf .complete{font-size:11px}
 .pf .subtitle{font-size:11px;margin:4px 0 8px}
 .pf .progress{gap:7px;height:5px}.pf .progress span{height:5px}
 .pf .complete-percent{font-size:11px;margin:6px 0 8px}
 .pf .card{border-radius:13px;margin-bottom:8px}
 .pf .card-head{padding:8px 12px 7px;gap:9px}
 .pf .icon-box{flex-basis:30px;width:30px;height:30px}
 .pf .icon-box svg{width:17px;height:17px}
 .pf .head-title{font-size:12.5px;margin:1px 0 2px}
 .pf .head-title.compact{font-size:10.5px}
 .pf .head-sub{font-size:8.5px}
 .pf .head-value{font-size:12px}
 .pf .age-body{padding:10px 14px 12px}
 .pf .age-labels{font-size:11px;margin-bottom:5px}
 .pf .age-ticks{font-size:10px;margin-top:10px}
 .pf .age-ticks span{width:30px}
 .pf .thumb{width:14px;height:14px}
 .pf .option{min-height:46px;padding:6px 12px;gap:9px}
 .pf .option-icon{flex-basis:28px;width:28px;height:28px}
 .pf .option-icon svg{width:16px;height:16px}
 .pf .option-title{font-size:10px;margin-bottom:2px}
 .pf .option-sub{font-size:9px}
 .pf .radio{width:20px;height:20px;flex-basis:20px}
 .pf .radio.selected:after{width:8px;height:8px}
 .pf .distance-body,.pf .kids-body{padding:5px 11px 11px}
 .pf .distance-buttons{gap:6px}
 .pf .distance-btn{height:38px;border-radius:11px;font-size:9.5px;padding:0 4px}
 .pf .kids-buttons{gap:6px}
 .pf .kids-btn{height:38px;border-radius:11px;font-size:9.5px;padding:0 8px}
 .pf .mini-radio{width:18px;height:18px}
 .pf .mini-radio:after{width:8px!important;height:8px!important}
 .pf .save{height:42px;font-size:15px;border-radius:24px}
 .pf .home-indicator{width:95px;height:4px;margin-top:8px}
}
@media(max-width:600px) and (max-height:780px){
 .pf .app-shell{padding:7px 5px 9px}
 .pf .title-row{grid-template-columns:30px 1fr 80px;margin-top:2px}
 .pf .back svg{width:17px;height:17px}
 .pf .heading h1{font-size:14px}
 .pf .subtitle{font-size:10px;margin:3px 0 6px}
 .pf .complete-percent{font-size:10px;margin:5px 0 6px}
 .pf .card{margin-bottom:6px}
 .pf .card-head{padding:6px 11px 5px;gap:8px}
 .pf .icon-box{flex-basis:27px;width:27px;height:27px}
 .pf .icon-box svg{width:15px;height:15px}
 .pf .head-title{font-size:12px}
 .pf .head-title.compact{font-size:10.5px}
 .pf .head-sub{font-size:8px}
 .pf .head-value{font-size:11.5px}
 .pf .age-body{padding:8px 13px 9px}
 .pf .age-labels{font-size:10.5px;margin-bottom:4px}
 .pf .age-ticks{font-size:9.5px;margin-top:8px}
 .pf .thumb{width:12px;height:12px}
 .pf .option{min-height:40px;padding:5px 11px;gap:8px}
 .pf .option-icon{flex-basis:25px;width:25px;height:25px}
 .pf .option-icon svg{width:14px;height:14px}
 .pf .option-title{font-size:10px;margin-bottom:1px}
 .pf .option-sub{font-size:8.5px}
 .pf .radio{width:19px;height:19px;flex-basis:19px}
 .pf .distance-body,.pf .kids-body{padding:4px 10px 9px}
 .pf .distance-btn{height:34px;font-size:9px}
 .pf .kids-btn{height:34px;font-size:9px;padding:0 7px}
 .pf .save{height:38px;font-size:14px}
 .pf .home-indicator{margin-top:6px}
}
 @media(max-width:600px) and (max-height:670px){
  .pf .app-shell{padding:5px 5px 7px}
  .pf .title-row{grid-template-columns:28px 1fr 74px;margin-top:1px}
  .pf .back{padding:3px 0}.pf .back svg{width:15px;height:15px}
  .pf .heading h1{font-size:13px}
  .pf .complete{font-size:9.5px}
  .pf .subtitle{font-size:9px;margin:2px 0 4px}
  .pf .progress{height:4px}.pf .progress span{height:4px}
  .pf .complete-percent{font-size:9px;margin:3px 0 4px}
  .pf .card{margin-bottom:5px}
  .pf .card-head{padding:4px 9px 3px;gap:7px}
  .pf .icon-box{flex-basis:24px;width:24px;height:24px}
  .pf .icon-box svg{width:13px;height:13px}
  .pf .head-title{font-size:11px;margin:1px 0 1px}
  .pf .head-title.compact{font-size:9.5px}
  .pf .head-sub{font-size:7.5px}
  .pf .head-value{font-size:11px}
  .pf .age-body{padding:5px 11px 6px}
  .pf .age-labels{font-size:10px;margin-bottom:3px}
  .pf .age-ticks{font-size:9px;margin-top:6px}
  .pf .age-ticks span{width:26px}
  .pf .thumb{width:10px;height:10px}
  .pf .option{min-height:32px;padding:3px 9px;gap:7px}
  .pf .option-icon{flex-basis:20px;width:20px;height:20px}
  .pf .option-icon svg{width:12px;height:12px}
  .pf .option-title{font-size:9px;margin-bottom:1px}
  .pf .option-sub{font-size:7.5px}
  .pf .radio{width:17px;height:17px;flex-basis:17px}
  .pf .radio.selected:after{width:7px;height:7px}
  .pf .distance-body,.pf .kids-body{padding:3px 8px 6px}
  .pf .distance-buttons{gap:5px}
  .pf .kids-buttons{gap:5px}
  .pf .distance-btn,.pf .kids-btn{height:28px;font-size:8.5px;padding:0 5px}
  .pf .mini-radio{width:15px;height:15px}
  .pf .mini-radio:after{width:7px!important;height:7px!important}
  .pf .save{height:32px;font-size:12.5px}
  .pf .home-indicator{width:80px;height:3px;margin-top:5px}
}
@media(max-width:360px){
 .pf .app-shell{padding-left:4px;padding-right:4px}
 .pf .title-row{grid-template-columns:30px 1fr 77px}
 .pf .complete{font-size:10px}
 .pf .head-value{font-size:12px}
 .pf .distance-buttons{gap:4px}
 .pf .distance-btn{font-size:9px}
 .pf .kids-buttons{gap:4px}
 .pf .kids-btn{font-size:9px;padding:0 6px}
}
`;
