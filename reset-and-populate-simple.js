const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const API = 'http://localhost:3001';

async function getUserIds() {
    const { stdout } = await execPromise(
        `docker exec oedp-md2-db psql -U postgres -d oedp_md2 -t -c "SELECT id, email FROM users WHERE email IN ('alice@oedp.de', 'bob@oedp.de', 'clara@oedp.de', 'david@oedp.de') ORDER BY email;"`
    );
    
    const users = {};
    stdout.trim().split('\n').forEach(line => {
        const [id, email] = line.trim().split('|').map(s => s.trim());
        const name = email.split('@')[0];
        users[name] = id;
    });
    
    return users;
}

async function run() {
    console.log('\n🔄 RESETTING AND POPULATING WITH NEW MOTION TYPES\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // Get user IDs from database
        console.log('1. Getting user IDs from database...');
        const userIds = await getUserIds();
        console.log('✅ User IDs retrieved\n');

        // Login as users
        console.log('2. Logging in as users...');
        const aliceToken = (await axios.post(`${API}/api/auth/login`, {
            email: 'alice@oedp.de', password: 'Test123!'
        })).data.data.token;
        
        const bobToken = (await axios.post(`${API}/api/auth/login`, {
            email: 'bob@oedp.de', password: 'Test123!'
        })).data.data.token;
        
        const claraToken = (await axios.post(`${API}/api/auth/login`, {
            email: 'clara@oedp.de', password: 'Test123!'
        })).data.data.token;
        
        console.log('✅ Users logged in\n');

        // Create new motions with different types
        console.log('3. Creating new motions with ÖDP types...\n');
        
        const newMotions = [
            {
                title: 'Änderung §10.1 - Mitgliederanträge',
                description: 'Anpassung der Regelungen für Mitgliederanträge zur Stärkung der direkten Demokratie',
                fullText: 'Der Bundesparteitag möge beschließen, §10.1 der Satzung wie folgt zu ändern:\n\n"Mitgliederanträge können von mindestens 80 Mitgliedern eingereicht werden. Die Antragsteller müssen eine Vertrauensperson und eine Ersatzperson benennen."\n\nBegründung: Diese Änderung stärkt die direkte Demokratie und ermöglicht mehr Mitgliederbeteiligung.',
                type: 'satzungsaenderung',
                legalReference: '§10.1',
                targetParagraph: '§10.1',
                targetSection: 'Satzung',
                targetGroup: 'Bundesparteitag',
                token: aliceToken,
                trustPersonId: userIds.bob,
                backupId: userIds.clara,
            },
            {
                title: 'Anpassung Mitgliedsbeiträge 2025',
                description: 'Erhöhung des Grundbeitrags und neue Ermäßigungsregelungen',
                fullText: 'Der Bundesparteitag möge beschließen:\n\n1. Der monatliche Grundbeitrag wird auf 12€ erhöht\n2. Ermäßigter Beitrag für Studierende: 6€\n3. Solidarbeitrag: mindestens 20€\n\nBegründung: Die Erhöhung ist notwendig zur Finanzierung unserer politischen Arbeit und entspricht der Inflationsentwicklung.',
                type: 'finanzordnung',
                targetSection: 'Finanzordnung',
                targetGroup: 'Bundesparteitag',
                token: bobToken,
                trustPersonId: userIds.clara,
                backupId: userIds.david,
            },
            {
                title: 'Klimaschutzplan 2025-2030',
                description: 'Umfassender Plan zur CO2-Neutralität bis 2030',
                fullText: 'Der Bundesparteitag möge beschließen:\n\nDie ÖDP setzt sich für folgende Klimaschutzmaßnahmen ein:\n\n1. Ausbau erneuerbarer Energien auf 100% bis 2030\n2. Kohleausstieg bis 2025\n3. Förderung öffentlicher Verkehrsmittel\n4. CO2-Steuer mit Rückerstattung an Bürger\n5. Verbot von Kurzstreckenflügen\n\nBegründung: Der Klimawandel erfordert sofortiges Handeln.',
                type: 'programmaenderung',
                targetSection: 'Bundesprogramm',
                targetGroup: 'Bundesparteitag',
                token: claraToken,
                trustPersonId: userIds.david,
                backupId: userIds.alice,
            },
            {
                title: 'Änderung GO BPT - Digitale Teilnahme',
                description: 'Ermöglichung digitaler Teilnahme am Bundesparteitag',
                fullText: 'Der Bundesparteitag möge beschließen, die Geschäftsordnung wie folgt zu ergänzen:\n\n"Mitglieder können digital am Bundesparteitag teilnehmen und abstimmen, sofern die technischen Voraussetzungen gegeben sind."\n\nBegründung: Digitale Teilnahme erhöht die Beteiligung und reduziert Reisekosten.',
                type: 'geschaeftsordnung',
                targetSection: 'GO BPT',
                targetGroup: 'Bundesparteitag',
                token: aliceToken,
                trustPersonId: userIds.bob,
                backupId: userIds.clara,
            },
            {
                title: 'Solidarität mit Klimaaktivisten',
                description: 'Unterstützung friedlicher Klimaproteste',
                fullText: 'Der Bundesparteitag erklärt seine Solidarität mit friedlichen Klimaaktivisten und verurteilt die zunehmende Kriminalisierung legitimen Protests.\n\nWir fordern:\n- Respekt für Versammlungsfreiheit\n- Verhältnismäßigkeit bei Polizeieinsätzen\n- Dialog statt Repression',
                type: 'entschliessung',
                targetGroup: 'Bundesparteitag',
                token: bobToken,
                trustPersonId: userIds.clara,
                backupId: userIds.david,
            },
            {
                title: 'Verkehrswende in Städten',
                description: 'Förderung nachhaltiger Mobilität in urbanen Räumen',
                fullText: 'Der Bundesparteitag möge beschließen:\n\nDie ÖDP setzt sich für eine umfassende Verkehrswende ein:\n\n1. Ausbau Radinfrastruktur\n2. Kostenloser ÖPNV\n3. Tempo 30 innerorts\n4. Parkraumbewirtschaftung\n5. Förderung E-Mobilität\n\nBegründung: Städte müssen lebenswerter werden.',
                type: 'programmaenderung',
                targetSection: 'Bundesprogramm',
                targetGroup: 'Bundesparteitag',
                token: claraToken,
                trustPersonId: userIds.alice,
                backupId: userIds.bob,
            },
        ];

        const createdMotions = [];
        
        for (const motionData of newMotions) {
            try {
                const { token, trustPersonId, backupId, ...payload } = motionData;
                
                // Create motion
                const response = await axios.post(`${API}/api/motions`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const motion = response.data.data.motion;
                console.log(`   ✓ Created: ${motion.title} (${payload.type})`);
                
                // Update with trust persons
                await axios.put(`${API}/api/motions/${motion.id}`, {
                    ...payload,
                    trustPersonId,
                    backupTrustPersonId: backupId,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Publish for signatures
                await axios.post(`${API}/api/motions/${motion.id}/publish`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log(`   ✓ Published: ${motion.title}`);
                createdMotions.push(motion);
                
            } catch (error) {
                console.log(`   ❌ Error creating motion: ${motionData.title}`);
                console.log(`      ${error.response?.data?.message || error.message}`);
            }
        }
        
        console.log(`\n✅ Created ${createdMotions.length} motions\n`);

        // Create new surveys
        console.log('4. Creating new surveys...\n');
        
        const newSurveys = [
            {
                title: 'Atomausstieg beschleunigen?',
                description: 'Soll Deutschland den Atomausstieg auf 2024 vorziehen?',
                questionType: 'yes_no',
                token: aliceToken,
            },
            {
                title: 'Priorität Verkehrspolitik',
                description: 'Welche Verkehrspolitik soll Priorität haben?',
                questionType: 'single_choice',
                options: ['ÖPNV-Ausbau', 'Radinfrastruktur', 'E-Mobilität', 'Tempolimit'],
                token: bobToken,
            },
            {
                title: 'Energiewende Maßnahmen',
                description: 'Welche Maßnahmen zur Energiewende unterstützen Sie?',
                questionType: 'multiple_choice',
                options: ['Windkraft', 'Solarenergie', 'Wasserkraft', 'Biogas', 'Geothermie'],
                token: claraToken,
            },
            {
                title: 'Ideen für Klimaschutzprojekte',
                description: 'Welche Klimaschutzprojekte sollte die ÖDP fördern?',
                questionType: 'free_text',
                token: aliceToken,
            },
        ];

        const createdSurveys = [];
        
        for (const surveyData of newSurveys) {
            try {
                const { token, options, ...payload } = surveyData;
                
                const surveyPayload = {
                    ...payload,
                    ...(options && { options: options.map((text, index) => ({ 
                        text, 
                        order: index 
                    })) }),
                };
                
                const response = await axios.post(`${API}/api/surveys`, surveyPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const survey = response.data.data.survey;
                console.log(`   ✓ Created: ${survey.title} (${payload.questionType})`);
                createdSurveys.push(survey);
                
            } catch (error) {
                console.log(`   ❌ Error creating survey: ${surveyData.title}`);
                console.log(`      ${error.response?.data?.message || error.message}`);
            }
        }
        
        console.log(`\n✅ Created ${createdSurveys.length} surveys\n`);

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ POPULATION COMPLETE!\n');
        console.log(`📊 Summary:`);
        console.log(`   - Created: ${createdMotions.length} new motions`);
        console.log(`   - Created: ${createdSurveys.length} new surveys\n`);
        
        console.log('📋 New Motion Types:');
        const typeCounts = {};
        createdMotions.forEach(m => {
            typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
        });
        Object.entries(typeCounts).forEach(([type, count]) => {
            console.log(`   - ${type}: ${count}`);
        });
        
        console.log('\n🌐 Access the platform:');
        console.log('   Frontend: http://localhost:5173');
        console.log('   Login as: bob@oedp.de / Test123!');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

run();
