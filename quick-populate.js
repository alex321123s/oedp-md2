const axios = require('axios');
const API = 'http://localhost:3001';

async function run() {
    console.log('\n🚀 QUICK POPULATION - All Features\n');
    
    // Login
    const login = async (email, pw) => (await axios.post(`${API}/api/auth/login`, {email, password: pw})).data.data.token;
    
    const alice = await login('alice@oedp.de', 'Test123!');
    const bob = await login('bob@oedp.de', 'Test123!');
    const bgst = await login('bgst@oedp.de', 'BGSt123!');
    console.log('✅ Logged in\n');
    
    // Get users for co-initiators
    const users = (await axios.get(`${API}/api/users`, {headers: {Authorization: `Bearer ${alice}`}})).data.data.users;
    const coIds = users.filter(u => u.email !== 'alice@oedp.de').slice(0, 19).map(u => u.id);
    
    // Create surveys with ALL question types
    console.log('📋 Creating ALL survey types:\n');
    
    // 1. YES/NO
    let s = await axios.post(`${API}/api/surveys`, {
        title: 'Atomausstieg beschleunigen?',
        description: 'Soll die ÖDP den Atomausstieg auf 2024 vorziehen?',
        questionType: 'yes_no',
        durationDays: 7,
        coInitiatorIds: coIds,
        isAnonymous: true,
        isBinding: false
    }, {headers: {Authorization: `Bearer ${alice}`}});
    let sid = s.data.data.survey.id;
    await axios.post(`${API}/api/surveys/${sid}/approve`, {isApproved: true, approvalNotes: 'OK'}, {headers: {Authorization: `Bearer ${bgst}`}});
    await axios.post(`${API}/api/surveys/${sid}/vote`, {voteValue: 'Ja'}, {headers: {Authorization: `Bearer ${bob}`}});
    console.log('  ✅ YES/NO survey created');
    
    // 2. SINGLE_CHOICE
    s = await axios.post(`${API}/api/surveys`, {
        title: 'Verkehrspolitik Priorität',
        description: 'Welche Maßnahme zuerst?',
        questionType: 'single_choice',
        options: ['Kostenloser ÖPNV', 'Radwege', 'Tempolimit', 'E-Mobilität'],
        durationDays: 10,
        coInitiatorIds: users.filter(u => u.email !== 'bob@oedp.de').slice(0, 19).map(u => u.id),
        isAnonymous: false,
        isBinding: false
    }, {headers: {Authorization: `Bearer ${bob}`}});
    sid = s.data.data.survey.id;
    await axios.post(`${API}/api/surveys/${sid}/approve`, {isApproved: true, approvalNotes: 'OK'}, {headers: {Authorization: `Bearer ${bgst}`}});
    await axios.post(`${API}/api/surveys/${sid}/vote`, {voteValue: 'Kostenloser ÖPNV'}, {headers: {Authorization: `Bearer ${alice}`}});
    console.log('  ✅ SINGLE_CHOICE survey created');
    
    // 3. MULTIPLE_CHOICE
    const clara = await login('clara@oedp.de', 'Test123!');
    s = await axios.post(`${API}/api/surveys`, {
        title: 'Energiewende Maßnahmen',
        description: 'Welche Maßnahmen unterstützen? (Mehrfachauswahl)',
        questionType: 'multiple_choice',
        options: ['Solar', 'Wind', 'Speicher', 'Netze'],
        durationDays: 7,
        coInitiatorIds: users.filter(u => u.email !== 'clara@oedp.de').slice(0, 19).map(u => u.id),
        isAnonymous: true,
        isBinding: false
    }, {headers: {Authorization: `Bearer ${clara}`}});
    sid = s.data.data.survey.id;
    await axios.post(`${API}/api/surveys/${sid}/approve`, {isApproved: true, approvalNotes: 'OK'}, {headers: {Authorization: `Bearer ${bgst}`}});
    await axios.post(`${API}/api/surveys/${sid}/vote`, {voteValue: ['Solar', 'Speicher']}, {headers: {Authorization: `Bearer ${alice}`}});
    console.log('  ✅ MULTIPLE_CHOICE survey created');
    
    // 4. FREE_TEXT
    const david = await login('david@oedp.de', 'Test123!');
    s = await axios.post(`${API}/api/surveys`, {
        title: 'Ideen für Klimaschutzprojekte',
        description: 'Welche konkreten Projekte sollten umgesetzt werden?',
        questionType: 'free_text',
        durationDays: 10,
        coInitiatorIds: users.filter(u => u.email !== 'david@oedp.de').slice(0, 19).map(u => u.id),
        isAnonymous: false,
        isBinding: false
    }, {headers: {Authorization: `Bearer ${david}`}});
    sid = s.data.data.survey.id;
    await axios.post(`${API}/api/surveys/${sid}/approve`, {isApproved: true, approvalNotes: 'OK'}, {headers: {Authorization: `Bearer ${bgst}`}});
    await axios.post(`${API}/api/surveys/${sid}/vote`, {voteValue: 'Urban Gardening Projekte in allen Stadtteilen'}, {headers: {Authorization: `Bearer ${alice}`}});
    console.log('  ✅ FREE_TEXT survey created');
    
    // 5. RANKED_CHOICE
    const emma = await login('emma@oedp.de', 'Test123!');
    s = await axios.post(`${API}/api/surveys`, {
        title: 'Umweltpolitik Prioritäten',
        description: 'Bitte sortieren (1=höchste Priorität)',
        questionType: 'ranked_choice',
        options: ['Klimaschutz', 'Artenschutz', 'Ressourcen', 'Gewässer'],
        durationDays: 7,
        coInitiatorIds: users.filter(u => u.email !== 'emma@oedp.de').slice(0, 19).map(u => u.id),
        isAnonymous: true,
        isBinding: false
    }, {headers: {Authorization: `Bearer ${emma}`}});
    sid = s.data.data.survey.id;
    await axios.post(`${API}/api/surveys/${sid}/approve`, {isApproved: true, approvalNotes: 'OK'}, {headers: {Authorization: `Bearer ${bgst}`}});
    await axios.post(`${API}/api/surveys/${sid}/vote`, {voteValue: {'Klimaschutz': 1, 'Artenschutz': 2, 'Ressourcen': 3, 'Gewässer': 4}}, {headers: {Authorization: `Bearer ${alice}`}});
    console.log('  ✅ RANKED_CHOICE survey created');
    
    console.log('\n✅ ALL 5 SURVEY TYPES CREATED!\n');
    console.log('🌐 Refresh http://localhost:5173\n');
}

run().catch(e => console.error('Error:', e.response?.data || e.message));
