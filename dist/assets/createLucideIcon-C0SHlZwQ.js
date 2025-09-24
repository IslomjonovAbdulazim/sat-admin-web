import{a6 as w,a as m,r as o,j as v,m as C,y}from"./index-F_r_DwTH.js";const g="https://satscoreupbackend-production.up.railway.app",c=w.create({baseURL:g,headers:{"Content-Type":"application/json"},timeout:1e4});c.interceptors.request.use(e=>{const{accessToken:t}=m.getState().auth;return t&&(e.headers.Authorization=`Bearer ${t}`),e},e=>Promise.reject(e));c.interceptors.response.use(e=>e,e=>(e.response?.status===401&&m.getState().auth.reset(),Promise.reject(e)));const k={login:async e=>{const t=await c.post("/auth/login",{email:e.email,password:e.password});return t.data.user||(t.data.user={id:1,email:e.email,role:"admin"}),t.data},verifyToken:async()=>(await c.get("/api/v1/auth/verify")).data,logout:async()=>Promise.resolve()};var b=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],L=b.reduce((e,t)=>{const r=C(`Primitive.${t}`),s=o.forwardRef((i,a)=>{const{asChild:u,...n}=i,p=u?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),v.jsx(p,{...n,ref:a})});return s.displayName=`Primitive.${t}`,{...e,[t]:s}},{});function $(e,t){e&&y.flushSync(()=>e.dispatchEvent(t))}/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),A=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,s)=>s?s.toUpperCase():r.toLowerCase()),l=e=>{const t=A(e);return t.charAt(0).toUpperCase()+t.slice(1)},d=(...e)=>e.filter((t,r,s)=>!!t&&t.trim()!==""&&s.indexOf(t)===r).join(" ").trim(),E=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var P={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=o.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:s,className:i="",children:a,iconNode:u,...n},p)=>o.createElement("svg",{ref:p,...P,width:t,height:t,stroke:e,strokeWidth:s?Number(r)*24/Number(t):r,className:d("lucide",i),...!a&&!E(n)&&{"aria-hidden":"true"},...n},[...u.map(([f,h])=>o.createElement(f,h)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=(e,t)=>{const r=o.forwardRef(({className:s,...i},a)=>o.createElement(S,{ref:a,iconNode:t,className:d(`lucide-${x(l(e))}`,`lucide-${e}`,s),...i}));return r.displayName=l(e),r};export{L as P,k as a,c as b,R as c,$ as d};
