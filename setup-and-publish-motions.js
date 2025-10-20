const axios = require('axios');
const API = 'http://localhost:3001';

async function run() {
    console.log('\n📝 Setting up and publishing motions...\n');
    
    // Login
    const login = async (email, pw) => (await axios.post(`${API}/api/auth/login`, {email, password: pw})).data.data.token;
    
    const alice = await login('alice@oedp.de', 'Test123!');
    const bob = await login('bob@oedp.de', 'Test123!');
    const clara = await login('clara@oedp.de', 'Test123!');
    
    // Get all users to find IDs for trust persons
    const users = (await axios.get(`${API}/api/users`, {headers: {Authorization: `Bearer ${alice}`}})).data.data.users;
    const bobUser = users.find(u => u.email === 'bob@oedp.de');
    const claraUser = users.find(u => u.email === 'clara@oedp.de');
    const davidUser = users.find(u => u.email === 'david@oedp.de');
    
    // Get all motions
    const motions = (await axios.get(`${API}/api/motions`)).data.data.motions;
    console.log(`Found ${motions.length} motions\n`);
    
    // Update and publish each motion
    for (const motion of motions) {
        if (motion.status === 'draft') {
            try {
                // Determine which token to use based on creator
                let token = alice;
                let trustPersonId = bobUser.id;
                let backupId = claraUser.id;
                
                if (motion.creator.email === 'bob@oedp.de') {
                    token = bob;
                    trustPersonId = claraUser.id;
                    backupId = davidUser.id;
                }
                if (motion.creator.email === 'clara@oedp.de') {
                    token = clara;
                    trustPersonId = davidUser.id;
                    backupId = bobUser.id;
                }
                
                // Update motion with trust person
                await axios.put(`${API}/api/motions/${motion.id}`, {
                    title: motion.title,
                    type: motion.type,
                    description: motion.description,
                    fullText: motion.fullText,
                    targetGroup: motion.targetGroup,
                    reasoning: motion.reasoning,
                    trustPersonId: trustPersonId,
                    backupTrustPersonId: backupId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Publish for signatures
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
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONE! Motions are now COLLECTING signatures!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Go to: http://localhost:5173/motions');
    console.log('📝 Click any motion to see the SIGN button!\n');
}

run().catch(e => console.error('Error:', e.response?.data || e.message));
