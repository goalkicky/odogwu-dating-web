export const PREFERENCE_TEMPLATE_CSS = `
*{box-sizing:border-box}
.pf{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",Roboto,Arial,sans-serif;color:#17171a;-webkit-font-smoothing:antialiased;background:#fff}
.pf button{cursor:pointer;font:inherit}
.pf input{font:inherit}
.pf .app-shell{width:100%;max-width:768px;min-height:100vh;margin:0 auto;padding:18px 29px 18px;background:#fff}
.pf .title-row{display:grid;grid-template-columns:45px 1fr 105px;align-items:center;margin-top:8px}
.pf .back{border:0;background:transparent;padding:6px 0;text-align:left;color:#15153b;font-size:35px;line-height:1;font-weight:300;cursor:pointer}
.pf .heading{text-align:center}.pf .heading h1{margin:0;font-size:24px;line-height:1.15;font-weight:700;letter-spacing:-.4px}
.pf .complete{text-align:right;color:#c92a58;font-size:14px;font-weight:700}
.pf .subtitle{text-align:center;color:#656875;font-size:15px;margin:5px 0 14px}
.pf .progress{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;height:7px}
.pf .progress span{height:7px;border-radius:7px;background:#d51b56}
.pf .complete-percent{text-align:center;color:#c92a58;font-size:14px;font-weight:700;margin:11px 0 16px}
.pf .card{border:1px solid #ededf1;border-radius:16px;background:#fff;box-shadow:0 1px 8px rgba(20,20,30,.035);overflow:hidden;margin-bottom:18px}
.pf .card-head{display:flex;align-items:flex-start;gap:15px;padding:18px 19px 13px}
.pf .icon-box{flex:0 0 43px;width:43px;height:43px;border-radius:8px;display:grid;place-items:center;background:#fff1f6;color:#d81d55}
.pf .icon-box svg{width:25px;height:25px;stroke:currentColor;stroke-width:2;fill:none}
.pf .head-copy{min-width:0;flex:1}
.pf .head-title{font-size:17px;font-weight:700;line-height:1.2;margin:2px 0 5px}
.pf .head-sub{font-size:12.5px;color:#5e6370;line-height:1.35}
.pf .head-value{margin-left:auto;color:#c92957;font-size:17px;font-weight:700;white-space:nowrap;padding-top:2px}
.pf .age-body{padding:22px 29px 24px}
.pf .age-labels,.pf .age-ticks{display:flex;justify-content:space-between;align-items:center}
.pf .age-labels{font-size:14px;font-weight:500;margin-bottom:7px}
.pf .range{position:relative;height:9px;background:#dfe0e4;border-radius:10px;touch-action:none}
.pf .range-fill{position:absolute;top:0;height:9px;background:#e90057;border-radius:10px}
.pf .thumb{position:absolute;top:50%;width:26px;height:26px;border-radius:50%;background:#dc1651;transform:translate(-50%,-50%);box-shadow:0 0 0 1px rgba(0,0,0,.02);cursor:grab;touch-action:none}
.pf .age-ticks{margin-top:20px;color:#555a68;font-size:13px}
.pf .age-ticks span{width:40px;text-align:center}
.pf .age-ticks span:first-child{text-align:left}
.pf .age-ticks span:last-child{text-align:right}
.pf .options{border-top:1px solid #f0f0f2}
.pf .option{min-height:94px;padding:16px 20px;display:flex;align-items:center;gap:15px;border-bottom:1px solid #ededf0;width:100%;text-align:left;background:#fff;cursor:pointer}
.pf .option:last-child{border-bottom:0}
.pf .option-icon{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:#fff1f6;display:grid;place-items:center;color:#db2459}
.pf .option-icon svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2}
.pf .option-copy{flex:1;min-width:0}
.pf .option-title{font-size:15px;font-weight:700;margin-bottom:5px}
.pf .option-sub{font-size:12.5px;color:#656976}
.pf .radio{flex:0 0 25px;width:25px;height:25px;border:2px solid #dfe0e4;border-radius:50%;display:grid;place-items:center}
.pf .radio.selected{border-color:#db1653}
.pf .radio.selected:after{content:"";width:11px;height:11px;background:#db1653;border-radius:50%}
.pf .option:hover{background:#fffafd}
.pf .distance-body{padding:10px 19px 21px}
.pf .distance-buttons{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:4px}
.pf .distance-btn{height:58px;border:1px solid #e9e9ed;border-radius:14px;background:#fff;color:#575b68;font-size:13px;white-space:nowrap}
.pf .distance-btn.selected{border:2px solid #df2a61;color:#d52358;font-weight:700}
.pf .kids-body{padding:10px 19px 21px}
.pf .kids-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
.pf .kids-btn{height:58px;border:1px solid #e9e9ed;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 15px;color:#555a67;font-size:13px}
.pf .kids-btn.selected{border:2px solid #e02a61}
.pf .mini-radio{width:23px;height:23px;border:2px solid #dedfe3;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}
.pf .kids-btn.selected .mini-radio{border-color:#dc1e57}
.pf .kids-btn.selected .mini-radio:after{content:"";width:10px;height:10px;border-radius:50%;background:#dc1e57}
.pf .save{width:100%;height:62px;border:0;border-radius:34px;background:linear-gradient(90deg,#e50058,#f00064);color:#fff;font-size:20px;font-weight:500;box-shadow:0 3px 8px rgba(229,0,88,.08);margin:1px 0 3px}
.pf .save:active{transform:scale(.995)}
.pf .home-indicator{width:133px;height:5px;border-radius:10px;background:#080808;margin:17px auto 0}
@media(min-width:769px){
 .pf .app-shell{margin:20px auto;min-height:calc(100vh - 40px);border-radius:24px;box-shadow:0 12px 50px rgba(0,0,0,.08)}
}
@media(max-width:600px){
 .pf .app-shell{padding:13px 15px 15px}
 .pf .title-row{grid-template-columns:35px 1fr 86px;margin-top:5px}
 .pf .back{font-size:30px}
 .pf .heading h1{font-size:20px}
 .pf .complete{font-size:11px}
 .pf .subtitle{font-size:12px;margin:5px 0 12px}
 .pf .progress{gap:7px;height:5px}.pf .progress span{height:5px}
 .pf .complete-percent{font-size:12px;margin:9px 0 13px}
 .pf .card{border-radius:13px;margin-bottom:14px}
 .pf .card-head{padding:14px 15px 11px;gap:11px}
 .pf .icon-box{flex-basis:37px;width:37px;height:37px}
 .pf .icon-box svg{width:21px;height:21px}
 .pf .head-title{font-size:15px;margin-top:1px}
 .pf .head-sub{font-size:10px}
 .pf .head-value{font-size:14px}
 .pf .age-body{padding:18px 17px 19px}
 .pf .age-labels{font-size:12px}
 .pf .age-ticks{font-size:11px;margin-top:17px}
 .pf .age-ticks span{width:30px}
 .pf .thumb{width:23px;height:23px}
 .pf .option{min-height:76px;padding:12px 14px;gap:10px}
 .pf .option-icon{flex-basis:35px;width:35px;height:35px}
 .pf .option-icon svg{width:19px;height:19px}
 .pf .option-title{font-size:12.5px;margin-bottom:3px}
 .pf .option-sub{font-size:10px}
 .pf .radio{width:23px;height:23px;flex-basis:23px}
 .pf .radio.selected:after{width:10px;height:10px}
 .pf .distance-body,.pf .kids-body{padding:7px 13px 15px}
 .pf .distance-buttons{gap:7px}
 .pf .distance-btn{height:48px;border-radius:12px;font-size:10px;padding:0 5px}
 .pf .kids-buttons{gap:7px}
 .pf .kids-btn{height:48px;border-radius:12px;font-size:10px;padding:0 9px}
 .pf .mini-radio{width:21px;height:21px}
 .pf .mini-radio:after{width:9px!important;height:9px!important}
 .pf .save{height:51px;font-size:16px}
 .pf .home-indicator{width:105px;height:4px;margin-top:14px}
}
@media(max-width:360px){
 .pf .app-shell{padding-left:10px;padding-right:10px}
 .pf .title-row{grid-template-columns:30px 1fr 77px}
 .pf .complete{font-size:10px}
 .pf .head-value{font-size:12px}
 .pf .distance-buttons{gap:4px}
 .pf .distance-btn{font-size:9px}
 .pf .kids-buttons{gap:4px}
 .pf .kids-btn{font-size:9px;padding:0 6px}
}
`;
