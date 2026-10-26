'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const lotus = '<svg class="brand-mark" aria-hidden="true"><use href="#lotus"/></svg>';
const escapeHTML = value => { const node = document.createElement('span'); node.textContent = String(value ?? ''); return node.innerHTML; };
const attr = value => escapeHTML(value).replace(/"/g, '&#34;').replace(/'/g, '&#39;');
const uid = () => window.crypto?.randomUUID ? crypto.randomUUID() : `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
const STORE_KEY = 'gita.sanctuary.v1';
const CORPUS_KEY = 'gita.corpus.v3';
const CORPUS_URL = 'https://raw.githubusercontent.com/ravitejakamalapuram/GitaVerses/main/verses.js';
const COUNTS = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
const CHAPTERS = ['The Despondency of Arjuna', 'The Wisdom of the Self', 'The Yoga of Action', 'The Yoga of Wisdom', 'The Yoga of Renunciation', 'The Yoga of Meditation', 'Wisdom and Realization', 'The Eternal Spirit', 'The Royal Knowledge', 'The Divine Glories', 'The Universal Form', 'The Yoga of Devotion', 'The Field and Its Knower', 'The Three Qualities', 'The Supreme Spirit', 'The Divine and the Demonic', 'The Three Kinds of Faith', 'Liberation through Renunciation'];
const CHAPTERS_TE = ['అర్జున విషాద యోగము', 'సాంఖ్య యోగము', 'కర్మ యోగము', 'జ్ఞాన కర్మ సన్న్యాస యోగము', 'కర్మ సన్న్యాస యోగము', 'ధ్యాన యోగము', 'జ్ఞాన విజ్ఞాన యోగము', 'అక్షర పరబ్రహ్మ యోగము', 'రాజవిద్యా రాజగుహ్య యోగము', 'విభూతి యోగము', 'విశ్వరూప సందర్శన యోగము', 'భక్తి యోగము', 'క్షేత్ర క్షేత్రజ్ఞ విభాగ యోగము', 'గుణత్రయ విభాగ యోగము', 'పురుషోత్తమ ప్రాప్తి యోగము', 'దైవాసుర సంపద్విభాగ యోగము', 'శ్రద్ధాత్రయ విభాగ యోగము', 'మోక్ష సన్న్యాస యోగము'];
const TOPBAR_TITLES = { overview: 'Overview', journal: 'My Journal', saved: 'Saved verses', library: 'Bhagavad Gita', themes: 'Wisdom by theme', settings: 'Settings' };
const MOODS = ['Peaceful', 'Grateful', 'Uncertain', 'Anxious', 'Low'];
const THEMES = {
    overthinking: {
        title: 'A quieter mind', title_te: 'ప్రశాంతమైన మనస్సు',
        name: 'Overthinking', name_te: 'అధిక ఆలోచన',
        icon: 'wind',
        description: 'Find a little space between you and your thoughts.', description_te: 'మీ ఆలోచనల మధ్య కాస్త ప్రశాంతతను వెతకండి.',
        keywords: ['overthink', 'overthinking', 'anxiety', 'anxious', 'worry', 'worried', 'stress', 'stressed', 'restless', 'fear', 'afraid', 'uncertain', 'thoughts', 'overwhelmed', 'ఆలోచన', 'ఆందోళన', 'భయం', 'ఒత్తిడి'],
        anchors: ['6.26', '6.35', '2.48', '2.70'],
        explanation: 'The invitation is not to stop every thought. It is to notice when your attention wanders and return, gently, to what you can do in this moment. Returning is the practice, not a sign that you have failed.',
        explanation_te: 'ప్రతి ఆలోచనను ఆపడం సాధ్యం కాదు. మీ దృష్టి మరలినప్పుడు గమనించి, మళ్లీ ప్రస్తుత క్షణంలోకి సున్నితంగా తిరిగి రావడమే సాధన.'
    },
    detachment: {
        title: 'The art of letting go', title_te: 'వదిలేయడం ఎలా',
        name: 'Letting go', name_te: 'వదిలేయడం',
        icon: 'leaf',
        description: 'Care deeply, without holding on so tightly.', description_te: 'బాధ్యతగా ఉండండి, కానీ ఫలితంపై వ్యామోహం వద్దు.',
        keywords: ['let go', 'letting go', 'attachment', 'attached', 'outcome', 'outcomes', 'expectation', 'expectations', 'control', 'failure', 'success', 'perfection', 'results', 'ఫలితం', 'అంచనాలు', 'విజయం', 'అపజయం'],
        anchors: ['2.47', '2.48', '5.10', '3.19'],
        explanation: 'The Gita draws a distinction between wholehearted effort and trying to control every result. Letting go does not mean not caring. It means giving your best to the action that is yours, while making room for what you cannot determine.',
        explanation_te: 'మీ వంతు కృషి పూర్తిగా చేయండి, కానీ ప్రతి ఫలితాన్ని నియంత్రించాలనే ఆలోచనను వదిలేయండి. ఫలితం ఏదైనా స్వీకరించే మనస్తత్వమే నిజమైన యోగం.'
    },
    purpose: {
        title: 'Finding your direction', title_te: 'గమ్యాన్ని చేరుకోవడం',
        name: 'Purpose & duty', name_te: 'లక్ష్యం - కర్తవ్యం',
        icon: 'compass',
        description: 'Reconnect with what is yours to do.', description_te: 'మీ నిజమైన బాధ్యతను గుర్తించండి.',
        keywords: ['purpose', 'duty', 'career', 'work', 'job', 'decision', 'choose', 'choice', 'direction', 'dharma', 'meaning', 'lost', 'responsibility', 'should', 'లక్ష్యం', 'కర్తవ్యం', 'బాధ్యత', 'ధర్మం'],
        anchors: ['3.35', '18.46', '2.47', '18.63'],
        explanation: 'The Gita invites you to examine the work that fits your circumstances and values, rather than measuring yourself against someone else. Your next responsible step need not reveal the whole path.',
        explanation_te: 'ఇతరులతో పోల్చుకోకుండా, మీ పరిస్థితులకు, విలువలకూ సరిపోయే పనిని ఎంచుకోండి. మీ ధర్మాన్ని మీరు ఆచరించడమే శ్రేయస్కరం.'
    },
    compassion: {
        title: 'More room for kindness', title_te: 'దయ, కరుణ',
        name: 'Relationships', name_te: 'బంధాలు',
        icon: 'heart',
        description: 'Meet yourself and others with a softer heart.', description_te: 'మీతో మరియు ఇతరులతో దయగా ఉండండి.',
        keywords: ['relationship', 'relationships', 'family', 'friend', 'partner', 'marriage', 'love', 'lonely', 'loneliness', 'kindness', 'compassion', 'conflict', 'forgive', 'forgiveness', 'ప్రేమ', 'దయ', 'క్షమ', 'బంధం'],
        anchors: ['12.13', '12.15', '5.18', '17.15'],
        explanation: 'Compassion does not require abandoning your boundaries. The Gita encourages a heart that wishes others well, and speech that is truthful, kind, and useful. You can be caring and still be clear about what you need.',
        explanation_te: 'భగవద్గీత అందరి పట్ల ద్వేషం లేకుండా, మిత్రుడిగా, కరుణతో ఉండమని సూచిస్తుంది. సత్యమైన, ప్రియమైన, హితకరమైన మాటలే మాట్లాడాలి.'
    },
    grief: {
        title: 'Through seasons of change', title_te: 'బాధ, మార్పు',
        name: 'Grief & change', name_te: 'దుఃఖం - మార్పు',
        icon: 'mountain',
        description: 'Make space for loss, change, and beginning again.', description_te: 'నష్టాన్ని స్వీకరించి, మళ్లీ ప్రారంభించండి.',
        keywords: ['grief', 'grieving', 'loss', 'lost someone', 'died', 'death', 'bereavement', 'sad', 'sadness', 'breakup', 'change', 'heartbroken', 'missing', 'బాధ', 'మరణం', 'మార్పు', 'దుఃఖం'],
        anchors: ['2.14', '2.20', '12.13'],
        explanation: 'The Gita speaks about how our experiences change, but that need not diminish what you are feeling. A spiritual perspective can sit beside grief, not replace it. There is room to remember, to rest, and to ask for human support.',
        explanation_te: 'సుఖదుఃఖాలు, శీతోష్ణాలు వస్తూ పోతూ ఉంటాయి. మార్పు సహజం అని గ్రహించి, సహనంతో వాటిని భరించాలి.'
    },
    discipline: {
        title: 'One small, steady step', title_te: 'క్రమశిక్షణ',
        name: 'Discipline', name_te: 'క్రమశిక్షణ',
        icon: 'circle',
        description: 'Build a practice without being hard on yourself.', description_te: 'స్థిరమైన అభ్యాసాన్ని పెంచుకోండి.',
        keywords: ['procrastination', 'procrastinate', 'lazy', 'unmotivated', 'motivation', 'discipline', 'habit', 'habits', 'stuck', 'avoid', 'focus', 'practice', 'routine', 'క్రమశిక్షణ', 'అభ్యాసం', 'బద్ధకం'],
        anchors: ['3.8', '6.5', '6.17', '6.35'],
        explanation: 'Steady action need not be dramatic. The Gita values practice and balance, rather than either avoidance or exhausting effort. A sustainable beginning is often more useful than a perfect plan.',
        explanation_te: 'మనస్సు చంచలమైనది, కానీ నిరంతర అభ్యాసం మరియు వైరాగ్యం ద్వారా దానిని అదుపులో ఉంచుకోవచ్చు.'
    },
    balance: {
        title: 'Return to your balance', title_te: 'సమతుల్యత',
        name: 'Balance', name_te: 'సమతుల్యత',
        icon: 'sun',
        description: 'Make room for rest, perspective, and enough.', description_te: 'విశ్రాంతి, పని మధ్య సమతుల్యత.',
        keywords: ['burnout', 'burned out', 'tired', 'exhausted', 'balance', 'sleep', 'rest', 'busy', 'overwork', 'fatigue', 'peace', 'peaceful', 'calm', 'విశ్రాంతి', 'అలసట', 'సమతుల్యత'],
        anchors: ['6.17', '2.48', '2.70'],
        explanation: 'The Gita describes a balanced way of living: neither excess nor deprivation, but steadiness in work, rest, and daily habits. Caring for your body can support the clarity you are seeking.',
        explanation_te: 'ఆహారం, విహారం, పని, నిద్ర - వీటన్నింటిలో సమతుల్యత పాటించే వ్యక్తికి యోగం సిద్ధిస్తుంది.'
    },
    gratitude: {
        title: 'Notice the good', title_te: 'కృతజ్ఞత',
        name: 'Gratitude', name_te: 'కృతజ్ఞత',
        icon: 'sparkle',
        description: 'Let ordinary moments become a little more meaningful.', description_te: 'ప్రతి చిన్న క్షణాన్ని ఆస్వాదించండి.',
        keywords: ['gratitude', 'grateful', 'thankful', 'joy', 'happy', 'happiness', 'appreciate', 'content', 'contentment', 'sattva', 'సంతోషం', 'కృతజ్ఞత', 'ఆనందం'],
        anchors: ['9.26', '12.14', '4.39'],
        explanation: 'A simple act, offered with sincerity, can carry meaning. Gratitude is not a demand to ignore difficulty; it is a way of noticing what supports you alongside it.',
        explanation_te: 'భక్తితో, శ్రద్ధతో సమర్పించిన ఆకు, పువ్వు, పండు లేదా నీరు ఏదైనా భగవంతుడు ప్రీతితో స్వీకరిస్తాడు. ఏది ఉన్నా సంతృప్తి చెందడమే కృతజ్ఞత.'
    },
    anger: {
        title: 'A pause before reacting', title_te: 'కోపం',
        name: 'Anger', name_te: 'కోపం',
        icon: 'wind',
        description: 'Respond with clarity, rather than the heat of the moment.', description_te: 'కోపంలో కాకుండా, స్పష్టతతో స్పందించండి.',
        keywords: ['anger', 'angry', 'rage', 'irritated', 'resentment', 'frustration', 'frustrated', 'jealous', 'jealousy', 'కోపం', 'ఆవేశం', 'క్రోధం'],
        anchors: ['2.62', '2.63', '16.21', '17.15'],
        explanation: 'The Gita describes how fixation and anger can cloud discernment. The practical invitation is to create a pause, so that your next action comes from your values rather than the strongest feeling of the moment.',
        explanation_te: 'కోపం వల్ల అవివేకం పుడుతుంది, దానివల్ల జ్ఞాపకశక్తి నశిస్తుంది, తద్వారా విచక్షణ కోల్పోయి మనిషి పతనమవుతాడు.'
    },
    confidence: {
        title: 'Be on your own side', title_te: 'ఆత్మవిశ్వాసం',
        name: 'Self-belief', name_te: 'ఆత్మవిశ్వాసం',
        icon: 'mountain',
        description: 'Find a steadier voice within yourself.', description_te: 'మీపై మీకు నమ్మకం పెంచుకోండి.',
        keywords: ['confidence', 'insecure', 'insecurity', 'self doubt', 'self-doubt', 'worth', 'worthless', 'enough', 'compare', 'comparison', 'self esteem', 'believe', 'నమ్మకం', 'ఆత్మవిశ్వాసం', 'ధైర్యం'],
        anchors: ['6.5', '6.6', '3.35'],
        explanation: 'The Gita speaks of becoming a friend to yourself rather than an adversary. You can notice a harsh thought without treating it as a final verdict, and choose an action that supports you.',
        explanation_te: 'మనిషి తనని తాను ఉద్ధరించుకోవాలి కానీ పతనం చేసుకోకూడదు. ఎందుకంటే తనకు తానే మిత్రుడు, తనకు తానే శత్రువు.'
    }
};

const SEED_ROWS = [
    ['2.14', 'The contact of the senses with their objects brings cold and heat, pleasure and pain. These experiences come and go; learn to bear them patiently.', 'matra-sparshas tu kaunteya shitoshna-sukha-duhkha-dah', 'Experience, patience, change; matra-sparsha: contact of the senses.'],
    ['2.20', 'The Self is never born and never dies. It is unborn, eternal, and enduring; it is not destroyed when the body is destroyed.', 'na jayate mriyate va kadachin', 'Atman: Self; nitya: eternal; aja: unborn.'],
    ['2.47', 'You have a right to action, but never to its fruits. Let not the fruits of action be your motive, nor let your attachment be to inaction.', 'karmany evadhikaras te ma phaleshu kadachana\nma karma-phala-hetur bhur ma te sango stv akarmani', 'Karma: action; phala: fruit or result; adhikara: right; akarma: inaction.'],
    ['2.48', 'Established in yoga, perform your actions, giving up attachment and remaining even-minded in success and failure. Such equanimity is called yoga.', 'yoga-sthah kuru karmani sangam tyaktva dhananjaya', 'Yoga: union; samatva: equanimity; sanga: attachment.'],
    ['2.50', 'One established in wisdom lets go of both good and bad results in this life. Therefore devote yourself to yoga; yoga is skill in action.', 'yogah karmasu kaushalam', 'Buddhi: wisdom; kaushala: skill; karma: action.'],
    ['2.62', 'Dwelling on the objects of the senses brings attachment. Attachment gives rise to desire, and from desire arises anger.', 'dhyayato vishayan pumsah sangas teshupajayate', 'Sanga: attachment; kama: desire; krodha: anger.'],
    ['2.63', 'From anger comes confusion; from confusion, the loss of memory; from the loss of memory, the ruin of discernment; and with discernment lost, one falls.', 'krodhad bhavati sammohah', 'Krodha: anger; sammoha: confusion; buddhi: discernment.'],
    ['2.70', 'As waters enter the ocean, which remains full and still, so one into whom desires enter without disturbance finds peace, not one who chases desires.', 'apuryamanam achala-pratishtham', 'Shanti: peace; kama: desire; samudra: ocean.'],
    ['3.8', 'Perform your necessary action, for action is better than inaction. Even the maintenance of the body would not be possible without action.', 'niyatam kuru karma tvam', 'Niyata karma: necessary action; akarma: inaction.'],
    ['3.19', 'Therefore, without attachment, always perform the work that ought to be done; through action without attachment, one attains the highest.', 'tasmad asaktah satatam karyam karma samachara', 'Asakta: without attachment; karya: duty; karma: action.'],
    ['3.35', 'Better is your own duty, though imperfectly performed, than the duty of another well performed. Another person\'s duty carries its own danger.', 'shreyan sva-dharmo vigunah para-dharmat sv-anushthitat', 'Svadharma: one\'s own duty; paradharma: another\'s duty.'],
    ['4.38', 'In this world there is nothing so purifying as knowledge. One perfected in yoga discovers this wisdom within, in time.', 'na hi jnanena sadrisham pavitram iha vidyate', 'Jnana: knowledge; pavitra: purifying.'],
    ['4.39', 'One who has faith, is devoted to knowledge, and has mastered the senses gains wisdom. Having gained wisdom, one soon finds supreme peace.', 'shraddhavan labhate jnanam', 'Shraddha: faith; jnana: wisdom; shanti: peace.'],
    ['5.10', 'One who offers actions to the Eternal, abandoning attachment, is not stained by wrongdoing, as a lotus leaf is untouched by water.', 'brahmany adhaya karmani sangam tyaktva karoti yah', 'Brahman: the Eternal; sanga: attachment; padma: lotus.'],
    ['5.18', 'The wise look with an equal eye upon a learned and humble person, a cow, an elephant, a dog, and one considered an outcast.', 'vidya-vinaya-sampanne brahmane gavi hastini', 'Sama-darshana: equal vision; vidya: learning; vinaya: humility.'],
    ['6.5', 'Let a person lift themselves by themselves, and not let themselves sink. For the self alone is one\'s friend, and the self alone is one\'s enemy.', 'uddhared atmanatmanam natmanam avasadayet', 'Atman: self; bandhu: friend; ripu: enemy.'],
    ['6.6', 'For one who has mastered the self, the self is a friend; for one who has not, the self acts as an enemy.', 'bandhur atmatmanas tasya yenatmaivatmana jitah', 'Atman: self; bandhu: friend; jita: mastered.'],
    ['6.17', 'For one who is balanced in food and recreation, balanced in work, and balanced in sleep and waking, yoga becomes the destroyer of sorrow.', 'yuktahara-viharasya yukta-cheshtasya karmasu', 'Yukta: balanced; ahara: food; vihara: recreation; duhkha: sorrow.'],
    ['6.26', 'Wherever the restless, unsteady mind wanders, gently bring it back from there and place it under the guidance of the Self.', 'yato yato nishcharati manash chanchalam asthiram', 'Manas: mind; chanchala: restless; asthira: unsteady.'],
    ['6.35', 'Without doubt, the mind is restless and difficult to restrain. Yet through practice and detachment, it can be trained.', 'abhyasena tu kaunteya vairagyena cha grihyate', 'Abhyasa: practice; vairagya: detachment; manas: mind.'],
    ['9.26', 'Whoever offers Me a leaf, a flower, a fruit, or water with devotion, that loving offering from a pure heart I accept.', 'patram pushpam phalam toyam yo me bhaktya prayachchhati', 'Bhakti: devotion; patra: leaf; pushpa: flower.'],
    ['12.13', 'One who bears no hatred toward any being, who is friendly and compassionate, free from possessiveness and ego, even in pleasure and pain, and forgiving...', 'adveshta sarva-bhutanam maitrah karuna eva cha', 'Maitra: friendly; karuna: compassionate; kshami: forgiving.'],
    ['12.14', '...ever content, steady in yoga, self-controlled, firm in resolve, with mind and understanding dedicated to Me: such a devotee is dear to Me.', 'santushtah satatam yogi yatatma dridha-nishchayah', 'Santushta: content; nishchaya: resolve; bhakti: devotion.'],
    ['12.15', 'One by whom the world is not disturbed, and who is not disturbed by the world, free from elation, envy, fear, and agitation, is dear to Me.', 'yasman nodvijate loko lokan nodvijate cha yah', 'Bhaya: fear; udvega: agitation; loka: world.'],
    ['14.17', 'From sattva arises knowledge; from rajas, greed; and from tamas arise carelessness, delusion, and ignorance.', 'sattvat sanjayate jnanam', 'Guna, gunas: the three qualities of nature; sattva: clarity; rajas: activity; tamas: inertia; jnana: knowledge.'],
    ['16.21', 'Desire, anger, and greed are the three gates that lead to the ruin of the self; therefore, one should abandon these three.', 'kama krodhas tatha lobhas', 'Kama: desire; krodha: anger; lobha: greed.'],
    ['17.15', 'Speech that causes no distress, that is truthful, pleasant, and beneficial, together with regular study of sacred wisdom, is called the discipline of speech.', 'anudvega-karam vakyam satyam priya-hitam cha yat', 'Satya: truth; priya: pleasant; hita: beneficial; vak: speech.'],
    ['18.46', 'By honoring, through one\'s own work, the source from which all beings arise and by which all this is pervaded, a person finds fulfillment.', 'sva-karmana tam abhyarchya siddhim vindati manavah', 'Sva-karma: one\'s own work; siddhi: fulfillment.'],
    ['18.63', 'Thus I have shared with you wisdom more profound than all secrets. Reflect on it fully, and then act as you choose.', 'vimrishyaitad asheshena yathechchhasi tatha kuru', 'Vimrishya: reflecting; yathechchhasi: as you choose.'],
    ['18.66', 'Let go of all other supports and take refuge in Me alone. I shall free you from all wrongdoing; do not grieve.', 'sarva-dharman parityajya mam ekam sharanam vraja', 'Sharana: refuge; shucha: grief; moksha: liberation.']
];

const SEED_VERSES = SEED_ROWS.map(([id, english, transliteration, meanings, telugu, sanskrit_te]) => ({
    id, chapter: Number(id.split('.')[0]), verse: Number(id.split('.')[1]),
    english, transliteration, meanings, telugu, sanskrit_te, sanskrit: '',
    source: 'Gita AI plain-language rendering',
    themes: Object.keys(THEMES).filter(key => THEMES[key].anchors.includes(id))
}));
const seedById = Object.fromEntries(SEED_VERSES.map(v => [v.id, v]));
const GLOSSARY = { karma: 'action', karmani: 'actions', phala: 'fruit or result', dharma: 'duty or sustaining order', yoga: 'yoga or disciplined union', yukta: 'balanced or joined', jnana: 'knowledge', vijnana: 'realization', buddhi: 'understanding or discernment', manas: 'mind', mano: 'mind', atma: 'self', atman: 'self', brahma: 'the Eternal', sattva: 'clarity or harmony', rajas: 'activity or passion', tamas: 'inertia or darkness', kama: 'desire', krodha: 'anger', lobha: 'greed', shanti: 'peace', santi: 'peace', sukha: 'happiness or ease', duhkha: 'sorrow or suffering', bhakti: 'devotion', bhakta: 'devotee', shraddha: 'faith', sraddha: 'faith', sanga: 'attachment', tyaga: 'renunciation', tyaktva: 'having let go', abhyasa: 'practice', vairagya: 'detachment', karuna: 'compassion', maitra: 'friendliness', satya: 'truth', nitya: 'eternal or constant', moksha: 'liberation', moksa: 'liberation', prakriti: 'nature', prakrti: 'nature', purusha: 'spirit or person', purusa: 'spirit or person', indriya: 'sense faculty' };

function sanskritMeanings(id, transliteration) { if (seedById[id]?.meanings) return seedById[id].meanings; const words = String(transliteration).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z]+/g) || []; return Object.entries(GLOSSARY).filter(([root]) => words.some(w => w.startsWith(root))).map(([root, meaning]) => `${root}: ${meaning}`).join('; '); }

function freshState() {
    return {
        version: 1,
        settings: { name: '', apiUrl: 'http://localhost:8000', connected: false, provider: 'gemini', preferredProvider: 'gemini', country: 'global', language: 'en', theme: 'system' },
        chats: [],
        journals: [],
        bookmarks: [],
        readVerses: []
    };
}

let storageError = false, recoveryNotice = false;
const animatedRoutes = new Set();

function validState(value) {
    return value && value.version === 1 && Array.isArray(value.chats) && Array.isArray(value.journals) && Array.isArray(value.bookmarks) && Array.isArray(value.readVerses) && value.settings && typeof value.settings === 'object';
}

let state;

let raw = null;
try {
    raw = localStorage.getItem(STORE_KEY);
    state = raw ? JSON.parse(raw) : freshState();
    if (!validState(state)) throw new Error('Invalid saved data');
    if (raw) validateImport(state);
    state.settings = { ...freshState().settings, ...state.settings };
    if (!['light', 'dark', 'system'].includes(state.settings.theme)) state.settings.theme = 'system';
    state.readVerses = state.readVerses || [];
    if (typeof state.settings.name !== 'string' || typeof state.settings.apiUrl !== 'string') throw new Error('Invalid preferences');
}
catch (error) {
    if (raw) { try { localStorage.setItem(`${STORE_KEY}.backup-${Date.now()}`, raw); } catch (_) { } }
    state = freshState(); storageError = true; recoveryNotice = true;
}

function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageError = false; $('#storage-warning').hidden = true; return true; }
    catch (error) { storageError = true; $('#storage-warning').hidden = false; toast('Browser storage is unavailable or full. Export your data to keep it safe.'); return false; }
}

let corpus = [...SEED_VERSES], corpusLoading = false, corpusPromise = null, corpusError = false;

try { localStorage.removeItem('gita.corpus.v2'); } catch (_) { }

try {
    const cached = JSON.parse(localStorage.getItem(CORPUS_KEY) || 'null');
    if (cached && validateCorpus(cached)) corpus = cached;
}
catch (error) { }

let verseById = Object.fromEntries(corpus.map(v => [v.id, v]));
let route = 'overview', currentChatId = null, activeTheme = null, libraryPage = 1, libraryChapter = '', libraryQuery = '', journalQuery = '', journalMood = '', savedQuery = '';
let busyChats = new Set(), journalDraftMood = 'Peaceful', connectionStatus = '', lastFocus = null, confirmCallback = null, dataEpoch = 0;
const pendingRequests = new Map();

let cooldownUntil = Number(sessionStorage.getItem('gita_cooldown') || 0);
const COOLDOWN_SECONDS = 5;
let cooldownTimer = null;
let aiPending = false;
let pendingGuard = null;
const LIGHT_THEME_COLOR = '#fbfaf7';
const DARK_THEME_COLOR = '#121212';
const systemThemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function getThemePreference() {
    return ['light', 'dark', 'system'].includes(state?.settings?.theme) ? state.settings.theme : 'system';
}

function resolveTheme(theme = getThemePreference()) {
    if (theme === 'dark' || theme === 'light') return theme;
    return systemThemeQuery?.matches ? 'dark' : 'light';
}

function applyTheme() {
    const resolved = resolveTheme();
    document.documentElement.setAttribute('data-theme', resolved);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', resolved === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }
}

function syncThemeToggle() {
    const button = $('#theme-toggle');
    if (!button) return;
    const resolved = resolveTheme();
    const isDark = resolved === 'dark';
    button.classList.toggle('is-dark', isDark);
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    button.innerHTML = `${icon(isDark ? 'sun' : 'theme')}<span class="theme-label">${isDark ? 'Light' : 'Dark'}</span>`;
}

function isLocked() {
    return aiPending || Date.now() < cooldownUntil;
}

function beginAiRequest() {
    aiPending = true;
    clearTimeout(pendingGuard);
    pendingGuard = setTimeout(() => {
        if (aiPending) startCooldown();
    }, 90000);
    updateCooldownUI();
}

if (cooldownUntil > Date.now()) {
    cooldownTimer = setInterval(updateCooldownUI, 1000);
}

function startCooldown() {
    aiPending = false;
    clearTimeout(pendingGuard);
    cooldownUntil = Date.now() + (COOLDOWN_SECONDS * 1000);
    sessionStorage.setItem('gita_cooldown', String(cooldownUntil));
    updateCooldownUI();
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(updateCooldownUI, 1000);
}

function updateCooldownUI() {
    const now = Date.now();
    const remaining = Math.ceil((cooldownUntil - now) / 1000);
    const isCoolingDown = aiPending || remaining > 0;
    const composers = $$('.chat-composer, .quick-chat');
    const sendButtons = $$('.chat-composer .send-button, .quick-chat .send-button');
    const micButton = $('#mic-button');
    const reflectButtons = $$('[data-action="study-verse"]');
    const promptRows = $$('.prompt-row');
    const chatFooter = $('#chat-footer-notice');
    const moodBtns = $$('[data-action="quick-mood"]');
    const langToggle = $('#lang-toggle');

    if (isCoolingDown) {
        if (window.voiceInput?.isRecording) {
            window.voiceInput.stop();
        }
        if (micButton) micButton.disabled = true;
        composers.forEach(c => c.classList.add('is-cooldown'));
        sendButtons.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = icon('lock');
        });
        reflectButtons.forEach(btn => {
            btn.disabled = true;
            btn.innerHTML = `${icon('lock')} Please wait...`;
        });
        promptRows.forEach(btn => btn.disabled = true);
        moodBtns.forEach(btn => btn.disabled = true);
        if (langToggle) langToggle.disabled = true;

        if (chatFooter) {
            chatFooter.classList.add('cooldown-text');
            chatFooter.innerHTML = aiPending
                ? `${icon('lock', 'sm')} Gita is thinking…`
                : `${icon('lock', 'sm')} Please wait ${remaining}s before sending another query.`;
        }
    } else {
        if (micButton) micButton.disabled = false;
        composers.forEach(c => c.classList.remove('is-cooldown'));
        sendButtons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = icon('arrow');
        });
        reflectButtons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = 'Ask AI' + icon('arrow');
        });
        promptRows.forEach(btn => btn.disabled = false);
        moodBtns.forEach(btn => btn.disabled = false);
        if (langToggle) langToggle.disabled = false;

        if (chatFooter) {
            chatFooter.classList.remove('cooldown-text');
            chatFooter.innerHTML = "AI can make mistakes. Use as a guide only.";
        }
        clearInterval(cooldownTimer);
    }
}

function getApiUrl() {
    if (typeof window !== 'undefined' && window.location && ['http:', 'https:'].includes(window.location.protocol)) {
        return window.location.origin;
    }
    if (state.settings.apiUrl && state.settings.apiUrl.trim()) {
        return state.settings.apiUrl.replace(/\/$/, '');
    }
    return 'http://localhost:8000';
}

function validateCorpus(data) {
    if (!Array.isArray(data) || data.length !== 701) return false;
    const ids = new Set();
    for (const v of data) { if (!v || !Number.isInteger(v.chapter) || !Number.isInteger(v.verse) || v.chapter < 1 || v.chapter > 18 || v.verse < 1 || v.verse > COUNTS[v.chapter - 1] || v.id !== `${v.chapter}.${v.verse}` || typeof v.english !== 'string' || !v.english.trim() || typeof v.sanskrit !== 'string' || !v.sanskrit.trim() || typeof v.transliteration !== 'string' || !Array.isArray(v.themes) || ids.has(v.id)) return false; ids.add(v.id); }
    return COUNTS.every((count, i) => data.filter(v => v.chapter === i + 1).length === count);
}

function parseCorpusSource(source) {
    const marker = source.indexOf('const GITA_VERSE_ROWS');
    const start = source.indexOf('[', marker);
    if (marker < 0 || start < 0) throw new Error('Unknown corpus format');
    let depth = 0, quoted = false, escaped = false, end = -1;
    for (let i = start; i < source.length; i++) { const c = source[i]; if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; } else if (c === '"') quoted = true; else if (c === '[') depth++; else if (c === ']' && --depth === 0) { end = i + 1; break; } }
    if (end < 0) throw new Error('Incomplete corpus');
    const rows = JSON.parse(source.slice(start, end));
    const data = rows.map(([chapter, verse, sanskrit, transliteration, english]) => { const id = `${chapter}.${verse}`; return { id, chapter, verse, sanskrit, transliteration, english, meanings: sanskritMeanings(id, transliteration), themes: Object.keys(THEMES).filter(k => THEMES[k].anchors.includes(id)), source: 'Annie Besant, The Bhagavad-Gita, 4th edition (1922). Public domain.' }; });
    if (!validateCorpus(data)) throw new Error('Corpus must contain 701 unique, complete verses');
    return data;
}

async function loadCorpus(notify = false, force = false) {
    if (!force && corpus.length === 701) return corpus;
    if (corpusPromise) return corpusPromise;
    corpusLoading = true; corpusError = false;
    corpusPromise = (async () => {
        try {
            let complete = null, fromBackend = false;
            const localUrls = [...(state.settings.connected ? [`${getApiUrl()}/api/verses`] : []), ...(['http:', 'https:'].includes(location.protocol) ? [`${location.origin}/api/verses`] : [])];
            for (const url of [...new Set(localUrls)]) {
                const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
                try {
                    const response = await fetch(url, { signal: controller.signal, credentials: 'omit', cache: 'no-store' });
                    if (response.ok) {
                        const data = await response.json();
                        if (validateCorpus(data)) { complete = data; fromBackend = true; break; }
                        console.warn('Backend corpus failed validation:', url);
                    }
                } catch (error) { } finally { clearTimeout(timer); }
            }
            if (!complete && force && corpus.length === 701) return corpus;
            if (!complete) {
                const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
                try { const response = await fetch(CORPUS_URL, { signal: controller.signal, cache: 'force-cache', credentials: 'omit' }); if (!response.ok) throw new Error('Corpus unavailable'); complete = parseCorpusSource(await response.text()); }
                finally { clearTimeout(timer); }
            }
            corpus = complete;
            verseById = Object.fromEntries(corpus.map(v => [v.id, v]));
            if (!fromBackend) {
                try { localStorage.setItem(CORPUS_KEY, JSON.stringify(corpus)); } catch (error) { if (notify) toast('All 701 verses are loaded for this visit. Storage is full; they could not be cached.'); }
            }
            if (notify) toast('All 701 verses are ready to explore.');
            return corpus;
        } catch (error) { corpusError = true; if (notify) toast('The full library could not be reached. Your 30 offline verses are still available.'); throw error; }
        finally {
            corpusLoading = false;
            corpusPromise = null;
            if (route === 'library') renderLibraryResults(); if (route === 'overview') renderOverview();
        }

    })();
    return corpusPromise;
}

function dateLabel(value) {
    const d = new Date(value), now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString())
        return 'Yesterday';
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
}

function localDay() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function moodFace(mood) {
    const mouths = { Peaceful: 'M10 19q6 5 12 0', Grateful: 'M10 18q6 8 12 0Z', Uncertain: 'M11 21q4-3 10-1', Anxious: 'M11 21q5-5 10 0', Low: 'M11 22q5-5 10 0' };
    const eyes = mood === 'Peaceful' ? '<path d="M9 13q2 3 4 0m6 0q2 3 4 0"/>' : mood === 'Low' ? '<path d="m9 14 4 1m6 0 4-1"/>' : '<path d="M11 13v1m10-1v1"/>';
    return `<svg viewBox="0 0 32 32" class="mood-face" aria-hidden="true"><circle cx="16" cy="16" r="13.5"/>${eyes}<path d="${mouths[mood]}" fill="none" stroke-linecap="round"/>${mood === 'Anxious' ? '<path d="m9 9 4 1m6 0 4-1"/>' : ''}</svg>`;
}
function moodButtons(selected, action = 'checkin') { return MOODS.map(m => `<button type="button" class="mood-button ${selected === m ? 'selected' : ''}" data-action="${action}" data-mood="${m}" aria-pressed="${selected === m}">${moodFace(m)}<span>${m}</span></button>`).join(''); }

function moodTag(mood) { return `<span class="mood-tag ${attr(String(mood).toLowerCase())}">${escapeHTML(mood)}</span>`; }

let routeJustChanged = true;
function pageHeading(eyebrow, title, description, action = '') {
    const animClass = (!routeJustChanged || window.isLangSwitch || window.isSoftNavigate) ? '' : 'reveal';
    return `<div class="page-heading ${animClass}"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</div>${action}</div>`;
}

function setPage(html, cls = '') { $('#main').className = `page ${cls}`; $('#main').innerHTML = html; }

function renderOverview() {
    const entries = [...state.journals].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 2);

    const dayIndex = Math.floor(Date.now() / 86400000);
    const activeVerse = corpus[dayIndex % corpus.length];
    const isSaved = state.bookmarks.some(b => b.id === activeVerse.id);

    const userName = state.settings?.name?.trim();
    const enGreeting = userName ? `Welcome, ${escapeHTML(userName)}` : `Welcome <span class="welcome-lotus">${lotus}</span>`;
    const teGreeting = userName ? `నమస్తే, ${escapeHTML(userName)}` : `నమస్తే <span class="welcome-lotus">${lotus}</span>`;
    const greetingText = animatedTitle(enGreeting, teGreeting, userName ? `నమస్తే, ${userName}` : 'నమస్తే');

    const moodsTe = { 'Peaceful': 'ప్రశాంతం', 'Grateful': 'కృతజ్ఞత', 'Uncertain': 'సందిగ్ధం', 'Anxious': 'ఆందోళన', 'Low': 'నిరాశ' };
    const prompt1 = state.settings.language === 'te' ? "నేను ఎక్కువగా ఆలోచిస్తున్నాను, మనశ్శాంతిని ఎలా పొందాలి?" : "I've been overthinking things. How can I find some calm?";
    const prompt2 = state.settings.language === 'te' ? "నేను ఫలితంపై ఆశను ఎలా వదులుకోవాలి?" : "How do I let go of expectations?";
    const prompt3 = state.settings.language === 'te' ? "నా రోజువారీ పనులలో అర్థాన్ని ఎలా కనుగొనాలి?" : "I want to find more meaning in what I do every day.";

    setPage(`
        <div class="welcome-section reveal">
        <h1>${greetingText}</h1>
    </div>
    <div class="overview-bottom" style="margin-top: 0; margin-bottom: 28px;">
        <section class="daily-wisdom reveal delay-1" aria-label="Today's wisdom" style="aspect-ratio: auto; max-width: none; margin: 0; border-radius: 8px; height: 100%; min-height: 220px;">
            <img class="banner" src="gita-banner.jpg" alt="Wisdom banner background" fetchpriority="high">
            <div class="verse-content" style="height: 100%; display: flex; flex-direction: column; justify-content: center;">
                <blockquote>&ldquo;${escapeHTML(state.settings.language === 'te' && activeVerse.telugu ? activeVerse.telugu : activeVerse.english)}&rdquo;</blockquote>
                <div class="verse-citation"><span class="separator"></span>${state.settings.language === 'te' ? `భగవద్గీత ${activeVerse.id}` : `Bhagavad Gita ${activeVerse.id}`}</div>
            </div>
            
            <button type="button" class="banner-save-btn ${isSaved ? 'saved' : ''}" data-action="bookmark" data-id="${activeVerse.id}" aria-label="Save verse">
                ${icon('bookmark')}
            </button>
        </section>

        <section class="chat-invitation reveal delay-1" style="display: flex; flex-direction: column; margin: 0;">
            <div class="invitation-heading" style="margin-bottom: 15px;">${icon('sparkle')} ${state.settings.language === 'te' ? 'ప్రస్తుతం మీ మనస్సు ఎలా ఉంది?' : 'How are you feeling right now?'}</div>
            <div class="mood-options" id="dashboard-moods" style="flex-wrap: wrap; gap: 8px; margin-bottom: 15px;">
                ${MOODS.map(m => `
                    <button type="button" class="mood-button" data-action="quick-mood" data-mood="${m}" style="flex: 1; min-width: 60px; background: var(--surface-soft); border: 1px solid var(--line-soft); padding: 10px 5px; border-radius: 8px;">
                        ${moodFace(m)}<span>${state.settings.language === 'te' ? moodsTe[m] : m}</span>
                    </button>
                `).join('')}
            </div>
            <div id="mood-reveal-area" style="flex: 1; display: flex; flex-direction: column; justify-content: center; transition: all 0.3s ease;">
                <p style="font-size: 10px; color: var(--muted-soft); text-align: center; line-height: 1.8; margin: 0;">${state.settings.language === 'te' ? 'ఒక భావాన్ని ఎంచుకుని దానికి తగిన శ్లోకాన్ని పొందండి.' : 'Select a feeling to reveal a<br>verse chosen for this moment.'}</p>
            </div>
        </section>
    </div>
    
    <div class="overview-bottom reveal delay-2">
        <section style="display: flex; flex-direction: column;">
            <div class="section-head">
                <h2>${state.settings.language === 'te' ? 'మీ మనస్సులోని మాటల కోసం ఒక వేదిక' : "A space for what's on your mind"}</h2>
            </div>
            <div class="chat-invitation" style="flex: 1;">
                <div class="invitation-heading">${icon('sparkle')} ${state.settings.language === 'te' ? 'మీ ప్రశ్నను లేదా ఆందోళనను ఇక్కడ పంచుకోండి.' : 'Bring a question, a worry, or simply yourself.'}</div>
                <form class="quick-chat" id="quick-chat-form">
                    <label class="sr-only" for="quick-question">What is on your mind?</label>
                    <input id="quick-question" name="question" maxlength="4000" placeholder="${state.settings.language === 'te' ? 'మీ మనస్సులో ఏముంది?' : "What's been on your mind?"}" autocomplete="off" required>
                    <button class="send-button" aria-label="Ask Gita">${icon('arrow')}</button>
                </form>
                <button class="prompt-row" data-action="prompt" data-prompt="${attr(prompt1)}">${escapeHTML(prompt1)} ${icon('arrow')}</button>
                <button class="prompt-row" data-action="prompt" data-prompt="${attr(prompt2)}">${escapeHTML(prompt2)} ${icon('arrow')}</button>
                <button class="prompt-row" data-action="prompt" data-prompt="${attr(prompt3)}">${escapeHTML(prompt3)} ${icon('arrow')}</button>
            </div>
        </section>

        <section style="display: flex; flex-direction: column;">
            <div class="section-head">
                <h2>${state.settings.language === 'te' ? 'మీ కోసం చిన్న గమనికలు' : 'Little notes to yourself'}</h2>
                <button class="text-link" data-action="navigate" data-page="journal">${state.settings.language === 'te' ? 'జర్నల్ తెరవండి' : 'Open Journal'} ${icon('arrow')}</button>
            </div>
            <div class="chat-invitation" style="flex: 1; display: flex; flex-direction: column;">
                <div style="flex: 1;">
                    ${entries.length ? entries.map(j => `<button class="reflection-row" data-action="edit-journal" data-id="${attr(j.id)}"><div class="reflection-meta"><span>${dateLabel(j.createdAt)}</span><span style="opacity:.4">&middot;</span>${moodTag(j.mood)}${j.example ? '<span class="starter-label">INSPIRATION</span>' : ''}</div><h3>${escapeHTML(j.title)}</h3><p>${escapeHTML(j.body)}</p></button>`).join('') : `<div class="empty-state" style="padding:15px 0">${icon('journal')}<h2 style="font-size:22px">${state.settings.language === 'te' ? 'ఒక గమనిక రాయండి' : 'Write a Note'}</h2><p>${state.settings.language === 'te' ? 'రాసిపెట్టుకున్నప్పుడు విషయాలు మరింత స్పష్టమవుతాయి.' : 'Things become clearer when you write them down.'}</p></div>`}
                </div>
                <div class="journal-prompt" style="justify-content: flex-end; padding: 0; margin-top: auto;">
                    <button class="text-link" data-action="new-journal">${state.settings.language === 'te' ? 'మీ ఆలోచనను రాయండి' : 'Write a reflection'} ${icon('plus')}</button>
                </div>
            </div>
        </section>
    </div>`);

    updateCooldownUI();
}

function renderJournal() {
    setPage(`${pageHeading('', 'My Journal', '', '')}<div class="toolbar"><label class="search-field">${icon('search')}<input id="journal-search" type="search" placeholder="Find a reflection..." value="${attr(journalQuery)}" aria-label="Search reflections"></label><button class="btn btn-primary journal-add-btn" data-action="new-journal">${icon('plus')}<span>New reflection</span></button></div><div id="journal-results"></div>`);
    renderJournalResults();
}

function renderJournalResults() {
    const query = journalQuery.trim().toLowerCase().normalize('NFC');

    const entries = [...state.journals]
        .filter(j => {
            if (journalMood && j.mood !== journalMood) return false;
            const searchPool = `${j.title} ${j.body}`.toLowerCase().normalize('NFC');
            return searchPool.includes(query);
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const emptyTitle = (journalQuery || journalMood)
        ? (state.settings.language === 'te' ? 'ఏ గమనికలు కనిపించలేదు.' : 'No reflections found.')
        : 'This page is yours.';

    $('#journal-results').innerHTML = entries.length
        ? `<div class="journal-list">${entries.map(j => {
            const d = new Date(j.createdAt);
            return `<article class="journal-item"><div class="journal-date"><strong>${d.getDate()}</strong><span>${d.toLocaleDateString('en-US', { month: 'short' })}</span></div><div class="journal-body"><div>${moodTag(j.mood)}${j.example ? '<span class="starter-label">STARTER REFLECTION</span>' : ''}</div><h3>${escapeHTML(j.title)}</h3><p>${escapeHTML(j.body)}</p></div><div class="item-actions"><button class="icon-button" data-action="edit-journal" data-id="${attr(j.id)}" aria-label="Edit ${attr(j.title)}">${icon('edit')}</button><button class="icon-button" data-action="delete-journal" data-id="${attr(j.id)}" aria-label="Delete ${attr(j.title)}">${icon('trash')}</button></div></article>`;
        }).join('')}</div>`
        : emptyState('journal', emptyTitle, '');
}

function emptyState(symbol, title, text, action = '') { return `<div class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${text}</p>${action}</div>`; }

function verseItem(v, bookmark = null) {
    const saved = state.bookmarks.some(b => b.id === v.id);
    const isRead = state.readVerses.includes(v.id);

    return `<article class="verse-item"><button class="verse-number" data-action="verse" data-id="${v.id}" aria-label="Read Bhagavad Gita ${v.id}">${v.id}</button><div class="verse-body"><button class="verse-english" data-action="verse" data-id="${v.id}" style="text-align:left">${escapeHTML(state.settings.language === 'te' && v.telugu ? v.telugu : v.english)}</button><div class="verse-subline">${state.settings.language === 'te' ? `అధ్యాయం ${v.chapter}` : `Chapter ${v.chapter}`} &middot; ${state.settings.language === 'te' ? CHAPTERS_TE[v.chapter - 1] : CHAPTERS[v.chapter - 1]}${v.themes.length ? ` &middot; ${escapeHTML(state.settings.language === 'te' && THEMES[v.themes[0]]?.name_te ? THEMES[v.themes[0]].name_te : (THEMES[v.themes[0]]?.name || ''))}` : ''}${state.settings.language === 'te' && v.telugu_range ? ` &middot; శ్లోకాలు ${escapeHTML(v.telugu_range.replace('-', '–'))} కలిపి` : ''}</div>${bookmark?.note ? `<p class="verse-note">${escapeHTML(bookmark.note)}</p>` : ''}${bookmark ? `<button class="text-link" style="font-size:9px;margin-top:9px" data-action="bookmark-note" data-id="${v.id}">${icon('edit')}${bookmark.note ? 'Edit your note' : 'Add a note'}</button>` : ''}</div><div class="item-actions"><button class="icon-button read-btn ${isRead ? 'read' : ''}" data-action="toggle-read" data-id="${v.id}" aria-label="${isRead ? 'Mark as unread' : 'Mark as read'}" aria-pressed="${isRead}">${icon('check-box')}</button><button class="icon-button ${saved ? 'saved' : ''}" data-action="bookmark" data-id="${v.id}" aria-label="${saved ? 'Remove saved' : 'Save'} verse ${v.id}" aria-pressed="${saved}">${icon('bookmark')}</button></div></article>`;
}

function renderSaved() {
    setPage(`${pageHeading('', 'Saved verses', '', '')}<div class="toolbar"><label class="search-field">${icon('search')}<input id="saved-search" type="search" placeholder="Search your saved verses..." value="${attr(savedQuery)}" aria-label="Search saved verses"></label><button class="btn btn-secondary saved-explore-btn" data-action="navigate" data-page="library">${icon('book')}<span>Explore verses</span></button></div><div id="saved-results"></div>`);
    renderSavedResults();
}

function renderSavedResults() {
    const query = savedQuery.trim().toLowerCase().normalize('NFC');

    const matches = state.bookmarks.map(b => ({ b, v: verseById[b.id] || seedById[b.id] }))
        .filter(({ b, v }) => {
            if (!v) return false;
            const searchPool = `${v.id} ${v.english} ${v.telugu || ''} ${v.sanskrit_te || ''} ${v.transliteration || ''} ${v.meanings || ''} ${b.note}`.toLowerCase().normalize('NFC');
            return searchPool.includes(query);
        });

    const emptyTitle = savedQuery
        ? (state.settings.language === 'te' ? 'ఏ శ్లోకాలు కనిపించలేదు.' : 'No matching verses.')
        : 'Some words are worth keeping.';
    const emptySub = savedQuery
        ? ''
        : 'Save a verse as you read or chat.';

    $('#saved-results').innerHTML = matches.length
        ? `<div class="verse-list">${matches.map(({ b, v }) => verseItem(v, b)).join('')}</div>`
        : emptyState('bookmark', emptyTitle, emptySub, '');
}

function renderLibrary() {
    const activeLabel = libraryChapter
        ? `${libraryChapter}.&nbsp;&nbsp;&nbsp;${state.settings.language === 'te' ? CHAPTERS_TE[Number(libraryChapter) - 1] : CHAPTERS[Number(libraryChapter) - 1]}`
        : (state.settings.language === 'te' ? 'అన్ని అధ్యాయాలు' : 'All chapters');

    const titleHtml = animatedTitle('Bhagavad Gita', 'భగవద్గీత', 'భగవద్గీత');

    setPage(`
        ${pageHeading('', titleHtml, '')}
        <div id="library-status"></div>
        <div class="toolbar library-toolbar">
            <label class="search-field">
                ${icon('search')}
                <input id="library-search" type="search" placeholder="${state.settings.language === 'te' ? 'శ్లోకాన్ని వెతకండి' : 'Search a verse'}" value="${attr(libraryQuery)}" aria-label="${state.settings.language === 'te' ? 'భగవద్గీతలో శోధించండి' : 'Search the Bhagavad Gita'}">
            </label>
            <div class="custom-dropdown" id="chapter-dropdown">
                <button type="button" class="dropdown-trigger" data-action="toggle-chapter-menu" aria-haspopup="listbox" aria-expanded="false">
                    <span class="dropdown-trigger-text">${activeLabel}</span>
                    <svg class="dropdown-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="dropdown-menu" id="chapter-menu" role="listbox">
                    <button type="button" class="dropdown-option ${!libraryChapter ? 'selected' : ''}" data-action="select-chapter" data-value="">${state.settings.language === 'te' ? 'అన్ని అధ్యాయాలు' : 'All chapters'}</button>
                    ${CHAPTERS.map((c, i) => `
                        <button type="button" class="dropdown-option ${libraryChapter === String(i + 1) ? 'selected' : ''}" data-action="select-chapter" data-value="${i + 1}">
                            <span style="display:inline-block; width:22px;">${i + 1}.</span>${escapeHTML(state.settings.language === 'te' ? CHAPTERS_TE[i] : c)}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
        <div id="library-results"></div>
    `);
    renderLibraryResults();
}

function renderLibraryResults() {
    if (!$('#library-results')) return;
    $('#library-status').innerHTML = corpus.length === 701 ? '' : `<div class="library-top"><p class="library-source"><strong>${corpus.length} essential verses ready offline</strong><br>${corpusError ? 'The full text is unavailable right now. Your starter collection is still here.' : 'Plain-language renderings. The full public-domain collection is one click away.'}</p><button class="btn btn-secondary" data-action="load-corpus" ${corpusLoading ? 'disabled' : ''}>${icon(corpusLoading ? 'refresh' : 'download')}${corpusLoading ? 'Loading the full text...' : corpusError ? 'Retry full collection' : 'Load all verses'}</button></div>`;

    const q = libraryQuery.trim().toLowerCase().normalize('NFC').replace(/^bg\s*/, '');
    const exact = /^\d{1,2}\.\d{1,2}$/.test(q);

    const matches = corpus.filter(v => {
        if (libraryChapter && v.chapter !== Number(libraryChapter)) return false;
        if (exact) return v.id === q;
        if (!q) return true;
        const searchPool = `${v.id} ${v.english} ${v.telugu || ''} ${v.sanskrit_te || ''} ${v.sanskrit || ''} ${v.transliteration || ''} ${v.meanings || ''}`.toLowerCase().normalize('NFC');
        return searchPool.includes(q);
    });

    const per = 14, pages = Math.max(1, Math.ceil(matches.length / per)); libraryPage = Math.min(libraryPage, pages);
    $('#library-results').innerHTML = matches.length
        ? `<div class="verse-list">${matches.slice((libraryPage - 1) * per, libraryPage * per).map(v => verseItem(v)).join('')}</div><div class="pagination"><button class="btn btn-secondary" data-action="library-page" data-direction="-1" ${libraryPage === 1 ? 'disabled' : ''}>${icon('back')}${state.settings.language === 'te' ? 'వెనుకకు' : 'Previous'}</button><span>${libraryPage} ${state.settings.language === 'te' ? '/' : 'of'} ${pages}</span><button class="btn btn-secondary" data-action="library-page" data-direction="1" ${libraryPage === pages ? 'disabled' : ''}>${state.settings.language === 'te' ? 'ముందుకు' : 'Next'} ${icon('arrow')}</button></div>`
        : emptyState('search', state.settings.language === 'te' ? 'ఏ శ్లోకాలు కనిపించలేదు.' : 'No verses found.', state.settings.language === 'te' ? 'వేరొక సరళమైన పదం, మరొక అధ్యాయం లేదా 2.47 వంటి శ్లోక సంఖ్యతో ప్రయత్నించండి.' : 'Try a simpler word, a different chapter, or a reference such as 2.47.');
}

function renderThemes() {
    if (activeTheme && THEMES[activeTheme]) {
        const t = THEMES[activeTheme];
        const titleHtml = animatedTitle(t.title, t.title_te || t.title, t.title_te || t.title);

        setPage(`<button class="back-button" data-action="all-themes">${icon('back')}${state.settings.language === 'te' ? 'అన్ని అంశాలు' : 'All themes'}</button>${pageHeading('', titleHtml, '')}<p class="theme-intro">${escapeHTML(state.settings.language === 'te' && t.explanation_te ? t.explanation_te : t.explanation)}</p><div class="section-head"><h2>${state.settings.language === 'te' ? 'కొన్ని ముఖ్యమైన శ్లోకాలు' : 'A few verses to check'}</h2></div><div class="verse-list">${t.anchors.map(id => verseById[id] || seedById[id]).filter(Boolean).map(v => verseItem(v)).join('')}</div>`);
        return;
    }

    const mainTitleHtml = animatedTitle('Wisdom by theme', 'థీమ్ ద్వారా జ్ఞానం', 'థీమ్ ద్వారా జ్ఞానం');

    setPage(`${pageHeading('', mainTitleHtml, '')}<div class="themes-grid">${Object.entries(THEMES).map(([k, t]) => `<button class="theme-link" data-action="theme" data-id="${k}"><span class="theme-symbol">${icon(t.icon)}</span><div><h3>${escapeHTML(state.settings.language === 'te' && t.title_te ? t.title_te : t.title)}</h3><p>${escapeHTML(state.settings.language === 'te' && t.description_te ? t.description_te : t.description)}</p><small>${t.anchors.length} ${state.settings.language === 'te' ? 'శ్లోకాలు' : 'verses to explore'}</small></div>${icon('arrow', 'theme-arrow')}</button>`).join('')}</div>`);
}

function renderChat() {
    const current = state.chats.find(c => c.id === currentChatId);
    const titleHtml = animatedTitle('Gita Intelligence', 'గీతా ఏఐ', 'గీతా ఏఐ');
    const activeProv = ['gemini', 'groq'].includes(state.settings.provider)
    ? state.settings.provider
    : (['gemini', 'groq'].includes(state.settings.preferredProvider) ? state.settings.preferredProvider : 'gemini');
const currentProvider = activeProv.charAt(0).toUpperCase() + activeProv.slice(1);

    const chatActions = `
        <div class="chat-header-actions">
            <button type="button" class="ping-btn ${state.settings.connected ? 'connected' : ''}" data-action="ping-backend" title="Check connection" aria-label="Ping AI Backend">
                ${icon('reconnect', 'sm')}
            </button>
            
            <div class="provider-dropdown" id="provider-dropdown">
                <button type="button" class="provider-trigger" data-action="toggle-provider-menu" aria-expanded="false">
                    <span id="current-provider-name">${currentProvider}</span>
                    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="provider-menu" id="provider-menu">
                    <button type="button" class="dropdown-option ${currentProvider === 'Gemini' ? 'selected' : ''}" data-action="select-provider" data-value="gemini">Gemini</button>
                    <button type="button" class="dropdown-option ${currentProvider === 'Groq' ? 'selected' : ''}" data-action="select-provider" data-value="groq">Groq</button>
                </div>
            </div>
        </div>
    `;

    setPage(`${pageHeading('', titleHtml, '', chatActions)}<div class="chat-layout"><aside class="conversation-sidebar" aria-label="Your conversations"><button class="btn btn-secondary" data-action="new-chat">${icon('plus')}New conversation</button><p class="conversation-sidebar-label">YOUR CONVERSATIONS</p>${state.chats.length ? [...state.chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(c => `<div class="conversation-item ${currentChatId === c.id ? 'active' : ''}"><button data-action="open-chat" data-id="${attr(c.id)}" title="${attr(c.title)}">${escapeHTML(c.title)}</button><button class="icon-button" data-action="rename-chat" data-id="${attr(c.id)}" aria-label="Rename conversation">${icon('edit')}</button><button class="icon-button" data-action="delete-chat" data-id="${attr(c.id)}" aria-label="Delete conversation">${icon('trash')}</button></div>`).join('') : ''}</aside><section class="chat-main" aria-label="Chat"><div class="chat-messages" id="chat-messages" aria-live="polite">${current?.messages.length ? current.messages.map((m, i) => renderMessage(m, i)).join('') : `<div class="chat-welcome">${lotus}<h2>${state.settings.language === 'te' ? 'ఈ రోజు మీ మనస్సులో<br>ఏముంది?' : 'What is your heart<br>holding today?'}</h2></div>`}${busyChats.has(currentChatId) ? loadingResponse() : ''}
    </div><form class="chat-composer" id="chat-form">
    <label class="sr-only" for="chat-input">Your message to Gita</label>
    <textarea id="chat-input" name="message" rows="1" maxlength="4000" placeholder="${state.settings.language === 'te' ? 'మీ మనస్సులోని మాటను పంచుకోండి...' : "Share what's on your mind..."}" ${busyChats.has(currentChatId) ? 'disabled' : ''}></textarea>
    <div class="mic-btn-wrapper" id="mic-wrapper">
        <button type="button" class="mic-button" id="mic-button" data-action="toggle-mic" aria-label="Voice input" ${busyChats.has(currentChatId) ? 'disabled' : ''}>
            ${icon('mic')}
        </button>
    </div>
    
    <button class="send-button" type="submit" id="chat-send-btn" aria-label="Send message" ${busyChats.has(currentChatId) ? 'disabled' : ''}>${icon('arrow')}</button></form><div class="chat-footer-notice" id="chat-footer-notice">AI can make mistakes. Use as a guide only.</div>`, 'chat-page');
    if (!window.voiceInput?.supported) $('#mic-wrapper')?.remove();
    requestAnimationFrame(() => { const messages = $('#chat-messages'); if (messages && current?.messages.length) messages.scrollTop = messages.scrollHeight; });
    updateCooldownUI();
}

function loadingResponse() {
    return '<div class="loading-response" id="loading-response"><span class="loading-dots"><i></i><i></i><i></i></span>Finding a little wisdom for you...</div>';
}

function richText(text) {
    return escapeHTML(text).replace(/\[BG (\d{1,2}\.\d{1,2})\]/g, (match, id) => verseById[id] || seedById[id] ? `<button class="citation-button" data-action="verse" data-id="${id}">[BG ${id}]</button>` : match);
}

function inlineMd(text) {
    return richText(text)
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
}

function renderMarkdown(src) {
    const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
    const isBullet = l => /^\s*[-*•]\s+/.test(l), isNumber = l => /^\s*\d+[.)]\s+/.test(l);
    const isHeading = l => /^#{1,4}\s+/.test(l), isQuote = l => /^\s*>/.test(l);
    const out = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        if (isHeading(line)) { out.push(`<h4>${inlineMd(line.replace(/^#{1,4}\s+/, ''))}</h4>`); i++; continue; }
        if (isQuote(line)) {
            const buf = [];
            while (i < lines.length && isQuote(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
            out.push(`<blockquote>${inlineMd(buf.join('\n').trim()).replace(/\n/g, '<br>')}</blockquote>`);
            continue;
        }
        if (isBullet(line) || isNumber(line)) {
            const ordered = isNumber(line), test = ordered ? isNumber : isBullet, items = [];
            while (i < lines.length && test(lines[i])) { items.push(lines[i].replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '')); i++; }
            const tag = ordered ? 'ol' : 'ul';
            out.push(`<${tag}>${items.map(t => `<li>${inlineMd(t)}</li>`).join('')}</${tag}>`);
            continue;
        }
        const buf = [];
        while (i < lines.length && lines[i].trim() && !isHeading(lines[i]) && !isQuote(lines[i]) && !isBullet(lines[i]) && !isNumber(lines[i])) { buf.push(lines[i]); i++; }
        if (!buf.length) { buf.push(line); i++; }
        out.push(`<p>${inlineMd(buf.join('\n')).replace(/\n/g, '<br>')}</p>`);
    }
    return out.join('');
}

function renderMessage(m, index) {
    if (m.role === 'user') {
        return `<article class="message user"><div class="message-label">You <button class="icon-button" style="height:21px;width:24px;margin-left:auto" data-action="edit-message" data-index="${index}" aria-label="Edit and resend this message">${icon('edit')}</button></div><div class="message-text">${escapeHTML(m.content)}</div></article>`;
    }

    const result = m.result || {};
    const isSystemOrError = result.provider === 'system' || result.mode === 'error' || result.mode === 'offline';
    const body = renderMarkdown(m.content);
    const careTe = /[\u0C00-\u0C7F]/.test(m.content);
    const careLinks = `<div class="care-links"><a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">${careTe ? 'స్థానిక హెల్ప్‌లైన్ కనుగొనండి' : 'Find a local helpline'}</a><a href="tel:988">${careTe ? 'అమెరికా / కెనడా: 988' : 'US / Canada: 988'}</a><a href="tel:14416">${careTe ? 'భారతదేశం: 14416' : 'India: 14416'}</a></div>`;

    return `<article class="message assistant ${result.mode === 'care-first' ? 'care-message' : ''}">
        <div class="message-label">
            ${icon(result.mode === 'care-first' ? 'heart' : isSystemOrError ? 'info' : 'sparkle')}Gita 
            <span style="font-size:7px;letter-spacing:.5px;color:var(--muted-accent)">
                ${isSystemOrError ? 'SYSTEM NOTICE' : ''}
            </span>
        </div>
        <div class="message-text">${body}</div>
        ${result.mode === 'care-first' ? careLinks : ''}
        ${result.verses?.length ? `<div class="source-links"><span>ROOTED IN</span>${result.verses.map(v => `<button data-action="verse" data-id="${attr(v.id)}">BG ${escapeHTML(v.id)}</button>`).join('')}</div>` : ''}
        ${!isSystemOrError ? `
            <div class="message-tools">
                <button data-action="reflect-message" data-index="${index}">${icon('journal')}Add to reflection</button>
                <button data-action="copy-message" data-index="${index}">${icon('copy')}Copy</button>
                <span class="message-mode">${escapeHTML(result.provider ? result.provider.toUpperCase() : 'AI')}</span>
            </div>
        ` : ''}
    </article>`;
}

const CRISIS_PATTERN = /\b(suicid(?:e|al)|kill(?:ing)? myself|end my (?:life|existence)|take my (?:own )?life|want to die|wish (?:i was|i were) dead|better off dead|self[- ]?(?:harm|injury)|hurt(?:ing)? myself|harm(?:ing)? myself|cut(?:ting)? myself|(?:end|ending) it all|don't want to (?:live|be alive)|do not want to (?:live|be alive)|can't go on|cannot go on|no reason to live|overdose|not safe with myself|don't want to be here anymore)\b/i;
const CRISIS_PATTERN_TE = /ఆత్మహత్య|చ(?:ని|చ్చి) ?పో(?:వాలి|వాలని|వాలనుకు|వాలనిపి|తాను|దాం)|చావాలని|చావాలనిపి|చావాలనుకు|(?:నన్ను నేను|నాకు నేను) ?(?:చంపుకు|చంపుకో|హాని|గాయ|కోసుకు|కోసుకో|బాధ ?పెట్టుకు|బాధ ?పెట్టుకో)|(?:చేతులు|చేతిని|చేయి|మణికట్టు) ?కోసుకు|(?:చేతులు|చేతిని|చేయి|మణికట్టు) ?కోసుకో|ప్రాణ(?:ం|ా(?:లు|న్ని)) ?తీసుకు|ప్రాణ(?:ం|ా(?:లు|న్ని)) ?తీసుకో|బ(?:్ర)?తకాలని(?: ?అనిపించడం)? లేదు|బ(?:్ర)?తకడం ఇష్టం లేదు|బ(?:్ర)?తకలేను|జీవించాలని లేదు|జీవిత(?:ాన్ని|ం) ?(?:ముగించ|అంతం)|ఉరి ?వేసుకు|ఉరి ?వేసుకో|ఉరేసుకు|ఉరేసుకో|విషం తాగ|పురుగుల మందు తాగ|నేను లేక(?:పోతే|ుంటే) ?(?:బాగుండు|బాగుంటుంది)/;
const CRISIS_PATTERN_TE_LATIN = /\b(?:aa?tmahatya|chanipoval(?:i|ani)|chachipoval(?:i|ani)|chanipotanu|chachipotanu|(?:ba|bra)thakalani ledu|(?:ba|bra)thakaledu|(?:ba|bra)thakalenu)\b/i;
const TELUGU_SCRIPT = /[\u0C00-\u0C7F]/;

function crisisDetected(text) {
    const t = String(text).normalize('NFKC').replace(/[\u2018\u2019]/g, "'").replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ');
    return CRISIS_PATTERN.test(t) || CRISIS_PATTERN_TE.test(t) || CRISIS_PATTERN_TE_LATIN.test(t);
}

function careResponse(userText = '') {
    const country = state.settings.country;
    const te = state.settings.language === 'te' || TELUGU_SCRIPT.test(String(userText));
    let response;
    if (te) {
        const helpline = {
            IN: 'భారతదేశంలో టెలి-మానస్ (Tele-MANAS) 14416 కు కాల్ చేయండి. తక్షణ అత్యవసర పరిస్థితిలో 112 కు కాల్ చేయండి.',
            US: 'అమెరికాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. తక్షణ ప్రమాదంలో 911 కు కాల్ చేయండి.',
            CA: 'కెనడాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. తక్షణ ప్రమాదంలో 911 కు కాల్ చేయండి.'
        }[country] || 'భారతదేశంలో టెలి-మానస్ (Tele-MANAS) 14416 కు కాల్ చేయండి; అత్యవసరమైతే 112. అమెరికా లేదా కెనడాలో 988 కు కాల్ లేదా టెక్స్ట్ చేయండి. ఇతర దేశాల్లో స్థానిక సహాయం కోసం findahelpline.com చూడండి.';
        response = `మీరు ఇంత బాధలో ఉన్నందుకు నాకు చాలా బాధగా ఉంది. ఈ విషయం నాతో పంచుకున్నందుకు సంతోషం. ఇప్పుడు మీ భద్రతే అన్నింటికంటే ముఖ్యం, ఆధ్యాత్మిక సమాధానం కంటే కూడా.\n\nఈ భావాలతో మీరు ఏదైనా చేసే అవకాశం ఉన్నా, లేదా ఇప్పటికే మిమ్మల్ని మీరు గాయపరచుకున్నా, వెంటనే మీ స్థానిక అత్యవసర నంబరుకు కాల్ చేయండి లేదా సమీపంలోని అత్యవసర విభాగానికి వెళ్ళండి. వీలైతే మీకు హాని కలిగించగల వస్తువులకు దూరంగా వెళ్ళి, మీకు నమ్మకమైన వ్యక్తిని మీతో ఉండమని అడగండి.\n\n${helpline} మీరు దీన్ని ఒంటరిగా ఎదుర్కోవాల్సిన అవసరం లేదు.\n\nమీరు ఇప్పుడు వెంటనే ప్రమాదంలో ఉన్నారా? మీ దగ్గర ఎవరైనా ఉండగలరా?`;
    } else {
        const helpline = { IN: 'In India, call Tele-MANAS at 14416. For an immediate emergency, call 112.', US: 'In the United States, call or text 988. For immediate danger, call 911.', CA: 'In Canada, call or text 988. For immediate danger, call 911.' }[country] || 'In the US or Canada, call or text 988. In India, call Tele-MANAS at 14416. Elsewhere, find a local crisis line at findahelpline.com.';
        response = `I am really sorry you are in so much pain. I am glad you told me. Your immediate safety matters more than finding a spiritual answer.\n\nIf you might act on these feelings or have already hurt yourself, call your local emergency number or go to the nearest emergency department now. If you can, move away from anything you could use to hurt yourself and ask a trusted person to stay with you.\n\n${helpline} You do not have to handle this alone.\n\nAre you in immediate danger, and is there someone nearby who can stay with you?`;
    }
    return {
        response,
        understanding: { crisis_risk: true },
        mode: 'care-first',
        provider: 'safety',
        verses: []
    };
}

async function sendMessage(query) {
    if (isLocked()) return;

    query = query.trim();
    if (!query) return;
    if (query.length > 4000) { toast('The message is too long (max 4000 characters).'); return; }

    let chat = state.chats.find(c => c.id === currentChatId);
    if (chat && busyChats.has(chat.id)) return;

    beginAiRequest();

    if (!chat) {
        chat = {
            id: uid(),
            title: query.length > 36 ? `${query.slice(0, 36)}...` : query,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
        };
        state.chats.unshift(chat);
        currentChatId = chat.id;
    }

    const chatId = chat.id;
    const requestEpoch = dataEpoch;
    const history = chat.messages.filter(m => !(m.role === 'assistant' && m.result?.provider === 'system') && m.content.trim()).slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 3500) }));

    chat.messages.push({ id: uid(), role: 'user', content: query, createdAt: new Date().toISOString() });
    chat.updatedAt = new Date().toISOString();
    busyChats.add(chatId);
    saveState();

    if (route !== 'chat') navigate('chat');
    else renderChat();

    const start = Date.now();
    let result;

    if (!state.settings.connected && !crisisDetected(query)) await connectBackend(true);

    try {
        if (crisisDetected(query)) {
            result = careResponse(query);
        }
        else if (!state.settings.connected) {
            result = {
                response: `Gita AI is currently disconnected. Start your local server at \`${getApiUrl()}\` and connect in Settings to converse.`,
                provider: 'system',
                mode: 'offline',
                verses: []
            };
        }
        else {
            const controller = new AbortController();
            pendingRequests.set(chatId, controller);
            const timeout = setTimeout(() => controller.abort(), 65000);

            try {
                const response = await fetch(`${getApiUrl()}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'omit',
                    body: JSON.stringify({ query, history, country: state.settings.country, language: state.settings.language }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    let errDetail = `Server returned status ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData?.detail) errDetail = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
                    } catch (_) { }
                    throw new Error(errDetail);
                }

                result = await response.json();
                if (!result || typeof result.response !== 'string') {
                    throw new Error('Malformed AI response from server.');
                }
                result.verses = Array.isArray(result.verses) ? result.verses : [];

                for (const v of result.verses) {
                    verseById[v.id] = { ...v, themes: Array.isArray(v.themes) ? v.themes : [], source: v.source || 'Connected Gita corpus' };
                }
            } finally {
                clearTimeout(timeout);
                pendingRequests.delete(chatId);
            }
        }
    } catch (error) {
        if (requestEpoch !== dataEpoch || !state.chats.some(c => c.id === chatId)) return;

        result = {
            response: `Unable to get a response from Gita AI: ${error.message || 'Connection failed'}.\n\nPlease ensure your server is running at ${getApiUrl()} and your LLM API key is configured.`,
            provider: 'system',
            mode: 'error',
            verses: []
        };
        toast('AI backend connection failed.');
    } finally {
        if (Date.now() - start < 430 && result?.mode !== 'care-first') {
            await new Promise(resolve => setTimeout(resolve, 430 - (Date.now() - start)));
        }

        startCooldown();

        busyChats.delete(chatId);
        pendingRequests.delete(chatId);
    }

    chat = state.chats.find(c => c.id === chatId);
    if (!chat || requestEpoch !== dataEpoch) return;

    chat.messages.push({
        id: uid(),
        role: 'assistant',
        content: result.response,
        result,
        createdAt: new Date().toISOString()
    });
    chat.updatedAt = new Date().toISOString();
    saveState();

    if (route === 'chat' && currentChatId === chatId) {
        renderChat();
        $('#chat-input')?.focus();
    }
}

function renderSettings() {
    setPage(`
    ${pageHeading('', 'Settings', '')}
    <div class="settings-layout">
        <section class="settings-section">
            <h2>Your Profile</h2>
            <form id="preferences-form">
                <label class="form-field settings-name-field">
                    <input class="text-input" id="preferred-name" maxlength="40" placeholder="Your name" value="${attr(state.settings.name)}">
                </label>
                
                <div class="settings-row">
                    <div>
                        <label>Your region</label>
                        <small>Helpline information is always shown with its region.</small>
                    </div>
                    
                    <input type="hidden" id="country-input" value="${attr(state.settings.country)}">
                    <div class="custom-dropdown" id="region-dropdown">
                        <button type="button" class="dropdown-trigger" data-action="toggle-region-menu" aria-haspopup="listbox" aria-expanded="false">
                            <span class="dropdown-trigger-text" id="region-display">${state.settings.country === 'IN' ? 'India' : state.settings.country === 'US' ? 'United States' : state.settings.country === 'CA' ? 'Canada' : state.settings.country === 'other' ? 'Somewhere else' : 'Prefer not to say'}</span>
                            <svg class="dropdown-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu" id="region-menu" role="listbox">
                            <button type="button" class="dropdown-option ${state.settings.country === 'global' ? 'selected' : ''}" data-action="select-region" data-value="global" data-label="Prefer not to say">Prefer not to say</button>
                            <button type="button" class="dropdown-option ${state.settings.country === 'IN' ? 'selected' : ''}" data-action="select-region" data-value="IN" data-label="India">India</button>
                            <button type="button" class="dropdown-option ${state.settings.country === 'US' ? 'selected' : ''}" data-action="select-region" data-value="US" data-label="United States">United States</button>
                            <button type="button" class="dropdown-option ${state.settings.country === 'CA' ? 'selected' : ''}" data-action="select-region" data-value="CA" data-label="Canada">Canada</button>
                            <button type="button" class="dropdown-option ${state.settings.country === 'other' ? 'selected' : ''}" data-action="select-region" data-value="other" data-label="Somewhere else">Somewhere else</button>
                        </div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button type="submit" class="btn btn-secondary">Save</button>
                </div>
            </form>
        </section>

        <section class="settings-section">
            <h2>Your Data</h2>
            <p>Your chats, journal entries, and saved verses are entirely stored locally in browser.</p>
            <div class="settings-actions">
                <button class="btn btn-secondary" data-action="export-data">${icon('download')}Export</button>
                <button class="btn btn-secondary" data-action="import-data">${icon('upload')}Restore</button>
            </div>
        </section>

        <section class="settings-section settings-care-note">
            <h2>A little Note</h2>
            <p>Gita AI is a space for personal reflection, not a substitute for professional mental health care. The emotional insights it provides are simply AI-guided estimates, not clinical diagnoses. If you ever feel overwhelmed or in immediate danger, please reach out for human support. US / Canada: 988. India: Tele-MANAS 14416. For other regions, please visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style="color:var(--saffron);text-decoration:underline">findahelpline.com</a>.</p>
        </section>
    </div>
    <div class="page-footer">
        <button data-action="sources" style="text-decoration: underline;">Source Credits</button>
    </div>
    `, 'settings-page');
}

function render() {
    $$('[data-nav]').forEach(a => { a.classList.toggle('active', a.dataset.nav === route); if (a.dataset.nav === route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    updateChrome();
    ({ overview: renderOverview, chat: renderChat, journal: renderJournal, saved: renderSaved, library: renderLibrary, themes: renderThemes, settings: renderSettings }[route] || renderOverview)();
    routeJustChanged = false;
}

function checkScrollTitle() {
    const topTitle = $('#topbar-title');
    if (!topTitle) return;

    if (route === 'chat') {
        topTitle.classList.remove('visible');
        return;
    }

    const h1 = $('h1', $('#main'));
    if (h1) {
        topTitle.classList.toggle('visible', h1.getBoundingClientRect().bottom < 76);
    }
}

function updateChrome() {
    applyTheme();

    $('#bookmark-count').textContent = state.bookmarks.length;
    const isAi = Boolean(state.settings.connected);
    const modeLabel = $('#mode-label');
    modeLabel.className = `mode-label ${isAi ? 'is-connected' : 'is-offline'}`;
    modeLabel.innerHTML = `<span class="status-dot"></span><span>${isAi ? 'AI connected' : 'AI Offline'}</span>`;
    $('#top-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const topTitle = $('#topbar-title');
    if (topTitle) {
        const TOPBAR_TITLES_TE = {
            overview: 'Overview',
            journal: 'My Journal',
            saved: 'Saved verses',
            library: 'భగవద్గీత',
            themes: 'థీమ్ ద్వారా జ్ఞానం',
            settings: 'Settings'
        };

        let titleText = state.settings.language === 'te'
            ? (TOPBAR_TITLES_TE[route] || TOPBAR_TITLES[route])
            : TOPBAR_TITLES[route];

        topTitle.innerHTML = titleText || '';
        checkScrollTitle();
        syncProviderUI();
    }

    const langtoggle = $('#lang-toggle');
    if (langtoggle) {
        langtoggle.classList.toggle('te-active', state.settings.language === 'te');
    }

    syncThemeToggle();
}

function navigate(next) {
    closeSidebar(); if (next === route) render(); else location.hash = next;
}

function onRouteChange() {
    const next = location.hash.replace('#', '').split('?')[0]; route = ['overview', 'chat', 'journal', 'saved', 'library', 'themes', 'settings'].includes(next) ? next : 'overview'; routeJustChanged = true; closeSidebar(); render(); window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeSidebar() {
    $('#sidebar').classList.remove('open'); $('#sidebar-overlay').classList.remove('open'); $('#menu-button').setAttribute('aria-expanded', 'false'); syncSidebarAccess();
}

function syncSidebarAccess() {
    const hidden = !$('#sidebar').classList.contains('open');
    $('#sidebar').inert = hidden;
    if (hidden) $('#sidebar').setAttribute('aria-hidden', 'true');
    else $('#sidebar').removeAttribute('aria-hidden');
}

function toast(message, undo = null) {
    const region = $('#toasts');
    region.replaceChildren();
    const element = document.createElement('div');
    element.className = 'toast';
    element.innerHTML = `${icon('check')}<span>${escapeHTML(message)}</span>${undo ? '<button type="button">Undo</button>' : ''}`;
    region.appendChild(element);
    if (undo) $('button', element).onclick = () => { undo(); element.remove(); };
    setTimeout(() => element.remove(), undo ? 8000 : 4300);
}

function openModal(title, subtitle, content) {
    lastFocus = document.activeElement;
    $('#modal-inner').innerHTML = `<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-content">${content}</div>`;
    if (!$('#modal').open) {
        $('#modal').showModal();
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    $('#modal').close();
    document.body.style.overflow = '';
    confirmCallback = null;
    if (lastFocus?.isConnected) lastFocus.focus();
}

function confirmAction(title, copy, button, callback) {
    openModal(title, '', `<p class="confirm-copy">${copy}</p><div class="modal-footer verse-footer"><span></span><div><button class="btn btn-secondary" data-action="close-modal">Back</button><button class="btn btn-delete" data-action="confirm">${button}</button></div></div>`); confirmCallback = callback;
}

function showJournalError(message) {
    const el = $('#journal-error');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(window.journalErrorTimer);
    window.journalErrorTimer = setTimeout(() => { el.hidden = true; }, 4300);
}

function openJournal(id = null, prefill = '') {
    const entry = state.journals.find(j => j.id === id);
    journalDraftMood = entry?.mood || '';

    openModal(
        entry ? 'Edit reflection' : 'New reflection',
        entry?.example ? 'A starter reflection for inspiration. Edit it to make it your own.' : '',
        `<form id="journal-form" data-id="${attr(id || '')}" novalidate>
            <label class="form-field">
                <span>TITLE</span>
                <input class="text-input" name="title" id="journal-title" maxlength="120" placeholder="What's on your heart?" value="${attr(entry?.title || '')}" required>
            </label>
            <span class="field-label">HOW DO YOU FEEL?</span>
            <div class="mood-options modal-moods" id="journal-moods">
                ${moodButtons(journalDraftMood, 'journal-mood')}
            </div>
            <label class="form-field">
                <span>YOUR REFLECTION</span>
                <textarea class="text-input" name="body" maxlength="20000" placeholder="Today, I noticed..." required>${escapeHTML(entry?.body || prefill)}</textarea>
            </label>
            <p class="form-error" id="journal-error" role="alert" hidden></p>
            <div>
                <button class="btn btn-primary" type="submit">Save</button>
            </div>
        </form>`
    );
    setTimeout(() => $('#journal-title')?.focus(), 80);
}

function openVerse(id) {
    const v = verseById[id] || seedById[id];
    if (!v) {
        toast('This verse is not in the offline collection yet. Load the full library to read it.');
        return;
    }
    const saved = state.bookmarks.some(b => b.id === id), theme = v.themes?.find(k => THEMES[k]);
    const isRead = state.readVerses.includes(id);
    const isCoolingDown = isLocked();

    const rawSanskrit = state.settings.language === 'te' && v.sanskrit_te ? v.sanskrit_te : v.sanskrit;
    const activeSanskrit = rawSanskrit ? rawSanskrit.replace(/(?<!।)\s*।\s+(?!।)/g, ' ।\n') : '';
    const activeMeaning = state.settings.language === 'te' && v.telugu ? v.telugu : v.english;
    const rangeNote = (state.settings.language === 'te' && v.telugu_range)
        ? `<p class="modal-explanation">ఈ అనువాదం ${escapeHTML(v.telugu_range.replace('-', '–'))} శ్లోకాలకు కలిపి ఇవ్వబడింది.</p>`
        : '';

    openModal(
        state.settings.language === 'te' ? `భగవద్గీత ${id}` : `Bhagavad Gita ${id}`,
        `${state.settings.language === 'te' ? `అధ్యాయం ${v.chapter}` : `Chapter ${v.chapter}`} &middot; ${state.settings.language === 'te' ? CHAPTERS_TE[v.chapter - 1] : CHAPTERS[v.chapter - 1]}`,
        `${activeSanskrit ? `<div class="sanskrit" lang="sa">${escapeHTML(activeSanskrit)}</div>` : ''}${v.transliteration ? `<div class="transliteration">${escapeHTML(v.transliteration)}</div>` : ''}<blockquote class="modal-quote">&ldquo;${escapeHTML(activeMeaning.replace(/^[“"]+|[”"]+$/g, '').trim())}&rdquo;</blockquote>${rangeNote}${theme ? `<p class="modal-explanation">${escapeHTML(state.settings.language === 'te' && THEMES[theme].explanation_te ? THEMES[theme].explanation_te : THEMES[theme].explanation)}</p>` : ''}<div class="modal-footer verse-footer"><div style="display: flex; gap: 10px;"><button class="btn btn-secondary" data-action="bookmark" data-id="${id}" data-in-modal="true">${icon(saved ? 'check' : 'bookmark')}${saved ? 'Saved' : 'Save'}</button><button class="btn btn-secondary" data-action="toggle-read" data-id="${id}" data-in-modal="true">${icon(isRead ? 'check' : 'check-box')}${isRead ? 'Read' : 'Mark as read'}</button></div><button class="btn btn-primary" data-action="study-verse" data-id="${id}" ${isCoolingDown ? 'disabled' : ''}>${isCoolingDown ? icon('lock') + ' Please wait...' : 'Ask AI' + icon('arrow')}</button></div>`
    );
}

function toggleBookmark(id, inModal = false) {
    const index = state.bookmarks.findIndex(b => b.id === id);
    const isNowSaved = index < 0;

    if (index >= 0) {
        const item = state.bookmarks.splice(index, 1)[0];
        saveState();
        if (!inModal) {
            toast('Removed from your collection', () => {
                if (!state.bookmarks.some(b => b.id === id)) {
                    state.bookmarks.splice(Math.min(index, state.bookmarks.length), 0, item);
                    saveState();
                    updateChrome();
                    $$(`[data-action="bookmark"][data-id="${id}"]`).forEach(btn => {
                        btn.classList.add('saved');
                        btn.setAttribute('aria-pressed', 'true');
                    });
                    if (route === 'saved') renderSavedResults();
                }
            });
        }

    } else {
        state.bookmarks.unshift({ id, note: '', createdAt: new Date().toISOString() });
        const persisted = saveState();

        if (!inModal) {
            toast(persisted ? 'Saved' : 'Verse kept for this visit. Export your data to keep it safely.');
        }
    }

    updateChrome();

    $$(`[data-action="bookmark"][data-id="${id}"]`).forEach(btn => {
        btn.classList.toggle('saved', isNowSaved);
        btn.setAttribute('aria-pressed', String(isNowSaved));
    });

    if (route === 'saved' && !isNowSaved) {
        renderSavedResults();
    }

    if (inModal) {
        const btn = $(`#modal [data-action="bookmark"][data-id="${id}"]`);
        if (btn) {
            btn.classList.remove('saved');
            btn.innerHTML = `${icon(isNowSaved ? 'check' : 'bookmark')}${isNowSaved ? 'Saved' : 'Save'}`;
        }
    }
}

function openBookmarkNote(id) {
    const b = state.bookmarks.find(b => b.id === id); if (!b) return;
    openModal(`A personal note on Bhagavad Gita ${id}`, '', `<form id="note-form" data-id="${id}"><label class="form-field"><textarea name="note" class="text-input" maxlength="5000" placeholder="I want to remember...">${escapeHTML(b.note)}</textarea></label><div class="modal-footer"><span></span><div><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">Save note</button></div></div></form>`);
}

function showSources() {
    openModal(
        'Source Credits',
        '',
        `<p class="confirm-copy">The full collection contains 701 verses across 18 chapters, including Arjuna's opening question in chapter 13. Some editions omit that question and contain 700 verses.</p><p class="modal-explanation">Sanskrit: the ancient Bhagavad Gita text, from gita/gita under The Unlicense. English: Annie Besant, <em>The Bhagavad-Gita</em>, 4th edition (1922), public domain. Telugu script &amp; translations: compiled from public-domain Telugu Bhagavad Gita editions. Transliteration is mechanically derived from the Sanskrit. The complete English and Sanskrit data is maintained by the GitaVerses project.</p><p class="modal-explanation" style="margin-bottom: 4px;">The 30 bundled starter verses are clearly labeled plain-language renderings, not verbatim quotations from a named translator. Full quotations use the loaded corpus. Interpretive notes are for reflection, not a replacement for study in context.</p>`
    );
}

async function connectBackend(silent = false) {
    const output = $('#online-status');
    const base = getApiUrl();
    if (output && !silent) {
        output.textContent = 'Connecting...';
        output.className = '';
    }
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 9000);

    try {
        const response = await fetch(`${base}/api/health`, { signal: controller.signal, credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        const health = await response.json();

        if (health.app !== 'gita-ai') throw new Error('Unrecognized backend service');
        if (health.provider === 'offline') throw new Error('Backend has no API provider configured (check .env');

        state.settings.connected = true;
        state.settings.provider = health.provider || 'AI';

        if (state.settings.preferredProvider && state.settings.preferredProvider !== health.provider) {
            try {
                const switched = await requestProviderSwitch(state.settings.preferredProvider);
                state.settings.provider = switched.provider;
            } catch (_) {
            }
        }

        saveState();
        connectionStatus = `Connected to ${state.settings.provider}. Active at ${base}.`;
        if (route === 'settings') renderSettings();
        updateChrome();
        if (!silent) toast('Connected');

        loadCorpus(false, true).catch(() => { });
    }
    catch (error) {
        state.settings.connected = false;
        saveState();
        updateChrome();
        connectionStatus = `Unable to connect: ${error.message || 'backend not reachable'}. Backend URL: ${base}.`;
        if (route === 'settings') renderSettings();
        if (!silent) toast('Connection failed. Reverting to Offline Wisdom.');
    }
    finally { clearTimeout(timer); }
}

function downloadFile(name, content, type = 'application/json') {
    const blob = content instanceof Blob ? content : new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.hidden = true; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function exportData() {
    const data = JSON.parse(JSON.stringify(state)); data.settings.connected = false; downloadFile(`gita-reflections-${localDay()}.json`,
        JSON.stringify({ app: 'gita-ai', exportedAt: new Date().toISOString(), data }, null, 2));
}

function validateImport(data) {
    if (!validState(data) || data.chats.length > 10000 || data.journals.length > 30000 || data.bookmarks.length > 701) throw new Error('This is not a compatible Gita backup.');
    const string = (v, max) => typeof v === 'string' && v.length <= max;
    const date = v => string(v, 50) && !Number.isNaN(Date.parse(v));
    const ids = items => new Set(items.map(i => i.id)).size === items.length;
    if (!ids(data.chats) || !ids(data.journals) || !ids(data.bookmarks)) throw new Error('Duplicate records in backup.');
    if (!data.journals.every(j => string(j.id, 100) && string(j.title, 120) && string(j.body, 20000) && MOODS.includes(j.mood) && date(j.createdAt) && date(j.updatedAt))) throw new Error('Some journal entries are invalid.');
    if (!data.bookmarks.every(b => /^\d{1,2}\.\d{1,2}$/.test(b.id) && Number(b.id.split('.')[0]) >= 1 && Number(b.id.split('.')[0]) <= 18 && Number(b.id.split('.')[1]) >= 1 && Number(b.id.split('.')[1]) <= COUNTS[Number(b.id.split('.')[0]) - 1] && string(b.note, 5000) && date(b.createdAt))) throw new Error('Some saved verses are invalid.');
    if (!data.chats.every(c => string(c.id, 100) && string(c.title, 120) && date(c.createdAt) && date(c.updatedAt) && Array.isArray(c.messages) && c.messages.length <= 10000 && c.messages.every(m => ['user', 'assistant'].includes(m.role) && string(m.content, 50000) && (!m.result || typeof m.result === 'object')))) throw new Error('Some conversations are invalid.');
    const clean = freshState(); clean.chats = data.chats.map(c => ({ ...c, messages: c.messages.map(m => ({ id: string(m.id, 100) ? m.id : uid(), role: m.role, content: m.content, createdAt: date(m.createdAt) ? m.createdAt : new Date().toISOString() })) })); clean.journals = data.journals.map(j => ({ id: j.id, title: j.title, body: j.body, mood: j.mood, createdAt: j.createdAt, updatedAt: j.updatedAt, example: !!j.example })); clean.bookmarks = data.bookmarks.map(b => ({ id: b.id, note: b.note, createdAt: b.createdAt })); clean.settings.name = string(data.settings.name, 40) ? data.settings.name : ''; clean.settings.country = ['global', 'IN', 'US', 'CA', 'other'].includes(data.settings.country) ? data.settings.country : 'global'; clean.settings.theme = ['light', 'dark', 'system'].includes(data.settings.theme) ? data.settings.theme : 'system'; clean.readVerses = Array.isArray(data.readVerses) ? [...data.readVerses] : []; return clean;
}

document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return; const { action, id, index, page, prompt, mood } = button.dataset;
    switch (action) {
        case 'navigate': navigate(page); break;
        case 'toggle-theme': {
            const activeTheme = resolveTheme();
            state.settings.theme = activeTheme === 'dark' ? 'light' : 'dark';
            const persisted = saveState();
            updateChrome();
            toast(persisted ? (state.settings.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled') : 'Theme changed for this visit.');
            break;
        }
        case 'toggle-lang':
            state.settings.language = state.settings.language === 'en' ? 'te' : 'en';
            if (state.settings.language === 'te') {
                animatedRoutes.clear();
            }
            saveState();

            if (route === 'chat' && currentChatId) {
                currentChatId = null;
            }
            window.isLangSwitch = true;
            updateChrome();
            render();
            window.isLangSwitch = false;
            break;
        case 'new-chat':
            currentChatId = null;
            window.isSoftNavigate = true;
            navigate('chat');
            window.isSoftNavigate = false;
            setTimeout(() => $('#chat-input')?.focus(), 60);
            break;
        case 'prompt': if (route !== 'chat') currentChatId = null; await sendMessage(prompt); break;
        case 'quick-mood': {
            if (isLocked()) return;

            $$('#dashboard-moods .mood-button').forEach(btn => {
                const isSelected = btn.dataset.mood === mood;
                btn.classList.toggle('selected', isSelected);
                btn.style.background = isSelected ? 'var(--surface-selected)' : 'var(--surface-soft)';
                btn.style.borderColor = isSelected ? 'var(--saffron)' : 'var(--line-soft)';
            });

            const revealArea = $('#mood-reveal-area');

            if (!state.settings.connected) {
                revealArea.innerHTML = `
                    <div style="animation: page-in 0.2s ease-out; text-align: center; padding: 10px;">
                        <p style="font-size: 11px; color: var(--saffron); margin-bottom: 6px;">AI Disconnected</p>
                        <p style="font-size: 10px; color: var(--muted); margin-bottom: 8px;">Connect Gita AI in Settings to receive live wisdom.</p>
                        <button class="text-link" data-action="navigate" data-page="settings" style="font-size: 10px;">Open Settings &rarr;</button>
                    </div>
                `;
                break;
            }

            beginAiRequest();

            revealArea.innerHTML = `
                <div style="animation: page-in 0.2s ease-out; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <p style="font-size: 9px; color: var(--saffron); text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">${state.settings.language === 'te' ? 'జ్ఞానాన్వేషణ' : 'SEEKING WISDOM'}</p>
                    <div class="loading-dots"><i></i><i></i><i></i></div>
                </div>
            `;

            (async () => {
                try {
                    const query = mood.toLowerCase();

                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000);

                    const response = await fetch(`${getApiUrl()}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'omit',
                        body: JSON.stringify({ query, purpose: 'mood', history: [], country: state.settings.country, language: state.settings.language }),
                        signal: controller.signal
                    });

                    clearTimeout(timeout);
                    if (!response.ok) throw new Error('AI backend unavailable');

                    const result = await response.json();

                    if (Array.isArray(result.verses)) {
                        for (const v of result.verses) {
                            verseById[v.id] = { ...v, themes: Array.isArray(v.themes) ? v.themes : [], source: v.source || 'Connected Gita corpus' };
                        }
                    }

                    const verseId = (result.verses?.length > 0 && result.verses[0].id) ? result.verses[0].id : null;
                    const citationHtml = verseId ? `<div><button data-action="verse" data-id="${escapeHTML(verseId)}" style="font-size: 9px; color: var(--muted-strong); text-decoration: underline; transition: color 0.2s;" onmouseover="this.style.color='var(--saffron)'" onmouseout="this.style.color='var(--muted-strong)'">${state.settings.language === 'te' ? `భగవద్గీత ${escapeHTML(verseId)} స్ఫూర్తితో` : `Inspired by Gita ${escapeHTML(verseId)}`}</button></div>` : '';

                    let cleanText = result.response || '';
                    cleanText = cleanText.replace(/###[^\n]*/g, '');
                    cleanText = cleanText.replace(/>/g, '').replace(/\[BG\s*\d{1,2}\.\d{1,2}\]/gi, '');
                    cleanText = cleanText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                    if (!cleanText) throw new Error('Empty response');

                    revealArea.innerHTML = `
                        <div style="animation: page-in 0.3s ease-out;">
                            <div style="position: relative; margin-bottom: 8px;">
                                <p style="font-size: 12px; line-height: 1.85; visibility: hidden; margin: 0;">${escapeHTML(cleanText)}</p>
                                <p class="typewriter-target-ai" style="font-size: 12px; line-height: 1.85; color: var(--ink-soft); position: absolute; top: 0; left: 0; width: 100%; margin: 0;"></p>
                            </div>
                            
                            ${citationHtml}
                        </div>
                    `;

                    const targetElement = revealArea.querySelector('.typewriter-target-ai');
                    let charIndex = 0;
                    if (window.typewriterInterval) clearInterval(window.typewriterInterval);

                    window.typewriterInterval = setInterval(() => {
                        if (charIndex < cleanText.length) {
                            targetElement.textContent += cleanText.charAt(charIndex);
                            charIndex++;
                        } else {
                            clearInterval(window.typewriterInterval);
                            startCooldown();
                        }
                    }, 7);

                } catch (error) {
                    revealArea.innerHTML = `<p style="font-size: 10px; color: var(--danger); margin-top: 10px; text-align: center;">Unable to reach Gita AI. Please check your connection.</p>`;
                    startCooldown();
                }
            })();
            break;
        }
        case 'journal-mood': journalDraftMood = mood; $('#journal-moods').innerHTML = moodButtons(mood, 'journal-mood'); break;
        case 'new-journal': openJournal(); break;
        case 'edit-journal': openJournal(id); break;
        case 'delete-journal': confirmAction('Let this reflection go?', 'This reflection will be removed from your journal. You can undo the change briefly afterward.', 'Delete reflection', () => { const i = state.journals.findIndex(j => j.id === id); if (i < 0) return; const removed = state.journals.splice(i, 1)[0]; saveState(); render(); toast('Reflection removed.', () => { if (!state.journals.some(j => j.id === id)) { state.journals.splice(Math.min(i, state.journals.length), 0, removed); saveState(); render(); } }); }); break;
        case 'verse': openVerse(id); break;
        case 'bookmark': toggleBookmark(id, button.dataset.inModal === 'true'); break;
        case 'toggle-region-menu': {
            const menu = $('#region-menu');
            if (menu) {
                const isOpen = menu.classList.toggle('open');
                button.setAttribute('aria-expanded', String(isOpen));
            }
            break;
        }
        case 'select-region': {
            const val = button.dataset.value;
            const label = button.dataset.label;

            const input = $('#country-input');
            if (input) input.value = val;

            const textEl = $('#region-display');
            if (textEl) textEl.innerHTML = label;

            $('#region-menu')?.classList.remove('open');
            $('#region-dropdown .dropdown-trigger')?.setAttribute('aria-expanded', 'false');

            $$('#region-menu .dropdown-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.value === val);
            });
            break;
        }
        case 'toggle-read': {
            const index = state.readVerses.indexOf(id);
            const isNowRead = index < 0;

            if (isNowRead) state.readVerses.push(id);
            else state.readVerses.splice(index, 1);

            saveState();

            $$(`[data-action="toggle-read"][data-id="${id}"]`).forEach(btn => {
                btn.classList.toggle('read', isNowRead);
                btn.setAttribute('aria-pressed', String(isNowRead));
            });

            if (button.dataset.inModal === 'true') {
                button.innerHTML = `${icon(isNowRead ? 'check' : 'check-box')}${isNowRead ? 'Read' : 'Mark as read'}`;
                button.removeAttribute('style');
            } else {
                toast(isNowRead ? 'Marked as read' : 'Marked as unread');
            }
            break;
        }
        case 'bookmark-note': openBookmarkNote(id); break;
        case 'study-verse':
            closeModal();
            currentChatId = null;
            const askai = state.settings.language === 'te'
                ? `భగవద్గీత ${id} శ్లోకాన్ని వివరంగా వివరించి, దాన్ని నా దైనందిన జీవితంలో ఎలా ఆచరించవచ్చో తెలియజేయండి.`
                : `Help me understand Bhagavad Gita ${id} and reflect on it in my daily life.`;
            await sendMessage(askai); break;
        case 'close-modal': closeModal(); break;
        case 'confirm': { const cb = confirmCallback; closeModal(); cb?.(); break; }
        case 'theme': activeTheme = id; updateChrome(); renderThemes(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
        case 'all-themes': activeTheme = null; updateChrome(); renderThemes(); break;
        case 'library-page': libraryPage += Number(button.dataset.direction); renderLibraryResults(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
        case 'toggle-chapter-menu': {
            const menu = $('#chapter-menu');
            if (menu) {
                const isOpen = menu.classList.toggle('open');
                button.setAttribute('aria-expanded', String(isOpen));
            }
            break;
        }
        case 'select-chapter': {
            const val = button.dataset.value;
            libraryChapter = val;
            libraryPage = 1;

            const menu = $('#chapter-menu');
            if (menu) menu.classList.remove('open');
            $('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');

            const label = val ? `${val}.&nbsp;&nbsp;&nbsp;${state.settings.language === 'te' ? CHAPTERS_TE[Number(val) - 1] : CHAPTERS[Number(val) - 1]}` : (state.settings.language === 'te' ? 'అన్ని అధ్యాయాలు' : 'All chapters');
            const textEl = $('.dropdown-trigger-text'); if (textEl) textEl.innerHTML = label; $$('.dropdown-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.value === val);
            });

            renderLibraryResults();
            break;
        }
        case 'load-corpus': loadCorpus(true).catch(() => { }); renderLibraryResults(); break;
        case 'open-chat':
            currentChatId = id;
            window.isSoftNavigate = true;
            renderChat();
            window.isSoftNavigate = false;
            break;
        case 'rename-chat': { const chat = state.chats.find(c => c.id === id); if (!chat) break; openModal('Rename Conversation', '', `<form id="rename-form" data-id="${attr(id)}"><label class="form-field"><span>CONVERSATION TITLE</span><input class="text-input" name="title" maxlength="100" value="${attr(chat.title)}" required></label><div class="modal-footer"><span></span><div><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">Save</button></div></div></form>`); break; }
        case 'delete-chat': confirmAction('Delete Conversation', 'The messages will be deleted from this browser. Your saved verses and reflections will stay.', 'Delete', () => { pendingRequests.get(id)?.abort(); state.chats = state.chats.filter(c => c.id !== id); busyChats.delete(id); if (currentChatId === id) currentChatId = null; saveState(); render(); toast('Conversation Deleted'); }); break;
        case 'edit-message': { const chat = state.chats.find(c => c.id === currentChatId), m = chat?.messages[Number(index)]; if (!m || busyChats.has(currentChatId)) break; openModal('Edit Query', '', `<form id="edit-message-form" data-index="${index}" data-chat="${attr(currentChatId)}"><label class="form-field"><span>YOUR MESSAGE</span><textarea name="message" class="text-input" maxlength="4000" required>${escapeHTML(m.content)}</textarea></label><div class="modal-footer"><span></span><div><button type="button" class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary">Send</button></div></div></form>`); break; }
        case 'reflect-message': { const m = state.chats.find(c => c.id === currentChatId)?.messages[Number(index)]; if (m) openJournal(null, ''); break; }
        case 'copy-message': { const m = state.chats.find(c => c.id === currentChatId)?.messages[Number(index)]; if (!m) break; try { await navigator.clipboard.writeText(m.content); toast('Copied'); } catch (error) { openModal('Words to take with you.', 'Select and copy the text below.', `<textarea class="text-input" rows="12" readonly>${escapeHTML(m.content)}</textarea>`); } break; }
        case 'sources': showSources(); break;
        case 'open-settings': closeModal(); navigate('settings'); break;
        case 'toggle-provider-menu': {
            const menu = $('#provider-menu');
            if (menu) {
                const open = menu.classList.toggle('open');
                button.setAttribute('aria-expanded', String(open));
            }
            break;
        }
        case 'toggle-mic':
            if (isLocked()) return;
            if (!window.voiceInput.isRecording) {
                window.voiceInput.start();
            }
            break;
        case 'select-provider': {
            const prov = button.dataset.value;
            $('#provider-menu')?.classList.remove('open');
            $('.provider-trigger')?.setAttribute('aria-expanded', 'false');
            switchProvider(prov);
            break;
        }
        case 'ping-backend': {
            if (button.classList.contains('is-pinging')) break;
            button.classList.add('is-pinging');
            connectBackend().finally(() => {
                button.classList.remove('is-pinging');
                button.classList.toggle('connected', state.settings.connected);
            });
            break;
        }
        case 'export-data': exportData(); break;
        case 'import-data': $('#import-input').click(); break;
    }
});

document.addEventListener('click', event => {
    const chapterDropdown = $('#chapter-dropdown');
    if (chapterDropdown && !chapterDropdown.contains(event.target)) {
        $('#chapter-menu')?.classList.remove('open');
        $('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    }

    const regionDropdown = $('#region-dropdown');
    if (regionDropdown && !regionDropdown.contains(event.target)) {
        $('#region-menu')?.classList.remove('open');
        $('#region-dropdown .dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    }

    const provDropdown = $('#provider-dropdown');
    if (provDropdown && !provDropdown.contains(event.target)) {
        $('#provider-menu')?.classList.remove('open');
        $('.provider-trigger')?.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('submit', async event => {
    const form = event.target; event.preventDefault();
    if (form.id === 'chat-form') {
        if (window.voiceInput?.isRecording) {
            window.voiceInput.stop();
            return; // Stops here, DOES NOT send the query!
        }
        if (isLocked()) { toast('Please wait for the cooldown to finish.'); return; }
        const input = $('#chat-input'), text = input.value;
        if (text.trim()) {
            input.value = '';
            await sendMessage(text);
        }
    }
    else if (form.id === 'quick-chat-form') {
        if (isLocked()) { toast('Please wait for the cooldown to finish.'); return; }
        const q = new FormData(form).get('question'); currentChatId = null; await sendMessage(String(q));
    }
    else if (form.id === 'journal-form') { const f = new FormData(form), title = String(f.get('title')).trim(), body = String(f.get('body')).trim(); if (!title || !body) { showJournalError('Give this reflection a title and a few words'); return; } if (!journalDraftMood) { showJournalError('Please select how you feel'); return; } const entry = state.journals.find(j => j.id === form.dataset.id), now = new Date().toISOString(); if (entry) Object.assign(entry, { title, body, mood: journalDraftMood, updatedAt: now, example: false }); else state.journals.unshift({ id: uid(), title, body, mood: journalDraftMood, createdAt: now, updatedAt: now, example: false }); const persisted = saveState(); closeModal(); render(); toast(persisted ? 'Saved' : 'This reflection is not saved. Export your data before leaving.'); }
    else if (form.id === 'note-form') { const note = state.bookmarks.find(b => b.id === form.dataset.id); let persisted = false; if (note) { note.note = String(new FormData(form).get('note')).trim(); persisted = saveState(); } closeModal(); render(); toast(persisted ? 'Your note is saved' : 'Your note is here for this visit. Export your data to keep it.'); }
    else if (form.id === 'rename-form') { const chat = state.chats.find(c => c.id === form.dataset.id), title = String(new FormData(form).get('title')).trim(); if (!title) return; if (chat) { chat.title = title; chat.updatedAt = new Date().toISOString(); saveState(); } closeModal(); renderChat(); toast('Conversation renamed'); }
    else if (form.id === 'edit-message-form') {
        if (isLocked()) {
            toast('Please wait for the cooldown to finish before resending.');
            return;
        }
        const chat = state.chats.find(c => c.id === form.dataset.chat), text = String(new FormData(form).get('message')).trim();
        if (!chat || !text) return;
        chat.messages = chat.messages.slice(0, Number(form.dataset.index));
        currentChatId = chat.id;
        closeModal();
        await sendMessage(text);
    }
    else if (form.id === 'preferences-form') { state.settings.name = $('#preferred-name').value.trim(); state.settings.country = $('#country-input').value; const persisted = saveState(); updateChrome(); toast(persisted ? 'Saved' : 'Preferences updated for this visit. Browser storage is unavailable.'); }
});

document.addEventListener('input', event => { switch (event.target.id) { case 'journal-search': journalQuery = event.target.value; renderJournalResults(); break; case 'saved-search': savedQuery = event.target.value; renderSavedResults(); break; case 'library-search': libraryQuery = event.target.value; libraryPage = 1; renderLibraryResults(); break; case 'chat-input': event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 130)}px`; break; } });
document.addEventListener('keydown', event => { if (event.target.id === 'chat-input' && event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (isLocked()) return; $('#chat-form').requestSubmit(); } if (event.key === 'Escape') closeSidebar(); });
$('#menu-button').addEventListener('click', () => {
    const open = !$('#sidebar').classList.contains('open');
    $('#sidebar').classList.toggle('open', open);
    $('#sidebar-overlay').classList.toggle('open', open);
    $('#menu-button').setAttribute('aria-expanded', String(open));
    syncSidebarAccess();
});
$('#sidebar-overlay').addEventListener('click', closeSidebar);
$('#modal').addEventListener('click', event => { if (event.target === $('#modal')) { const rect = $('#modal').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
$('#modal').addEventListener('cancel', () => { confirmCallback = null; });
$('#modal').addEventListener('close', () => { document.body.style.overflow = ''; });
$('#import-input').addEventListener('change', async event => { const file = event.target.files[0]; event.target.value = ''; if (!file) return; if (file.size > 15 * 1024 * 1024) { toast('That backup is too large. The limit is 15 MB.'); return; } try { const parsed = JSON.parse(await file.text()); if (parsed.app !== 'gita-ai') throw new Error('Please choose a Gita AI backup.'); const imported = validateImport(parsed.data); confirmAction('Restore this chapter?', 'This will replace your current local data with the backup. Connection settings are reset to Offline Wisdom. Export your current space first if you want to keep it.', 'Restore backup', () => { dataEpoch++; pendingRequests.forEach(c => c.abort()); busyChats.clear(); $('#toasts').replaceChildren(); state = imported; currentChatId = null; connectionStatus = ''; saveState(); render(); toast(' Restore Completed'); }); } catch (error) { toast(error.message || 'This backup could not be read. Your current data is unchanged.'); } });
window.addEventListener('hashchange', onRouteChange);
window.addEventListener('storage', event => { if (event.key === STORE_KEY && event.newValue) { try { const next = JSON.parse(event.newValue); if (validState(next)) { state = next; applyTheme(); if (!$('#modal').open && !busyChats.size) render(); } } catch (error) { } } });
window.addEventListener('scroll', checkScrollTitle, { passive: true });
window.matchMedia('(max-width:760px)').addEventListener('change', syncSidebarAccess);
if (systemThemeQuery) {
    const applySystemTheme = () => {
        if (getThemePreference() === 'system') {
            applyTheme();
            updateChrome();
        }
    };
    if (typeof systemThemeQuery.addEventListener === 'function') {
        systemThemeQuery.addEventListener('change', applySystemTheme);
    } else if (typeof systemThemeQuery.addListener === 'function') {
        systemThemeQuery.addListener(applySystemTheme);
    }
}
applyTheme();
saveState(); syncSidebarAccess(); onRouteChange();
if (storageError || recoveryNotice) setTimeout(() => toast('Some browser storage could not be read. Export important reflections to keep them safe.'), 900);
if (corpus.length !== 701) setTimeout(() => loadCorpus().catch(() => { }), 1500);
connectBackend(true);

function animatedTitle(enHtml, teHtml, ariaLabel) {
    if (state.settings.language === 'te') {
        const key = `${route}-${activeTheme || ''}`;
        if (!animatedRoutes.has(key)) {
            animatedRoutes.add(key);
            return `<span class="rolling-title" aria-label="${attr(ariaLabel)}">
                <span class="rolling-en" aria-hidden="true">${enHtml}</span>
                <span class="rolling-te" aria-hidden="true">${teHtml}</span>
            </span>`;
        }
        return teHtml
    }
    return enHtml;
}

async function requestProviderSwitch(providerName) {
    const res = await fetch(`${getApiUrl()}/api/provider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to switch provider');
    }
    return await res.json();
}

async function switchProvider(providerName) {
    try {
        const data = await requestProviderSwitch(providerName);
        state.settings.provider = data.provider;
        state.settings.preferredProvider = data.provider;
        state.settings.connected = true;
        saveState();
        updateChrome();
        toast(`Switched to ${data.provider.toUpperCase()}`);
    } catch (err) {
        toast(err.message || `Could not switch to ${providerName}.`);
    }
}

function syncProviderUI() {
    const p = ['gemini', 'groq'].includes(state.settings.provider)
        ? state.settings.provider
        : (['gemini', 'groq'].includes(state.settings.preferredProvider) ? state.settings.preferredProvider : 'gemini');
    const name = p.charAt(0).toUpperCase() + p.slice(1);
    const label = document.getElementById('current-provider-name');
    if (label) label.textContent = name;
    document.querySelectorAll('#provider-menu .dropdown-option').forEach(o =>
        o.classList.toggle('selected', o.dataset.value === p));
}