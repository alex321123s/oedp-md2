const axios = require('axios');
const API = 'http://localhost:3001';

async function run() {
    console.log('\n📝 Publishing motions for signature collection...\n');
    
    // Login as motion creators
    const login = async (email, pw) => (await axios.post(`${API}/api/auth/login`, {email, password: pw})).data.data.token;
    
    const alice = await login('alice@oedp.de', 'Test123!');
    const bob = await login('bob@oedp.de', 'Test123!');
    const clara = await login('clara@oedp.de', 'Test123!');
    
    // Get all motions
    const motions = (await axios.get(`${API}/api/motions`)).data.data.motions;
    console.log(`Found ${motions.length} motions\n`);
    
    // Publish each motion
    for (const motion of motions) {
        if (motion.status === 'draft') {
            try {
                // Determine which token to use based on creator
                let token = alice;
                if (motion.creator.email === 'bob@oedp.de') token = bob;
                if (motion.creator.email === 'clara@oedp.de') token = clara;
                
                await axios.post(`${API}/api/motions/${motion.id}/publish`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`✅ Published: ${motion.title}`);
            } catch (error) {
                console.log(`⚠️  Could not publish: ${motion.title}`);
                console.log(`   Reason: ${error.response?.data?.message || error.message}`);
            }
        }
    }
    
    console.log('\n✅ Done! Motions are now ready for signatures.\n');
    console.log('🌐 Refresh http://localhost:5173 and click on any motion to sign it!\n');
}

run().catch(e => console.error('Error:', e.response?.data || e.message));
