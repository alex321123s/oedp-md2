const axios = require('axios');
const API = 'http://localhost:3001';

async function run() {
    console.log('\n✍️  Adding signatures from multiple users...\n');
    
    const login = async (email, pw) => (await axios.post(`${API}/api/auth/login`, {email, password: pw})).data.data.token;
    
    // Users who will sign
    const signers = [
        'bob@oedp.de',
        'david@oedp.de', 
        'emma@oedp.de',
        'frank@oedp.de',
        'greta@oedp.de',
        'hans@oedp.de',
        'inge@oedp.de',
        'jan@oedp.de'
    ];
    
    // Get a motion to sign
    const motions = (await axios.get(`${API}/api/motions`)).data.data.motions;
    const collectingMotions = motions.filter(m => m.status === 'collecting');
    
    console.log(`Found ${collectingMotions.length} motions collecting signatures\n`);
    
    // Sign the first motion with multiple users
    const motion = collectingMotions[0];
    console.log(`Signing: ${motion.title}\n`);
    
    let successCount = 0;
    
    for (const email of signers) {
        try {
            const token = await login(email, 'Test123!');
            await axios.post(`${API}/api/motions/${motion.id}/sign`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ ${email} signed`);
            successCount++;
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            console.log(`⏭️  ${email}: ${msg}`);
        }
    }
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Added ${successCount} new signatures!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Check final count
    const updated = (await axios.get(`${API}/api/motions/${motion.id}`)).data.data.motion;
    console.log(`📊 ${motion.title}`);
    console.log(`   Signatures: ${updated.signatureCount} / 80\n`);
    console.log(`🌐 Refresh http://localhost:5173/motions/${motion.id}\n`);
}

run().catch(e => console.error('Error:', e.response?.data || e.message));
