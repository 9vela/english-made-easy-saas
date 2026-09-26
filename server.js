const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

const PORT = process.env.PORT || 10000;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');

if (!DATABASE_URL) console.warn('DATABASE_URL is not set. The app cannot start correctly without PostgreSQL.');
const pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL && !DATABASE_URL.includes('localhost') ? { rejectUnauthorized: false } : false });

const COUNTRIES = [
  ['MZ','Mozambique','MZN',150,400,3500],['AO','Angola','AOA',1200,3200,28000],['ZA','South Africa','ZAR',40,100,850],
  ['BR','Brazil','BRL',12,30,250],['PT','Portugal','EUR',2,5,40],['US','United States','USD',2,5,40],['OTHER','Other country','USD',2,5,40]
];
const fmt=(cur,n)=>new Intl.NumberFormat('en',{style:'currency',currency:cur,maximumFractionDigits:2}).format(Number(n));
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const varyOptions=(options,answer,index)=>{const rest=options.filter(o=>norm(o)!==norm(answer));const target=index%options.length;rest.splice(target,0,answer);return rest};
const hashPassword=p=>crypto.scryptSync(String(p), 'english-made-easy-salt-v1', 64).toString('hex');
const token=()=>crypto.randomBytes(32).toString('hex');
const adminOk=(req)=>ADMIN_EMAIL && ADMIN_PASSWORD && String(req.headers['x-admin-email']||'').toLowerCase()===ADMIN_EMAIL && String(req.headers['x-admin-password']||'')===ADMIN_PASSWORD;

const BASIC_ALPHABET = [
  ['A','ei'],['B','bi'],['C','si'],['D','di'],['E','i'],['F','éf'],['G','dji'],['H','eitch'],['I','ai'],['J','djei'],['K','kei'],['L','él'],['M','ém'],['N','én'],['O','ou'],['P','pi'],['Q','kiu'],['R','ar'],['S','és'],['T','ti'],['U','iu'],['V','vi'],['W','dâbliu'],['X','éks'],['Y','uai'],['Z','zi']
].map(([letter,reading])=>({label:letter,text:letter,reading}));
const BASIC_NUMBERS = Array.from({length:20},(_,i)=>{const words=['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];return {label:String(i+1),text:words[i]}});
const BASIC_PHRASES = ['Hello!','Good morning!','Good afternoon!','Good evening!','Goodbye!','My name is Hermano Novela.','Nice to meet you.','How are you?','I am fine, thank you.','Please speak slowly.','Can you repeat, please?','I need help.','How much is this?','Where is the bathroom?'];
const BASIC_ALPHABET_HTML = `<h3>🔤 The English Alphabet — A to Z</h3><p>Veja a letra, a leitura aproximada em português e depois toque em <b>🔊 Listen</b> para ouvir.</p><div class="alphabet-grid">${BASIC_ALPHABET.map(x=>`<div class="letter-card"><b>${x.label}</b><span>Leitura: ${x.reading}</span></div>`).join('')}</div><div class="notice"><b>Nota:</b> A leitura escrita em português é apenas uma aproximação. O botão 🔊 usa a voz do navegador em inglês.</div>`;
const BASIC_NAMES_TEXT = `<h3>💬 Mini story: Our English group</h3><p><b>Hermano Novela:</b> Hello! My name is Hermano Novela.</p><p><b>Agostinho P:</b> Hi, Hermano! I'm Agostinho P. Nice to meet you.</p><p><b>Constancia Ofiço:</b> Good morning! I am Constancia Ofiço.</p><p><b>Aunora Wanicela:</b> Hello, everyone. I am Aunora Wanicela.</p><p><b>Dario:</b> Hi! I am Dario. I am learning English.</p><p><b>Tionildo:</b> Nice to meet you, Dario. Please speak slowly.</p><p><b>Ofiço:</b> Can you repeat, please?</p><p><b>Jerry:</b> Yes! Let's practice together.</p><p><b>Clerio:</b> I like English.</p><p><b>Aila:</b> I am ready to learn.</p><p><b>Celsa:</b> Great! We can help each other.</p><p><b>Lourena:</b> See you tomorrow!</p><p><b>Oaldo:</b> Goodbye, everyone!</p>`;

const LEVELS = [
  {
    slug:'basic', title:'Basic English', level_order:1, badge:'🟢',
    description:'English from zero: vocabulary, everyday phrases, pronunciation and confidence.',
    lessons:[
      ['Alphabet A–Z',true,`<div class="lesson3"><div class="lesson-hero"><span class="lesson-icon">🔤</span><div><h3>Alphabet A–Z</h3><p>Learn the 26 English letters, hear them, practice them and use them in a real introduction.</p></div></div><section class="lesson-section"><h3>🎯 What you will learn</h3><ul><li>Recognize the 26 letters.</li><li>Listen to the English pronunciation.</li><li>Repeat letters using your microphone.</li><li>Spell simple words and your own name.</li></ul></section><section class="lesson-section"><h3>👀 Learn with examples</h3><div class="example-grid"><div class="example-card"><b>A</b><span>🍎 Apple</span></div><div class="example-card"><b>B</b><span>📖 Book</span></div><div class="example-card"><b>C</b><span>🐱 Cat</span></div><div class="example-card"><b>D</b><span>🚪 Door</span></div></div></section><section class="lesson-section"><h3>💬 Real-life situation</h3><div class="story-card"><p><b>Teacher:</b> What's your name?</p><p><b>Aila:</b> My name is Aila.</p><p><b>Teacher:</b> Can you spell your name?</p><p><b>Aila:</b> A-I-L-A.</p><p><b>Teacher:</b> Excellent!</p></div></section><section class="lesson-section"><h3>✍️ Your turn</h3><p>Try to spell your own name in English, one letter at a time. Then practice the letters below.</p><div class="alphabet-grid">${BASIC_ALPHABET.map(x=>`<div class="letter-card"><b>${x.label}</b><span>${x.reading}</span></div>`).join('')}</div></section><section class="lesson-section"><h3>🧠 Quick exercise</h3><div class="exercise-card"><p><b>1.</b> Which letter comes after B?</p><p>A) A &nbsp; B) C &nbsp; C) D</p><p><b>2.</b> Complete: A, B, __, D</p><p><b>3.</b> Spell: <strong>BOOK</strong></p><p><b>4.</b> Write your name using English letters.</p></div></section><section class="lesson-section"><h3>🏆 Chapter challenge</h3><p>Listen to letters, identify them, spell one simple word and practice your own name. Repeat until you feel comfortable.</p></section><div class="notice"><b>💡 Remember:</b> the written Portuguese reading is only an approximation. Use 🔊 Listen to hear the browser's English voice.</div></div>`,BASIC_ALPHABET],
      ['Colors & Basic Vocabulary',true,'<h3>🎨 Colors + everyday words</h3><p>red • blue • green • yellow • black • white</p><p>Useful words: book, house, school, friend, water, food.</p><p><b>Example:</b> Hermano has a blue book. Aila has a green bag.</p>',[...['red','blue','green','yellow','black','white','book','house'].map(text=>({label:text,text}))]],
      ['Greetings & Introductions',true,'<h3>👋 Greetings and introductions</h3>'+BASIC_NAMES_TEXT+'<div class="notice"><b>Useful phrases:</b> Hello! • Good morning! • My name is... • Nice to meet you. • Thank you. • Goodbye!</div>',BASIC_PHRASES],
      ['Introductions & Personal Information',false,'Talk about your name, country, age, family and basic personal information.',['My name is...','I am from...','I live in...']],
      ['Numbers & Simple Questions',false,'<h3>🔢 Numbers 1–20</h3><p>Aprenda os números e use-os para idade, preços e quantidades.</p><div class="number-grid">'+BASIC_NUMBERS.map(x=>`<div class="number-card"><b>${x.label}</b><span>${x.text}</span></div>`).join('')+'</div><p><b>Examples:</b> I am twenty years old. How much is it? I need three books.</p>',BASIC_NUMBERS.concat(['How old are you?','How much is it?','I need three books.'].map(text=>({label:text,text})))],
      ['Days, Time & Daily Routine',false,'Days of the week, telling time and describing a simple daily routine.',['Monday','What time is it?','I wake up at seven.']],
      ['Simple Conversations',false,'<h3>🗣️ Short conversations</h3><p><b>Jerry:</b> Hello! How are you?</p><p><b>Clerio:</b> I am fine, thank you. And you?</p><p><b>Jerry:</b> I am good. Can you help me?</p><p><b>Clerio:</b> Of course. Please speak slowly.</p><p><b>Jerry:</b> Thank you!</p>',BASIC_PHRASES.slice(7)],
      ['Basic English Review',false,'Review the most important beginner structures and prepare for the final assessment.',['I am learning English.','I like English.','Please speak slowly.']]
    ],
    tests:[
      ['basic-checkpoint','Basic Checkpoint Test','Checkpoint after the 3 free chapters. No certificate yet.',70,[
        ['What is the English word for "olá"?',['Hello','Goodbye','Thanks'],'Hello'],
        ['Choose the correct color: The sky is usually...',['blue','green','black'],'blue'],
        ['Complete: My ___ is Ana.',['name','house','day'],'name'],
        ['How do you say "obrigado"?',['Thank you','Please','Sorry'],'Thank you'],
        ['Choose the greeting for the morning.',['Good morning','Good night','See you yesterday'],'Good morning'],
        ['Which one is a color?',['purple','Monday','seven'],'purple'],
        ['Complete: Nice to ___ you.',['meet','book','color'],'meet'],
        ['Choose a polite request.',['Please','Blue','Tuesday'],'Please'],
        ['What does "goodbye" mean?',['adeus','olá','obrigado'],'adeus'],
        ['Choose the correct sentence.',['My name is João.','Name my João.','João is my name?'],'My name is João.']
      ]],
      ['basic-final','Basic English Final Test','Final assessment for the 8-chapter Basic English course.',70,[
        ['Choose the correct sentence.',['I am from Mozambique.','I from am Mozambique.','Am I from Mozambique.'],'I am from Mozambique.'],
        ['What is 20 in English?',['twenty','twelve','two'],'twenty'],
        ['Complete: I ___ English every day.',['learn','learning','learns'],'learn'],
        ['Choose the correct question.',['What time is it?','What time it is?','Time is what?'],'What time is it?'],
        ['Complete: She ___ my friend.',['is','are','am'],'is'],
        ['Which phrase asks someone to repeat?',['Can you repeat, please?','What color?','Good night?'],'Can you repeat, please?'],
        ['Choose the correct day.',['Monday','Seven','Blue'],'Monday'],
        ['Complete: I wake up ___ seven.',['at','on','in'],'at'],
        ['Choose the polite response.',['Thank you.','Blue you.','Monday you.'],'Thank you.'],
        ['What does "I need help" communicate?',['A request for assistance','A color','A day'],'A request for assistance'],
        ['Complete: How ___ are you?',['old','blue','name'],'old'],
        ['Choose the natural introduction.',['Nice to meet you.','Nice meet you yesterday.','You nice meet.'],'Nice to meet you.']
      ]]
    ]
  },
  {
    slug:'practical', title:'Practical English', level_order:2, badge:'🟡',
    description:'English for real life: travel, shopping, customer service, phone calls and daily work.',
    lessons:[
      ['Daily Conversations','Daily greetings, requests, small talk and common responses.',['How is your day?','Could you help me?']],
      ['Work & Professions','Talk about jobs, responsibilities, schedules and workplaces.',['I work as...','I am responsible for...']],
      ['Job Interviews','Answer common interview questions and introduce your experience clearly.',['Tell me about yourself.','I have experience in...']],
      ['Customer Service','Handle greetings, questions, complaints and solutions politely.',['How can I help you?','I am sorry for the inconvenience.']],
      ['Travel & Airport','Useful English for tickets, check-in, directions and travel problems.',['Where is gate five?','I have a reservation.']],
      ['Shopping & Payments','Ask prices, sizes, availability and payment questions.',['How much is this?','Can I pay by card?']],
      ['Phone Calls & Messages','Make calls, leave messages and communicate clearly by text.',['May I speak to...?','I will call you back.']],
      ['Meetings & Teamwork','Participate in meetings, give opinions and agree or disagree politely.',['I agree.','In my opinion...']],
      ['Professional Emails','Write short, clear emails with greetings, requests and closing lines.',['Dear team,','Best regards,']],
      ['Real Work Situations','Combine practical skills in realistic workplace scenarios.',['Could we schedule a meeting?','I will send the report today.']]
    ],
    tests:[
      ['practical-1','Practical Test 1','Daily communication and workplace basics.',70,[
        ['Choose a polite request.',['Could you help me?','Help me now!','You help?'],'Could you help me?'],
        ['Complete: I work ___ a nurse.',['as','at','on'],'as'],
        ['Interview: Tell me about yourself. Best opening:',['I have experience in customer service.','Blue Monday.','Goodbye yesterday.'],'I have experience in customer service.'],
        ['Customer service: a customer has a problem. Start with:',['How can I help you?','That is not my problem.','Go away.'],'How can I help you?'],
        ['Airport: where do you check your flight?',['At the check-in desk','At the supermarket','At the bank'],'At the check-in desk'],
        ['Shopping: ask the price with:',['How much is this?','How many blue?','Price you?'],'How much is this?'],
        ['Phone: ask to speak to Maria:',['May I speak to Maria?','Maria you speak?','Give Maria now.'],'May I speak to Maria?'],
        ['Meeting: polite opinion:',['In my opinion...','You are wrong!','No!'],'In my opinion...'],
        ['Email closing:',['Best regards,','Blue regards,','Good Monday,'],'Best regards,'],
        ['Work situation:',['I will send the report today.','I send yesterday tomorrow.','Report today I?'],'I will send the report today.']
      ]],
      ['practical-2','Practical Test 2','Intermediate practical situations and problem solving.',70,[
        ['You need a meeting time.',['Could we schedule a meeting?','Meeting now!','You schedule?'],'Could we schedule a meeting?'],
        ['A customer is unhappy.',['I am sorry for the inconvenience.','You are wrong.','Not my issue.'],'I am sorry for the inconvenience.'],
        ['At an airport, ask for a gate.',['Where is gate five?','Where gate?','Five is gate?'],'Where is gate five?'],
        ['Payment question:',['Can I pay by card?','Card me?','Pay card yesterday?'],'Can I pay by card?'],
        ['Phone message:',['I will call you back.','I call back yesterday.','Call you now yesterday.'],'I will call you back.'],
        ['Meeting agreement:',['I agree.','I disagree you!','Agreement me.'],'I agree.'],
        ['Professional email request:',['Could you please send the file?','Send file now!','File you?'],'Could you please send the file?'],
        ['Job interview: describe experience.',['I have three years of experience.','Three years I experience?','I am experience three.'],'I have three years of experience.'],
        ['Daily small talk:',['How is your day?','How your day is?','Day you?'],'How is your day?'],
        ['A clear workplace promise:',['I will finish it by Friday.','I finish Friday yesterday.','Friday it?'],'I will finish it by Friday.']
      ]],
      ['practical-3','Practical Test 3','Final Practical English assessment.',75,[
        ['Best customer-service opening:',['How can I help you today?','What do you want?','Why are you here?'],'How can I help you today?'],
        ['Best interview answer starter:',['I have experience in...','Experience me...','I experience?'],'I have experience in...'],
        ['Travel problem:',['Excuse me, my flight is delayed.','Flight bad!','You flight delay.'],'Excuse me, my flight is delayed.'],
        ['Shopping size request:',['Do you have this in a larger size?','Large you?','Size larger now!'],'Do you have this in a larger size?'],
        ['Phone: leave a professional message.',['Please tell him I called.','Tell him now!','Him called?'],'Please tell him I called.'],
        ['Meeting suggestion:',['I suggest we review the plan.','Review plan!','Plan I?'],'I suggest we review the plan.'],
        ['Email greeting to a team:',['Dear team,','Hey you all!','Team dear?'],'Dear team,'],
        ['Professional disagreement:',['I understand your point, but I see it differently.','You are wrong.','No way.'],'I understand your point, but I see it differently.'],
        ['Deadline:',['I will send it by Friday.','I send Friday yesterday.','Friday send?'],'I will send it by Friday.'],
        ['Best final customer response:',['Thank you for your patience.','Wait!','Patience you.'],'Thank you for your patience.']
      ]]
    ]
  },
  {
    slug:'professional', title:'Professional English', level_order:3, badge:'🔵',
    description:'Higher-level English for workplace communication, presentations, negotiation and leadership.',
    lessons:Array.from([
      ['Professional Communication','Clear workplace language, tone and professional vocabulary.'],['Presentations','Structure and deliver short professional presentations.'],['Negotiation','Make proposals, counteroffers and compromises.'],['Leadership & Teamwork','Lead discussions, delegate and give constructive feedback.'],['Reports & Data','Describe results, trends and business information.'],['Meetings & Decisions','Manage agendas, decisions, action points and follow-ups.'],['Conflict Resolution','Handle disagreement respectfully and find solutions.'],['Networking','Introduce yourself, build professional connections and follow up.'],['Advanced Email Writing','Write concise professional emails with appropriate tone.'],['Professional Scenarios','Integrated practice for realistic workplace situations.']
    ]),
    tests:[
      ['professional-1','Professional Test 1','Workplace communication and presentations.',75,[['Best presentation opening:',['Today I would like to discuss...','Listen now!','I talk today?'],'Today I would like to discuss...'],['Professional proposal:',['I suggest we consider this option.','Do this now.','Option me.'],'I suggest we consider this option.'],['Feedback:',['One area we can improve is...','You always fail.','Wrong work.'],'One area we can improve is...'],['Meeting action point:',['I will follow up by Friday.','Follow Friday?','I do later.'],'I will follow up by Friday.'],['Report language:',['Sales increased by 10%.','Sales ten increased?','Increase sales maybe.'],'Sales increased by 10%.'],['Negotiation:',['Would you be open to...?','You must!','Open you?'],'Would you be open to...?'],['Conflict:',['I understand your concern.','That is your fault.','Stop talking.'],'I understand your concern.'],['Networking:',['It is a pleasure to meet you.','Meet me now.','Pleasure?'],'It is a pleasure to meet you.']]],
      ['professional-2','Professional Test 2','Negotiation, leadership and business writing.',75,[['Counteroffer:',['Could we meet halfway?','No.','Halfway you.'],'Could we meet halfway?'],['Delegation:',['Could you take responsibility for this task?','Do it.','Task you?'],'Could you take responsibility for this task?'],['Email subject:',['Project update – Friday meeting','Hello','Thing'],'Project update – Friday meeting'],['Decision:',['Based on the data, I recommend option B.','Option B because yes.','Data thing.'],'Based on the data, I recommend option B.'],['Conflict solution:',['Let us focus on a practical solution.','You are the problem.','No solution.'],'Let us focus on a practical solution.'],['Networking follow-up:',['It was great meeting you.','Meeting was thing.','You great.'],'It was great meeting you.'],['Presentation transition:',['Let us move to the next point.','Next!','Point now.'],'Let us move to the next point.'],['Professional tone:',['Thank you for your time and consideration.','Give me answer.','Answer now.'],'Thank you for your time and consideration.']]],
      ['professional-3','Professional Test 3','Final Professional English assessment.',80,[['Executive recommendation:',['I recommend that we proceed with option A.','Do A.','A now.'],'I recommend that we proceed with option A.'],['Risk language:',['There is a potential risk we should consider.','Risk bad.','Problem maybe.'],'There is a potential risk we should consider.'],['Meeting close:',['Let us confirm the next steps.','Meeting over.','Go now.'],'Let us confirm the next steps.'],['Constructive feedback:',['Your analysis is strong; I suggest clarifying the conclusion.','This is bad.','Fix it.'],'Your analysis is strong; I suggest clarifying the conclusion.'],['Negotiation:',['If we adjust the timeline, could you improve the price?','Price lower now.','Timeline you?'],'If we adjust the timeline, could you improve the price?'],['Report conclusion:',['Overall, the results indicate steady growth.','Growth yes.','Results thing.'],'Overall, the results indicate steady growth.'],['Professional email:',['Please find the requested document attached.','File attached.','Here.'],'Please find the requested document attached.'],['Leadership:',['Let us hear everyone’s perspective before deciding.','I decide.','No opinions.'],'Let us hear everyone’s perspective before deciding.']]]
    ]
  },
  {
    slug:'advanced', title:'Advanced English', level_order:4, badge:'🟣',
    description:'Advanced fluency practice: nuanced communication, argumentation, formal writing and complex situations.',
    lessons:Array.from([
      ['Nuanced Conversation','Express subtle opinions, uncertainty and emphasis.'],['Advanced Listening & Responses','Respond naturally to complex spoken information.'],['Argumentation','Build clear arguments, examples and counterarguments.'],['Formal & Academic Writing','Use structure, cohesion and formal vocabulary.'],['Advanced Presentations','Present complex ideas with clarity and persuasion.'],['Strategy & Decision Making','Discuss trade-offs, priorities and strategic choices.'],['Cross-Cultural Communication','Adapt tone and communication to different contexts.'],['Advanced Negotiation','Handle complex proposals, concessions and conditions.'],['Leadership Communication','Communicate vision, change and difficult messages.'],['Advanced Real-World Practice','Integrated scenarios for high-level English use.']
    ]),
    tests:[
      ['advanced-1','Advanced Test 1','Advanced communication and argumentation.',80,[['Nuanced opinion:',['I tend to agree, although there are some limitations.','Yes always.','No.'],'I tend to agree, although there are some limitations.'],['Argument:',['The evidence suggests that...','The evidence thing.','It is true because yes.'],'The evidence suggests that...'],['Formal writing:',['Furthermore, the findings indicate...','Also thing.','And yes.'],'Furthermore, the findings indicate...'],['Presentation:',['Let us turn to the implications.','Next thing.','Implications now.'],'Let us turn to the implications.'],['Trade-off:',['We need to weigh the costs against the benefits.','Costs and benefits thing.','Choose now.'],'We need to weigh the costs against the benefits.'],['Cross-cultural tone:',['Could you clarify how this is normally handled in your context?','How you do it?','Explain.'],'Could you clarify how this is normally handled in your context?'],['Negotiation:',['Subject to those conditions, we could proceed.','Proceed yes.','Conditions?'],'Subject to those conditions, we could proceed.'],['Leadership:',['I want to acknowledge the concerns before outlining the plan.','Listen plan.','Plan now.'],'I want to acknowledge the concerns before outlining the plan.']]],
      ['advanced-2','Advanced Test 2','Formal communication, strategy and negotiation.',80,[['Strategic choice:',['Given the constraints, I recommend prioritizing the highest-impact work.','Do the biggest thing.','Work now.'],'Given the constraints, I recommend prioritizing the highest-impact work.'],['Counterargument:',['One could argue that..., however...','Wrong argument.','No.'],'One could argue that..., however...'],['Formal request:',['I would appreciate it if you could provide further details.','Give details.','Details now.'],'I would appreciate it if you could provide further details.'],['Complex negotiation:',['Would you be willing to revisit the timeline in light of these constraints?','Change time.','Timeline now.'],'Would you be willing to revisit the timeline in light of these constraints?'],['Leadership change:',['We recognize the concerns and will address them transparently.','Change now.','No concerns.'],'We recognize the concerns and will address them transparently.'],['Presentation conclusion:',['To conclude, the evidence supports three main actions.','Three things.','Finish.'],'To conclude, the evidence supports three main actions.'],['Formal disagreement:',['I respectfully disagree with that interpretation.','You are wrong.','No.'],'I respectfully disagree with that interpretation.'],['Decision rationale:',['This approach balances feasibility, cost and long-term impact.','It is good.','Do it.'],'This approach balances feasibility, cost and long-term impact.']]],
      ['advanced-3','Advanced Test 3','Final Advanced English assessment.',85,[['Best thesis statement:',['This analysis examines how digital access influences workplace learning.','Digital is good.','Learning thing.'],'This analysis examines how digital access influences workplace learning.'],['Qualified claim:',['The results appear to indicate a gradual improvement.','Results improve.','It improves.'],'The results appear to indicate a gradual improvement.'],['Formal conclusion:',['Taken together, these findings support a cautious but positive outlook.','Good results.','Positive.'],'Taken together, these findings support a cautious but positive outlook.'],['Complex negotiation:',['If the scope remains unchanged, we would need additional time to deliver it responsibly.','Need time.','More time.'],'If the scope remains unchanged, we would need additional time to deliver it responsibly.'],['Executive communication:',['I would like to highlight the key implications for our next decision.','Key thing.','Decision now.'],'I would like to highlight the key implications for our next decision.'],['Cross-cultural clarification:',['To make sure I understand correctly, could you explain your preferred approach?','Explain your way.','What?'],'To make sure I understand correctly, could you explain your preferred approach?'],['Constructive challenge:',['I see the rationale; however, I believe we should examine the downside risk.','That is wrong.','Risk bad.'],'I see the rationale; however, I believe we should examine the downside risk.'],['Final response:',['Thank you for raising that point. Let us consider the evidence before deciding.','Okay.','Next.'],'Thank you for raising that point. Let us consider the evidence before deciding.']]]
    ]
  }
];

function lessonRows(level){return level.lessons.map((x,i)=>level.slug==='basic'?({title:x[0],free:!!x[1],content:x[2]||'',pron:x[3]||[],lesson_order:i+1}):({title:x[0],free:false,content:x[1]||'',pron:x[2]||[],lesson_order:i+1}));}

function testDurationMinutes(levelOrder){return ({1:90,2:120,3:150,4:180}[Number(levelOrder)])||90;}

async function init(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,country VARCHAR(10) NOT NULL DEFAULT 'OTHER',premium_until TIMESTAMPTZ,created_at TIMESTAMPTZ DEFAULT NOW());
    ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE; ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_user_id INT REFERENCES users(id) ON DELETE SET NULL;
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,expires_at TIMESTAMPTZ NOT NULL);
    CREATE TABLE IF NOT EXISTS courses(id SERIAL PRIMARY KEY,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,description TEXT,level_order INT NOT NULL,active BOOLEAN DEFAULT TRUE);
    CREATE TABLE IF NOT EXISTS lessons(id SERIAL PRIMARY KEY,course_id INT REFERENCES courses(id) ON DELETE CASCADE,title TEXT NOT NULL,content TEXT NOT NULL,free BOOLEAN DEFAULT FALSE,lesson_order INT NOT NULL,pronunciation JSONB DEFAULT '[]',UNIQUE(course_id,lesson_order));
    CREATE TABLE IF NOT EXISTS progress(user_id INT REFERENCES users(id) ON DELETE CASCADE,lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,completed_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(user_id,lesson_id));
    CREATE TABLE IF NOT EXISTS tests(id SERIAL PRIMARY KEY,course_id INT REFERENCES courses(id) ON DELETE CASCADE,slug TEXT UNIQUE NOT NULL,title TEXT NOT NULL,description TEXT,pass_score INT NOT NULL DEFAULT 70,required BOOLEAN DEFAULT TRUE,questions JSONB NOT NULL,duration_minutes INT NOT NULL DEFAULT 90);
    ALTER TABLE tests ADD COLUMN IF NOT EXISTS duration_minutes INT NOT NULL DEFAULT 90;
    CREATE TABLE IF NOT EXISTS test_sessions(user_id INT REFERENCES users(id) ON DELETE CASCADE,test_id INT REFERENCES tests(id) ON DELETE CASCADE,started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),expires_at TIMESTAMPTZ NOT NULL,PRIMARY KEY(user_id,test_id));
    CREATE TABLE IF NOT EXISTS test_recovery(user_id INT REFERENCES users(id) ON DELETE CASCADE,test_id INT REFERENCES tests(id) ON DELETE CASCADE,cycle_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),recovery_required BOOLEAN NOT NULL DEFAULT FALSE,PRIMARY KEY(user_id,test_id));
    CREATE TABLE IF NOT EXISTS test_attempts(id BIGSERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,test_id INT REFERENCES tests(id) ON DELETE CASCADE,score NUMERIC(5,2),total INT,passed BOOLEAN,answers JSONB,created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS certificates(id BIGSERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,course_id INT REFERENCES courses(id) ON DELETE CASCADE,certificate_code TEXT UNIQUE NOT NULL,issued_at TIMESTAMPTZ DEFAULT NOW(),UNIQUE(user_id,course_id));
    CREATE TABLE IF NOT EXISTS pricing(country_code VARCHAR(10) PRIMARY KEY,country_name TEXT,currency VARCHAR(10),weekly NUMERIC(12,2),monthly NUMERIC(12,2),annual NUMERIC(12,2),active BOOLEAN DEFAULT TRUE,updated_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS shares(id BIGSERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE SET NULL,lesson_id INT,created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS referral_rewards(id BIGSERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,referral_count INT NOT NULL,discount_percent NUMERIC(5,2) NOT NULL DEFAULT 5,used BOOLEAN DEFAULT FALSE,created_at TIMESTAMPTZ DEFAULT NOW(),UNIQUE(user_id,referral_count));
    CREATE TABLE IF NOT EXISTS pronunciation_attempts(id BIGSERIAL PRIMARY KEY,user_id INT REFERENCES users(id) ON DELETE CASCADE,lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,phrase TEXT NOT NULL,recognized_text TEXT,passed BOOLEAN,created_at TIMESTAMPTZ DEFAULT NOW());
  `);
  for(const [c,n,cur,w,m,a] of COUNTRIES) await pool.query(`INSERT INTO pricing(country_code,country_name,currency,weekly,monthly,annual,active) VALUES($1,$2,$3,$4,$5,$6,TRUE) ON CONFLICT(country_code) DO NOTHING`,[c,n,cur,w,m,a]);
  const existingUsers=await pool.query('SELECT id FROM users WHERE referral_code IS NULL'); for(const u of existingUsers.rows){let code; do{code='EME-'+crypto.randomBytes(4).toString('hex').toUpperCase()}while((await pool.query('SELECT 1 FROM users WHERE referral_code=$1',[code])).rows[0]); await pool.query('UPDATE users SET referral_code=$1 WHERE id=$2',[code,u.id]);}
  for(const level of LEVELS){
    const cr=await pool.query(`INSERT INTO courses(slug,title,description,level_order,active) VALUES($1,$2,$3,$4,TRUE) ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,level_order=EXCLUDED.level_order RETURNING id`,[level.slug,level.title,level.description,level.level_order]);
    const cid=cr.rows[0]?.id || (await pool.query('SELECT id FROM courses WHERE slug=$1',[level.slug])).rows[0].id;
    for(const l of lessonRows(level)) await pool.query(`INSERT INTO lessons(course_id,title,content,free,lesson_order,pronunciation) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(course_id,lesson_order) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,free=EXCLUDED.free,pronunciation=EXCLUDED.pronunciation`,[cid,l.title,l.content,!!l.free,l.lesson_order,JSON.stringify(l.pron)]);
    for(const t of level.tests){const [slug,title,description,pass,questions]=t;const duration=testDurationMinutes(level.level_order);await pool.query(`INSERT INTO tests(course_id,slug,title,description,pass_score,required,questions,duration_minutes) VALUES($1,$2,$3,$4,$5,TRUE,$6,$7) ON CONFLICT(slug) DO UPDATE SET course_id=EXCLUDED.course_id,title=EXCLUDED.title,description=EXCLUDED.description,pass_score=EXCLUDED.pass_score,questions=EXCLUDED.questions,duration_minutes=EXCLUDED.duration_minutes`,[cid,slug,title,description,pass,JSON.stringify(questions),duration]);}
  }
}

async function auth(req,res,next){try{const t=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!t)return res.status(401).json({error:'Login required.'});const q=await pool.query(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=$1 AND s.expires_at>NOW()`,[t]);if(!q.rows[0])return res.status(401).json({error:'Session expired. Please log in again.'});req.user=q.rows[0];req.token=t;next();}catch(e){console.error(e);res.status(500).json({error:'Server error.'});}}
function requireAdmin(req,res,next){if(!adminOk(req))return res.status(401).json({error:'Admin authentication required.'});next();}
async function courseProgress(userId,cid){const r=await pool.query(`SELECT COUNT(l.id)::int total,COUNT(p.lesson_id)::int completed FROM lessons l LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=$1 WHERE l.course_id=$2`,[userId,cid]);return r.rows[0];}
async function levelUnlocked(userId,levelOrder){if(levelOrder===1)return true;const prev=(await pool.query('SELECT id FROM courses WHERE level_order=$1',[levelOrder-1])).rows[0];if(!prev)return false;const p=await courseProgress(userId,prev.id);if(p.completed<p.total)return false;const req=(await pool.query('SELECT id FROM tests WHERE course_id=$1 AND required=true',[prev.id])).rows;for(const t of req){const x=await pool.query('SELECT passed FROM test_attempts WHERE user_id=$1 AND test_id=$2 AND passed=true LIMIT 1',[userId,t.id]);if(!x.rows[0])return false;}return true;}
async function maybeCertificate(userId,cid){const c=(await pool.query('SELECT * FROM courses WHERE id=$1',[cid])).rows[0];if(!c)return;const p=await courseProgress(userId,cid);if(p.completed<p.total)return;const tests=(await pool.query('SELECT id FROM tests WHERE course_id=$1 AND required=true',[cid])).rows;for(const t of tests){const x=await pool.query('SELECT 1 FROM test_attempts WHERE user_id=$1 AND test_id=$2 AND passed=true LIMIT 1',[userId,t.id]);if(!x.rows[0])return;}const code=`EME-${c.slug.slice(0,3).toUpperCase()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;await pool.query('INSERT INTO certificates(user_id,course_id,certificate_code) VALUES($1,$2,$3) ON CONFLICT(user_id,course_id) DO NOTHING',[userId,cid,code]);}

app.get('/api/health',async(_,r)=>{try{await pool.query('SELECT 1');r.json({ok:true,database:'connected'})}catch(e){r.status(500).json({ok:false,database:'error'})}});
app.get('/api/countries',(_,r)=>r.json(COUNTRIES.map(x=>({code:x[0],name:x[1]}))));
app.get('/api/pricing',async(req,res)=>{const c=String(req.query.country||'OTHER').toUpperCase();const x=(await pool.query('SELECT * FROM pricing WHERE country_code=$1 AND active=true',[c])).rows[0]||(await pool.query("SELECT * FROM pricing WHERE country_code='OTHER'")).rows[0]; const uid=req.query.userId?+req.query.userId:0; let discount=0; if(uid){const r=(await pool.query('SELECT discount_percent FROM referral_rewards WHERE user_id=$1 AND used=false ORDER BY id LIMIT 1',[uid])).rows[0]; if(r) discount=+r.discount_percent;} const plan=(amount,days)=>{const original=+amount;const final=+(original*(1-discount/100)).toFixed(2);return {amount:final,original,discountPercent:discount,display:fmt(x.currency,final),originalDisplay:fmt(x.currency,original),days};}; res.json({country:x.country_name,currency:x.currency,discountPercent:discount,plans:{weekly:plan(x.weekly,7),monthly:plan(x.monthly,30),annual:plan(x.annual,365)}});});

app.post('/api/register',async(req,res)=>{try{const {name,email,password,country,referralCode}=req.body||{};if(!name||!email||!password||String(password).length<6)return res.status(400).json({error:'Name, email and password (6+ characters) are required.'});const c=String(country||'OTHER').toUpperCase();const exists=await pool.query('SELECT id FROM users WHERE email=$1',[String(email).trim().toLowerCase()]);if(exists.rows[0])return res.status(409).json({error:'Email already registered.'});let referrerId=null; if(referralCode){const rr=(await pool.query('SELECT id FROM users WHERE referral_code=$1',[String(referralCode).trim().toUpperCase()])).rows[0]; if(rr) referrerId=rr.id;} const newReferralCode='EME-'+crypto.randomBytes(4).toString('hex').toUpperCase(); const u=(await pool.query('INSERT INTO users(name,email,password_hash,country,referral_code,referred_by_user_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,email,country,referral_code',[String(name).trim(),String(email).trim().toLowerCase(),hashPassword(password),c,newReferralCode,referrerId])).rows[0]; if(referrerId){const cnt=+(await pool.query('SELECT COUNT(*)::int n FROM users WHERE referred_by_user_id=$1',[referrerId])).rows[0].n; if(cnt%5===0) await pool.query('INSERT INTO referral_rewards(user_id,referral_count,discount_percent) VALUES($1,$2,5) ON CONFLICT DO NOTHING',[referrerId,cnt]);}const t=token();await pool.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL \'30 days\')',[t,u.id]);res.json({token:t,user:u});}catch(e){console.error(e);res.status(500).json({error:'Could not create account.'});}});
app.post('/api/login',async(req,res)=>{try{const {email,password}=req.body||{};const u=(await pool.query('SELECT id,name,email,country,premium_until,password_hash,referral_code FROM users WHERE email=$1',[String(email||'').trim().toLowerCase()])).rows[0];if(!u||hashPassword(password)!==u.password_hash)return res.status(401).json({error:'Email or password is incorrect.'});const t=token();await pool.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL \'30 days\')',[t,u.id]);delete u.password_hash;res.json({token:t,user:u});}catch(e){console.error(e);res.status(500).json({error:'Login failed.'});}});
app.post('/api/logout',auth,async(req,res)=>{await pool.query('DELETE FROM sessions WHERE token=$1',[req.token]);res.json({ok:true});});

app.get('/api/me',auth,async(req,res)=>{const courses=await pool.query(`SELECT c.*,COUNT(DISTINCT l.id)::int lessons,COUNT(DISTINCT p.lesson_id)::int completed FROM courses c LEFT JOIN lessons l ON l.course_id=c.id LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=$1 WHERE c.active GROUP BY c.id ORDER BY c.level_order`,[req.user.id]);const attempts=await pool.query(`SELECT t.slug,t.title,a.score,a.passed,a.created_at FROM test_attempts a JOIN tests t ON t.id=a.test_id WHERE a.user_id=$1 ORDER BY a.created_at DESC`,[req.user.id]);const cert=await pool.query('SELECT c.slug,c.title,x.certificate_code,x.issued_at FROM certificates x JOIN courses c ON c.id=x.course_id WHERE x.user_id=$1 ORDER BY c.level_order',[req.user.id]);const refCount=+(await pool.query('SELECT COUNT(*)::int n FROM users WHERE referred_by_user_id=$1',[req.user.id])).rows[0].n; const reward=(await pool.query('SELECT id,discount_percent FROM referral_rewards WHERE user_id=$1 AND used=false ORDER BY id LIMIT 1',[req.user.id])).rows[0]||null; res.json({user:{id:req.user.id,name:req.user.name,email:req.user.email,country:req.user.country,referral_code:req.user.referral_code,referral_count:refCount,referral_goal:5,discount_available:!!reward,discount_percent:reward?+reward.discount_percent:0,premium:!!req.user.premium_until&&new Date(req.user.premium_until)>new Date(),premium_until:req.user.premium_until},courses:courses.rows,tests:attempts.rows,certificates:cert.rows});});
app.get('/api/courses',auth,async(req,res)=>{const cs=(await pool.query(`SELECT c.*,COUNT(l.id)::int lessons,COUNT(p.lesson_id)::int completed FROM courses c LEFT JOIN lessons l ON l.course_id=c.id LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=$1 WHERE c.active GROUP BY c.id ORDER BY c.level_order`,[req.user.id])).rows;const out=[];for(const c of cs){const tests=(await pool.query('SELECT id,slug,title,description,pass_score,required,questions,duration_minutes FROM tests WHERE course_id=$1 ORDER BY id',[c.id])).rows.map(t=>({...t,questions:t.questions.map((q,i)=>({id:i,prompt:q[0],options:q[1]}))}));const unlocked=await levelUnlocked(req.user.id,c.level_order);out.push({...c,unlocked,tests});}res.json(out);});
app.get('/api/lessons/:courseId',auth,async(req,res)=>{const cid=+req.params.courseId;const c=(await pool.query('SELECT * FROM courses WHERE id=$1',[cid])).rows[0];if(!c)return res.status(404).json({error:'Course not found.'});if(!(await levelUnlocked(req.user.id,c.level_order)))return res.status(403).json({error:'Complete the previous level and pass its required tests first.'});const premium=!!req.user.premium_until&&new Date(req.user.premium_until)>new Date();const rows=(await pool.query(`SELECT l.id,l.title,l.content,l.free,l.lesson_order,l.pronunciation,EXISTS(SELECT 1 FROM progress p WHERE p.lesson_id=l.id AND p.user_id=$1) completed FROM lessons l WHERE l.course_id=$2 ORDER BY l.lesson_order`,[req.user.id,cid])).rows;res.json(rows.map(l=>({...l,locked:!l.free&&!premium})));});
app.get('/api/lesson/:id',auth,async(req,res)=>{const l=(await pool.query('SELECT l.*,c.title course_title,c.level_order,c.slug course_slug FROM lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=$1',[+req.params.id])).rows[0];if(!l)return res.status(404).json({error:'Lesson not found.'});if(!(await levelUnlocked(req.user.id,l.level_order)))return res.status(403).json({error:'Complete the previous level and pass its required tests first.'});if(!l.free&&!(req.user.premium_until&&new Date(req.user.premium_until)>new Date()))return res.status(403).json({error:'This chapter is Premium. Choose a plan to continue.'});res.json(l);});
app.post('/api/progress/:id',auth,async(req,res)=>{const l=(await pool.query('SELECT l.*,c.level_order,c.id course_id FROM lessons l JOIN courses c ON c.id=l.course_id WHERE l.id=$1',[+req.params.id])).rows[0];if(!l)return res.status(404).json({error:'Lesson not found.'});if(!(await levelUnlocked(req.user.id,l.level_order)))return res.status(403).json({error:'Level locked.'});if(!l.free&&!(req.user.premium_until&&new Date(req.user.premium_until)>new Date()))return res.status(403).json({error:'Premium chapter.'});await pool.query('INSERT INTO progress(user_id,lesson_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[req.user.id,l.id]);const p=await courseProgress(req.user.id,l.course_id);await maybeCertificate(req.user.id,l.course_id);res.json({ok:true,completed:p.completed,total:p.total,firstChapterCompleted:l.level_order===1&&l.lesson_order===1});});
app.post('/api/pronunciation',auth,async(req,res)=>{const {lessonId,phrase,recognizedText}=req.body||{};const l=(await pool.query('SELECT id,course_id FROM lessons WHERE id=$1',[+lessonId])).rows[0];if(!l||!phrase)return res.status(400).json({error:'Pronunciation item not found.'});const a=norm(phrase),b=norm(recognizedText);const words=a.split(' ').filter(Boolean);const matched=words.filter(w=>b.includes(w)).length;const score=words.length?matched/words.length:0;const passed=a===b||score>=0.8;await pool.query('INSERT INTO pronunciation_attempts(user_id,lesson_id,phrase,recognized_text,passed) VALUES($1,$2,$3,$4,$5)',[req.user.id,l.id,phrase,String(recognizedText||''),passed]);res.json({passed,score:Math.round(score*100),recognizedText:String(recognizedText||'')});});

async function getTestState(userId,testId){
  const row=(await pool.query('SELECT * FROM test_recovery WHERE user_id=$1 AND test_id=$2',[userId,testId])).rows[0];
  if(row)return row;
  return (await pool.query('INSERT INTO test_recovery(user_id,test_id) VALUES($1,$2) RETURNING *',[userId,testId])).rows[0];
}

app.get('/api/tests/:slug',auth,async(req,res)=>{try{
  const t=(await pool.query('SELECT * FROM tests WHERE slug=$1',[req.params.slug])).rows[0];
  if(!t)return res.status(404).json({error:'Test not found.'});
  const c=(await pool.query('SELECT * FROM courses WHERE id=$1',[t.course_id])).rows[0];
  if(!(await levelUnlocked(req.user.id,c.level_order)))return res.status(403).json({error:'This test is locked.'});
  const p=await courseProgress(req.user.id,c.id);
  const checkpoint=t.slug==='basic-checkpoint';
  if(!checkpoint&&p.completed<p.total)return res.status(403).json({error:`Complete all ${p.total} chapters before this test.`});
  if(checkpoint&&p.completed<3)return res.status(403).json({error:'Complete the first 3 free chapters before this test.'});
  const state=await getTestState(req.user.id,t.id);
  if(state.recovery_required)return res.status(403).json({error:'Both attempts were used. Review the required chapters before trying this test again.'});
  let session=(await pool.query('SELECT * FROM test_sessions WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id])).rows[0];
  if(session && new Date(session.expires_at)<=new Date()){await pool.query('DELETE FROM test_sessions WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id]);session=null;}
  if(!session){
    const minutes=Number(t.duration_minutes)||testDurationMinutes(c.level_order);
    session=(await pool.query(`INSERT INTO test_sessions(user_id,test_id,started_at,expires_at) VALUES($1,$2,NOW(),NOW()+($3::text || ' minutes')::interval) RETURNING *`,[req.user.id,t.id,minutes])).rows[0];
  }
  const serverNow=new Date().toISOString();
  res.json({id:t.id,slug:t.slug,title:t.title,description:t.description,pass_score:t.pass_score,duration_minutes:Number(t.duration_minutes)||testDurationMinutes(c.level_order),started_at:session.started_at,expires_at:session.expires_at,server_now:serverNow,attemptsUsed:(await pool.query('SELECT COUNT(*)::int n FROM test_attempts WHERE user_id=$1 AND test_id=$2 AND created_at>= $3',[req.user.id,t.id,state.cycle_started_at])).rows[0].n,maxAttempts:2,questions:t.questions.map((x,i)=>({id:i,prompt:x[0],options:varyOptions(x[1],x[2],i)}))});
}catch(e){console.error(e);res.status(500).json({error:'Could not open test.'})}});

app.post('/api/tests/:slug/submit',auth,async(req,res)=>{try{
  const t=(await pool.query('SELECT * FROM tests WHERE slug=$1',[req.params.slug])).rows[0];
  if(!t)return res.status(404).json({error:'Test not found.'});
  const c=(await pool.query('SELECT * FROM courses WHERE id=$1',[t.course_id])).rows[0];
  if(!(await levelUnlocked(req.user.id,c.level_order)))return res.status(403).json({error:'This test is locked.'});
  const p=await courseProgress(req.user.id,c.id);const checkpoint=t.slug==='basic-checkpoint';
  if(checkpoint&&p.completed<3)return res.status(403).json({error:'Complete the first 3 chapters first.'});
  if(!checkpoint&&p.completed<p.total)return res.status(403).json({error:`Complete all ${p.total} chapters first.`});
  const state=await getTestState(req.user.id,t.id);
  if(state.recovery_required)return res.status(403).json({error:'Both attempts were used. Review the required chapters before trying this test again.'});
  const session=(await pool.query('SELECT * FROM test_sessions WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id])).rows[0];
  if(!session)return res.status(400).json({error:'Test session not found. Open the test again.'});
  if(new Date(session.expires_at)<=new Date()){await pool.query('DELETE FROM test_sessions WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id]);return res.status(408).json({error:'Time is up. Your test was not submitted. Open the test again to use your next attempt.'});}
  const used=+(await pool.query('SELECT COUNT(*)::int n FROM test_attempts WHERE user_id=$1 AND test_id=$2 AND created_at>= $3',[req.user.id,t.id,state.cycle_started_at])).rows[0].n;
  if(used>=2)return res.status(403).json({error:'You have already used both attempts. Review the required chapters.'});
  const ans=Array.isArray(req.body?.answers)?req.body.answers:[];
  const correct=t.questions.reduce((n,q,i)=>n+(norm(ans[i])===norm(q[2])?1:0),0);
  const score=Math.round(correct/t.questions.length*100);const passed=score>=t.pass_score;const attemptNumber=used+1;
  await pool.query('INSERT INTO test_attempts(user_id,test_id,score,total,passed,answers) VALUES($1,$2,$3,$4,$5,$6)',[req.user.id,t.id,score,t.questions.length,passed,JSON.stringify(ans)]);
  await pool.query('DELETE FROM test_sessions WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id]);
  let recoveryRequired=false;
  if(passed){await pool.query('UPDATE test_recovery SET recovery_required=false,cycle_started_at=NOW() WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id]);if(!checkpoint)await maybeCertificate(req.user.id,c.id)}
  else if(attemptNumber>=2){
    recoveryRequired=true;
    if(checkpoint)await pool.query('DELETE FROM progress WHERE user_id=$1 AND lesson_id IN (SELECT id FROM lessons WHERE course_id=$2 AND lesson_order<=3)',[req.user.id,c.id]);
    else await pool.query('DELETE FROM progress WHERE user_id=$1 AND lesson_id IN (SELECT id FROM lessons WHERE course_id=$2)',[req.user.id,c.id]);
    await pool.query('UPDATE test_recovery SET recovery_required=true WHERE user_id=$1 AND test_id=$2',[req.user.id,t.id]);
  }
  res.json({score,passed,passScore:t.pass_score,correct,total:t.questions.length,attemptNumber,maxAttempts:2,recoveryRequired});
}catch(e){console.error(e);res.status(500).json({error:'Could not submit test.'})}});

app.post('/api/upgrade',auth,async(req,res)=>{const plan=String(req.body?.plan||'monthly');const days={weekly:7,monthly:30,annual:365}[plan]||30; const reward=(await pool.query('SELECT id,discount_percent FROM referral_rewards WHERE user_id=$1 AND used=false ORDER BY id LIMIT 1',[req.user.id])).rows[0]||null; await pool.query('UPDATE users SET premium_until=GREATEST(COALESCE(premium_until,NOW()),NOW())+$1::interval WHERE id=$2',[`${days} days`,req.user.id]); if(reward) await pool.query('UPDATE referral_rewards SET used=true WHERE id=$1',[reward.id]); res.json({ok:true,mode:'DEMO',discountApplied:reward?+reward.discount_percent:0,message:reward?`Demo upgrade active with ${reward.discount_percent}% referral discount. Real payment integration still needs a payment provider and verified webhooks.`:'Demo upgrade active. Real payment integration can be connected after the payment provider is chosen.'});});
app.post('/api/share',auth,async(req,res)=>{await pool.query('INSERT INTO shares(user_id,lesson_id) VALUES($1,$2)',[req.user.id,req.body?.lessonId||null]);res.json({ok:true,referralCode:req.user.referral_code,referralLink:`${req.protocol}://${req.get('host')}/?ref=${encodeURIComponent(req.user.referral_code)}`});});
app.get('/api/referral',auth,async(req,res)=>{const count=+(await pool.query('SELECT COUNT(*)::int n FROM users WHERE referred_by_user_id=$1',[req.user.id])).rows[0].n; const rewards=(await pool.query('SELECT id,referral_count,discount_percent,used,created_at FROM referral_rewards WHERE user_id=$1 ORDER BY id DESC',[req.user.id])).rows; res.json({code:req.user.referral_code,count,goal:5,link:`${req.protocol}://${req.get('host')}/?ref=${encodeURIComponent(req.user.referral_code)}`,rewards});});

app.get('/api/certificate/:slug',auth,async(req,res)=>{const x=(await pool.query(`SELECT c.title,u.name,cert.certificate_code,cert.issued_at FROM certificates cert JOIN courses c ON c.id=cert.course_id JOIN users u ON u.id=cert.user_id WHERE cert.user_id=$1 AND c.slug=$2`,[req.user.id,req.params.slug])).rows[0];if(!x)return res.status(404).json({error:'Certificate not available yet.'});res.json(x);});
app.get('/certificate',async(req,res)=>{const code=String(req.query.code||'');const x=(await pool.query(`SELECT c.title,u.name,cert.certificate_code,cert.issued_at FROM certificates cert JOIN courses c ON c.id=cert.course_id JOIN users u ON u.id=cert.user_id WHERE cert.certificate_code=$1`,[code])).rows[0];if(!x)return res.status(404).send('Certificate not found');res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Certificate - English Made Easy</title><style>body{font-family:Georgia,serif;background:#f3f6ff;padding:40px}.card{max-width:800px;margin:auto;background:#fff;padding:60px;text-align:center;border:8px solid #315dcc;border-radius:24px}h1{font-size:44px;color:#234da7}h2{font-size:32px}p{font-size:20px}button{padding:12px 20px}</style></head><body><div class="card"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${escapeHtml(x.name)}</h2><p>has completed</p><h2>${escapeHtml(x.title)}</h2><p>English Made Easy</p><p>Certificate code: <strong>${escapeHtml(x.certificate_code)}</strong></p><p>${new Date(x.issued_at).toLocaleDateString()}</p><button onclick="print()">Print / Save as PDF</button></div></body></html>`);});
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

app.post('/api/admin/login',(req,res)=>{if(!ADMIN_EMAIL||!ADMIN_PASSWORD)return res.status(500).json({error:'Set ADMIN_EMAIL and ADMIN_PASSWORD in Render first.'});if(String(req.body?.email||'').trim().toLowerCase()!==ADMIN_EMAIL||String(req.body?.password||'')!==ADMIN_PASSWORD)return res.status(401).json({error:'Admin email or password is incorrect.'});res.json({ok:true});});
app.get('/api/admin/pricing',requireAdmin,async(_,res)=>res.json((await pool.query('SELECT * FROM pricing ORDER BY country_code')).rows));
app.put('/api/admin/pricing/:country',requireAdmin,async(req,res)=>{const d=req.body||{};if(!d.country_name||!d.currency||[d.weekly,d.monthly,d.annual].some(v=>!Number.isFinite(+v)||+v<0))return res.status(400).json({error:'Invalid pricing.'});const x=(await pool.query(`UPDATE pricing SET country_name=$2,currency=$3,weekly=$4,monthly=$5,annual=$6,active=$7,updated_at=NOW() WHERE country_code=$1 RETURNING *`,[String(req.params.country).toUpperCase(),d.country_name,d.currency,d.weekly,d.monthly,d.annual,!!d.active])).rows[0];res.json(x||{error:'Country not found.'});});
app.get('/api/admin/courses',requireAdmin,async(_,res)=>{const cs=(await pool.query('SELECT id,slug,title,description,level_order,active FROM courses ORDER BY level_order')).rows; for(const c of cs){c.lessons=(await pool.query('SELECT id,title,content,free,lesson_order,pronunciation FROM lessons WHERE course_id=$1 ORDER BY lesson_order',[c.id])).rows; c.tests=(await pool.query('SELECT id,slug,title,description,pass_score,required,questions,duration_minutes FROM tests WHERE course_id=$1 ORDER BY id',[c.id])).rows;} res.json(cs);});
app.put('/api/admin/lessons/:id',requireAdmin,async(req,res)=>{const d=req.body||{}; if(!d.title||typeof d.content!=='string'||!Number.isInteger(+d.lesson_order)||!Array.isArray(d.pronunciation)) return res.status(400).json({error:'Invalid lesson data.'}); const x=(await pool.query('UPDATE lessons SET title=$2,content=$3,free=$4,lesson_order=$5,pronunciation=$6 WHERE id=$1 RETURNING *',[+req.params.id,d.title,d.content,!!d.free,+d.lesson_order,JSON.stringify(d.pronunciation)])).rows[0]; if(!x)return res.status(404).json({error:'Lesson not found.'}); res.json(x);});
app.put('/api/admin/courses/:id',requireAdmin,async(req,res)=>{const d=req.body||{}; const x=(await pool.query('UPDATE courses SET title=$2,description=$3,active=$4 WHERE id=$1 RETURNING *',[+req.params.id,d.title,d.description,!!d.active])).rows[0]; if(!x)return res.status(404).json({error:'Course not found.'}); res.json(x);});
app.put('/api/admin/tests/:id',requireAdmin,async(req,res)=>{const d=req.body||{}; if(!d.title||!Array.isArray(d.questions)||!Number.isFinite(+d.pass_score))return res.status(400).json({error:'Invalid test data.'}); const duration=Math.max(10,Math.min(480,Number(d.duration_minutes)||90)); const x=(await pool.query('UPDATE tests SET title=$2,description=$3,pass_score=$4,required=$5,questions=$6,duration_minutes=$7 WHERE id=$1 RETURNING id,slug,title,description,pass_score,required,questions,duration_minutes',[+req.params.id,d.title,d.description,+d.pass_score,!!d.required,JSON.stringify(d.questions),duration])).rows[0]; if(!x)return res.status(404).json({error:'Test not found.'}); res.json(x);});
app.get('/api/admin/stats',requireAdmin,async(_,res)=>{const a=await Promise.all([pool.query('SELECT COUNT(*)::int n FROM users'),pool.query('SELECT COUNT(*)::int n FROM test_attempts'),pool.query('SELECT COUNT(*)::int n FROM certificates'),pool.query('SELECT COUNT(*)::int n FROM shares')]);const rr=await pool.query('SELECT COUNT(*)::int n FROM referral_rewards WHERE used=false'); res.json({users:a[0].rows[0].n,tests:a[1].rows[0].n,certificates:a[2].rows[0].n,shares:a[3].rows[0].n,referralRewards:rr.rows[0].n});});

app.get('*',(req,res)=>res.sendFile(require('path').join(process.cwd(),'public','index.html')));
init().then(()=>app.listen(PORT,()=>console.log(`English Made Easy running on ${PORT}`))).catch(e=>{console.error('Database initialization failed',e);process.exit(1);});
