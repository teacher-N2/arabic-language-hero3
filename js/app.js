
const titles = {reading:"الفهم والاستيعاب",grammar:"القواعد النحوية",vocab:"المفردات",expression:"البلاغة والتعبير",spelling:"الإملاء والخط",mixed:"التحدي الشامل"};
const gateMessages = {reading:"تم فتح بوابة الفهم والاستيعاب.",grammar:"تم فتح بوابة القواعد النحوية.",vocab:"تم فتح بوابة المفردات.",expression:"تم فتح بوابة البلاغة والتعبير.",spelling:"تم فتح بوابة الإملاء والخط.",mixed:"تم فتح التحدي الشامل."};
let score=Number(localStorage.getItem("heroScoreFull")||0);
let achievements=JSON.parse(localStorage.getItem("heroAchFull")||"[]");
let seen=JSON.parse(localStorage.getItem("heroSeenFull")||"{}");
let currentGate="mixed", item=null, answered=false;

function el(id){return document.getElementById(id)}
function save(){localStorage.setItem("heroScoreFull",score);localStorage.setItem("heroAchFull",JSON.stringify(achievements));localStorage.setItem("heroSeenFull",JSON.stringify(seen))}
function stats(){el("score").textContent=score;el("ach").textContent=achievements.length}
function cap(t){el("caption").textContent=t;if(el("mCaption"))el("mCaption").textContent=t}
function play(id){const a=el(id);if(a){a.currentTime=0;a.play().catch(()=>{})}}
function gateFlash(){const g=el("gateOpen");g.classList.add("show");setTimeout(()=>g.classList.remove("show"),650)}
function panel(t,i){el("title").textContent=t;el("intro").textContent=i;el("panel").classList.add("show")}
function closePanel(){el("panel").classList.remove("show")}
function pool(g){return g==="mixed"?window.QUESTION_BANK.mixed:(window.QUESTION_BANK[g]||window.QUESTION_BANK.mixed)}
function rand(a){return a[Math.floor(Math.random()*a.length)]}
function addAch(a){if(!achievements.includes(a)){achievements.push(a);save();stats()}}
function chooseQuestion(g){
  const p=pool(g);
  if(!seen[g]) seen[g]=[];
  if(seen[g].length >= Math.floor(p.length*.75)) seen[g]=[];
  let available=p.filter((_,idx)=>!seen[g].includes(idx));
  if(!available.length) available=p;
  const chosen=rand(available);
  const idx=p.indexOf(chosen);
  if(idx>=0) seen[g].push(idx);
  save();
  return chosen;
}
function openGate(g){
  currentGate=g; play("portalSound"); gateFlash(); cap(gateMessages[g]||"تم فتح البوابة.");
  setTimeout(()=>{panel(titles[g]||"التحدي","اختاري الإجابة الصحيحة لتحصلي على النقاط.");nextQuestion()},430)
}
function nextQuestion(){
  answered=false; item=chooseQuestion(currentGate);
  el("dynamic").innerHTML=`<div class="meta"><span class="pill">${item.level||"تحدٍّ"}</span><span class="pill">+10 نقاط</span></div><div class="question">${item.q}</div><div id="options" class="options"></div><div id="feedback" class="feedback"></div><div class="tip">${item.tip}</div><div class="actions"><button class="btn primary" onclick="nextQuestion()">سؤال جديد ✨</button><button class="btn secondary" onclick="closePanel()">العودة</button></div>`;
  let box=el("options");
  [...item.options].sort(()=>Math.random()-.5).forEach(o=>{let b=document.createElement("button");b.className="option";b.textContent=o;b.onclick=()=>check(o,b);box.appendChild(b)})
}
function check(sel,btn){
  if(answered)return; answered=true;
  document.querySelectorAll(".option").forEach(b=>{b.disabled=true;if(b.textContent===item.a)b.classList.add("correct")});
  let fb=el("feedback");
  if(sel===item.a){
    btn.classList.add("correct"); score+=10; save(); stats();
    if(score>=50)addAch("نجمة البداية"); if(score>=100)addAch("فارسة القراءة"); if(score>=150)addAch("بطلة اللغة العربية"); if(score>=250)addAch("أسطورة التحدي");
    fb.className="feedback good"; fb.textContent="أحسنتِ يا بطلة السلام! +10 نقاط"; play("correctSound"); confetti();
  }else{
    btn.classList.add("wrong"); fb.className="feedback bad"; fb.textContent="حاولي مرة أخرى. الإجابة الصحيحة هي: "+item.a; play("wrongSound");
  }
}
function openAI(){
  play("portalSound"); gateFlash(); panel("مولّد الأسئلة الذكي","الصقي أي نص عربي، وستظهر أسئلة تدريبية فورًا. هذه نسخة محلية جاهزة، والربط الحقيقي بالذكاء الاصطناعي يحتاج API لاحقًا.");
  el("dynamic").innerHTML=`<textarea id="aiText" placeholder="الصقي النص هنا..."></textarea><div class="actions"><button class="btn primary" onclick="genAI()">توليد الأسئلة الآن 🤖</button><button class="btn secondary" onclick="closePanel()">العودة</button></div><div id="aiOutput" class="aiGrid"></div>`;
}
function genAI(){
  let text=(el("aiText").value||"").trim(),out=el("aiOutput");out.innerHTML="";
  if(!text){out.innerHTML='<div class="aiQ">اكتبي نصًا أولًا.</div>';return}
  let s=text.split(/[.؟!\n]+/).map(x=>x.trim()).filter(x=>x.length>12);
  let words=text.replace(/[،.؟!؛:]/g," ").split(/\s+/).filter(w=>w.length>3);
  let sentence=s[0]||text.slice(0,80),word=words[Math.floor(Math.random()*words.length)]||"كلمة";
  [["فهم عام","ما الفكرة العامة للنص؟","الإجابة بحسب مضمون النص."],["مفردات","استخرجي من النص كلمة مهمة وبيّني معناها.",word],["استنتاج","ما القيمة المستفادة من النص؟","تستنتجها الطالبة من النص."],["تعبير","ضعي عنوانًا مناسبًا للنص.","عنوان مرتبط بالفكرة العامة."],["تفكير عالٍ","كوّني سؤالًا إجابته من العبارة: «"+sentence+"».","سؤال من إنشاء الطالبة."]].forEach(i=>out.innerHTML+=`<div class="aiQ"><b>${i[0]}</b><br>${i[1]}<br><small>نموذج إجابة: ${i[2]}</small></div>`);
  addAch("مستكشفة الذكاء الاصطناعي");play("sparkleSound")
}
function openCenter(){
  play("winSound"); let student=localStorage.getItem("studentName")||"بطلة السلام";
  let rows=[["مها",250,"بطلة القراءة"],["نورة",220,"نجمة القواعد"],["العنود",180,"فارسة الإملاء"],[student,score,achievements[achievements.length-1]||"في بداية الرحلة"]].sort((a,b)=>b[1]-a[1]);
  panel("مركز البطلة","لوحة الطالبات والإنجازات ومولّد الأسئلة الذكي في مكان واحد.");
  el("dynamic").innerHTML=`<input id="studentInput" value="${student}" placeholder="اكتبي اسم الطالبة"><div class="actions"><button class="btn primary" onclick="saveStudent()">حفظ الاسم</button><button class="btn secondary" onclick="openAI()">مولّد الأسئلة</button><button class="btn secondary" onclick="closePanel()">العودة</button></div><table class="table"><tr><th>الترتيب</th><th>الطالبة</th><th>النقاط</th><th>الإنجاز</th></tr>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table><div>${achievements.length?achievements.map(a=>`<span class="badge">${a}</span>`).join(""):"<span class='badge'>ابدئي اللعب لفتح الإنجازات</span>"}</div>`;
}
function saveStudent(){localStorage.setItem("studentName",el("studentInput").value||"بطلة السلام");openCenter()}
function confetti(){const symbols=["✨","⭐","🌟","🏆","💗"];for(let i=0;i<22;i++){const c=document.createElement("div");c.className="confetti";c.textContent=symbols[Math.floor(Math.random()*symbols.length)];c.style.left=Math.random()*100+"vw";c.style.animationDelay=(Math.random()*.45)+"s";document.body.appendChild(c);setTimeout(()=>c.remove(),3000)}}
stats();cap("مرحبًا يا بطلة السلام! اختاري بوابتك، وابدئي الرحلة.");
