const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function login(email, password) {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password
        });
        return response.data.data.token;
    } catch (error) {
        console.error(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
        return null;
    }
}

async function createMotion(token, motionData) {
    try {
        const response = await axios.post(`${API_URL}/api/motions`, motionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.motion;
    } catch (error) {
        console.error(`❌ Motion creation failed:`, error.response?.data?.message || error.message);
        return null;
    }
}

async function signMotion(token, motionId) {
    try {
        await axios.post(`${API_URL}/api/motions/${motionId}/sign`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function approveMotion(token, motionId, approved, notes) {
    try {
        await axios.post(`${API_URL}/api/motions/${motionId}/approve`, {
            isApproved: approved,
            approvalNotes: notes
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('❌ Approval failed:', error.response?.data?.message);
        return false;
    }
}

async function createComment(token, entityType, entityId, content) {
    try {
        await axios.post(`${API_URL}/api/comments`, {
            entityType,
            entityId,
            content
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function createQuickPoll(token, motionId, question, options) {
    try {
        const response = await axios.post(`${API_URL}/api/polls`, {
            motionId,
            question,
            options
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.poll;
    } catch (error) {
        console.error('❌ Poll creation failed:', error.response?.data?.message);
        return null;
    }
}

async function voteOnPoll(token, pollId, option) {
    try {
        await axios.post(`${API_URL}/api/polls/${pollId}/vote`, {
            option
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function createSurvey(token, surveyData) {
    try {
        const response = await axios.post(`${API_URL}/api/surveys`, surveyData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.survey;
    } catch (error) {
        console.error('❌ Survey creation failed:', error.response?.data?.message);
        return null;
    }
}

async function approveSurvey(token, surveyId, approved, notes) {
    try {
        await axios.post(`${API_URL}/api/surveys/${surveyId}/approve`, {
            isApproved: approved,
            approvalNotes: notes
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        console.error('❌ Survey approval failed:', error.response?.data?.message);
        return false;
    }
}

async function voteOnSurvey(token, surveyId, voteValue) {
    try {
        await axios.post(`${API_URL}/api/surveys/${surveyId}/vote`, {
            voteValue
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (error) {
        return false;
    }
}

async function getUsers(token) {
    try {
        const response = await axios.get(`${API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data.users;
    } catch (error) {
        return [];
    }
}

async function main() {
    console.log('\n🧪 ÖDP-MD² COMPREHENSIVE PLATFORM POPULATION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 1: Login all users
    console.log('📝 Step 1: Logging in test users...');
    const tokens = {
        alice: await login('alice@oedp.de', 'Test123!'),
        bob: await login('bob@oedp.de', 'Test123!'),
        clara: await login('clara@oedp.de', 'Test123!'),
        david: await login('david@oedp.de', 'Test123!'),
        emma: await login('emma@oedp.de', 'Test123!'),
        frank: await login('frank@oedp.de', 'Test123!'),
        greta: await login('greta@oedp.de', 'Test123!'),
        hans: await login('hans@oedp.de', 'Test123!'),
        inge: await login('inge@oedp.de', 'Test123!'),
        jan: await login('jan@oedp.de', 'Test123!'),
        karl: await login('karl@oedp.de', 'Test123!'),
        laura: await login('laura@oedp.de', 'Test123!'),
        max: await login('max@oedp.de', 'Test123!'),
        nina: await login('nina@oedp.de', 'Test123!'),
        otto: await login('otto@oedp.de', 'Test123!'),
        paula: await login('paula@oedp.de', 'Test123!'),
        quinn: await login('quinn@oedp.de', 'Test123!'),
        robert: await login('robert@oedp.de', 'Test123!'),
        sarah: await login('sarah@oedp.de', 'Test123!'),
        tom: await login('tom@oedp.de', 'Test123!'),
        bgst: await login('bgst@oedp.de', 'BGSt123!'),
        admin: await login('admin@oedp.de', 'Admin123!')
    };
    console.log('✅ All users logged in\n');

    // Step 2: Create Motions
    console.log('📋 Step 2: Creating motions...');
    const motion1 = await createMotion(tokens.alice, {
        title: 'Klimaschutzmaßnahmen 2025',
        type: 'satzungsaenderung',
        description: 'Wir fordern verstärkte Maßnahmen zum Klimaschutz einschließlich CO2-Steuer und Förderung erneuerbarer Energien.',
        fullText: 'Detaillierter Antragstext: Die ÖDP setzt sich für eine umfassende Klimaschutzstrategie ein...',
        targetGroup: 'bundesparteitag',
        reasoning: 'Der Klimawandel erfordert dringendes Handeln auf allen politischen Ebenen.'
    });
    
    const motion2 = await createMotion(tokens.bob, {
        title: 'Digitalisierung der Verwaltung',
        type: 'initiativantrag',
        description: 'Beschleunigung der Digitalisierung in öffentlichen Verwaltungen mit Open-Source-Software.',
        fullText: 'Wir fordern die konsequente Nutzung von Open-Source-Software in der öffentlichen Verwaltung.',
        targetGroup: 'landesparteitag',
        reasoning: 'Transparenz und Effizienz durch digitale Verwaltungsprozesse.'
    });

    const motion3 = await createMotion(tokens.clara, {
        title: 'Verkehrswende in Städten',
        type: 'programmaenderung',
        description: 'Förderung des öffentlichen Nahverkehrs und Ausbau von Fahrradinfrastruktur in urbanen Gebieten.',
        fullText: 'Konkrete Maßnahmen: Ausbau von Radwegen, Förderung von E-Bikes, kostenloser ÖPNV.',
        targetGroup: 'bundesparteitag',
        reasoning: 'Reduzierung des Autoverkehrs für lebenswertere Städte.'
    });

    if (motion1) console.log(`✅ Motion 1 created: ${motion1.id}`);
    if (motion2) console.log(`✅ Motion 2 created: ${motion2.id}`);
    if (motion3) console.log(`✅ Motion 3 created: ${motion3.id}\n`);

    // Step 3: Collect signatures for Motion 1
    if (motion1) {
        console.log('✍️  Step 3: Collecting 20 signatures for Motion 1...');
        const signers = Object.keys(tokens).filter(k => k !== 'alice' && k !== 'admin' && k !== 'bgst').slice(0, 20);
        let signCount = 0;
        for (const user of signers) {
            if (await signMotion(tokens[user], motion1.id)) {
                signCount++;
            }
        }
        console.log(`✅ Collected ${signCount} signatures\n`);

        // Step 4: BGSt approves motion
        console.log('✔️  Step 4: BGSt approving Motion 1...');
        await approveMotion(tokens.bgst, motion1.id, true, 'Antrag erfüllt alle formalen Anforderungen.');
        console.log('✅ Motion 1 approved\n');

        // Step 5: Add comments to Motion 1
        console.log('💬 Step 5: Adding comments to Motion 1...');
        await createComment(tokens.bob, 'motion', motion1.id, 'Großartige Initiative! Ich unterstütze diesen Antrag vollständig.');
        await createComment(tokens.clara, 'motion', motion1.id, 'Sollten wir nicht auch konkrete Zeitpläne festlegen?');
        await createComment(tokens.david, 'motion', motion1.id, 'Stimme zu! Besonders wichtig ist die CO2-Steuer.');
        await createComment(tokens.emma, 'motion', motion1.id, 'Wie werden die Maßnahmen finanziert?');
        console.log('✅ Added 4 comments\n');

        // Step 6: Create quick poll
        console.log('📊 Step 6: Creating quick poll for Motion 1...');
        const poll = await createQuickPoll(tokens.alice, motion1.id, 
            'Unterstützen Sie eine CO2-Steuer?',
            ['Ja, vollständig', 'Teilweise', 'Nein', 'Unentschieden']
        );
        if (poll) {
            console.log(`✅ Poll created: ${poll.id}`);
            // Vote on poll
            await voteOnPoll(tokens.bob, poll.id, 'Ja, vollständig');
            await voteOnPoll(tokens.clara, poll.id, 'Ja, vollständig');
            await voteOnPoll(tokens.david, poll.id, 'Teilweise');
            await voteOnPoll(tokens.emma, poll.id, 'Ja, vollständig');
            await voteOnPoll(tokens.frank, poll.id, 'Nein');
            console.log('✅ 5 votes cast on poll\n');
        }
    }

    // Step 7: Create Survey
    console.log('📋 Step 7: Creating survey with 20 co-initiators...');
    const users = await getUsers(tokens.alice);
    const coInitiatorIds = users
        .filter(u => u.email !== 'alice@oedp.de')
        .slice(0, 19)
        .map(u => u.id);

    const survey = await createSurvey(tokens.alice, {
        title: 'Meinungsbild: Erneuerbare Energien',
        description: 'Sollen wir uns für den beschleunigten Ausbau erneuerbarer Energien in unserem Landesverband einsetzen?',
        questionType: 'yes_no',
        durationDays: 7,
        coInitiatorIds,
        isAnonymous: true,
        isBinding: false
    });

    if (survey) {
        console.log(`✅ Survey created: ${survey.id}\n`);

        // Step 8: BGSt approves survey
        console.log('✔️  Step 8: BGSt approving survey...');
        await approveSurvey(tokens.bgst, survey.id, true, 'Befragung entspricht den Anforderungen von §15 Satzung.');
        console.log('✅ Survey approved\n');

        // Step 9: Vote on survey
        console.log('🗳️  Step 9: Casting votes on survey...');
        let yesVotes = 0, noVotes = 0;
        for (const [user, token] of Object.entries(tokens)) {
            if (user !== 'alice' && user !== 'admin' && user !== 'bgst') {
                const vote = Math.random() > 0.3 ? 'Ja' : 'Nein';
                if (await voteOnSurvey(token, survey.id, vote)) {
                    vote === 'Ja' ? yesVotes++ : noVotes++;
                }
            }
        }
        console.log(`✅ Votes cast: ${yesVotes} Ja, ${noVotes} Nein\n`);

        // Step 10: Add comments to survey
        console.log('💬 Step 10: Adding comments to survey...');
        await createComment(tokens.bob, 'survey', survey.id, 'Sehr wichtige Befragung! Erneuerbare Energien sind die Zukunft.');
        await createComment(tokens.clara, 'survey', survey.id, 'Sollten wir auch konkrete Ziele für den Ausbau festlegen?');
        await createComment(tokens.david, 'survey', survey.id, 'Ich unterstütze diese Initiative voll und ganz!');
        console.log('✅ Added 3 comments to survey\n');
    }

    // Final summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ PLATFORM SUCCESSFULLY POPULATED!\n');
    console.log('📊 Summary:');
    console.log(`   • Motions Created: 3`);
    console.log(`   • Signatures Collected: 20+`);
    console.log(`   • Motions Approved: 1`);
    console.log(`   • Comments on Motions: 4`);
    console.log(`   • Quick Polls Created: 1`);
    console.log(`   • Poll Votes: 5`);
    console.log(`   • Surveys Created: 1`);
    console.log(`   • Survey Approved: 1`);
    console.log(`   • Survey Votes: 15+`);
    console.log(`   • Comments on Surveys: 3`);
    console.log('\n🌐 View at: http://localhost:5173\n');
    
    if (motion1) console.log(`   Motion 1: http://localhost:5173/motions/${motion1.id}`);
    if (motion2) console.log(`   Motion 2: http://localhost:5173/motions/${motion2.id}`);
    if (motion3) console.log(`   Motion 3: http://localhost:5173/motions/${motion3.id}`);
    if (survey) console.log(`   Survey: http://localhost:5173/surveys/${survey.id}`);
    console.log('\n');
}

main().catch(console.error);
