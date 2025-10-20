import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import bcrypt from 'bcrypt';

async function createTestUsers() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    const testUsers = [
      {
        email: 'admin@oedp.de',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        memberId: 'ADMIN-001',
        role: 'admin',
        landesverband: 'Bundesverband',
      },
      {
        email: 'bgst@oedp.de',
        password: 'BGSt123!',
        firstName: 'BGSt',
        lastName: 'Member',
        memberId: 'BGST-001',
        role: 'bgst',
        landesverband: 'Bundesverband',
      },
      {
        email: 'alice@oedp.de',
        password: 'Test123!',
        firstName: 'Alice',
        lastName: 'Müller',
        memberId: 'BW-2024-001',
        role: 'member',
        landesverband: 'Baden-Württemberg',
      },
      {
        email: 'bob@oedp.de',
        password: 'Test123!',
        firstName: 'Bob',
        lastName: 'Schmidt',
        memberId: 'BY-2024-002',
        role: 'member',
        landesverband: 'Bayern',
      },
      {
        email: 'clara@oedp.de',
        password: 'Test123!',
        firstName: 'Clara',
        lastName: 'Weber',
        memberId: 'BE-2024-003',
        role: 'member',
        landesverband: 'Berlin',
      },
      {
        email: 'david@oedp.de',
        password: 'Test123!',
        firstName: 'David',
        lastName: 'Fischer',
        memberId: 'HH-2024-004',
        role: 'member',
        landesverband: 'Hamburg',
      },
      {
        email: 'emma@oedp.de',
        password: 'Test123!',
        firstName: 'Emma',
        lastName: 'Meyer',
        memberId: 'HE-2024-005',
        role: 'member',
        landesverband: 'Hessen',
      },
      {
        email: 'frank@oedp.de',
        password: 'Test123!',
        firstName: 'Frank',
        lastName: 'Wagner',
        memberId: 'NW-2024-006',
        role: 'member',
        landesverband: 'Nordrhein-Westfalen',
      },
      {
        email: 'greta@oedp.de',
        password: 'Test123!',
        firstName: 'Greta',
        lastName: 'Becker',
        memberId: 'RP-2024-007',
        role: 'member',
        landesverband: 'Rheinland-Pfalz',
      },
      {
        email: 'hans@oedp.de',
        password: 'Test123!',
        firstName: 'Hans',
        lastName: 'Hoffmann',
        memberId: 'SN-2024-008',
        role: 'member',
        landesverband: 'Sachsen',
      },
      {
        email: 'inge@oedp.de',
        password: 'Test123!',
        firstName: 'Inge',
        lastName: 'Koch',
        memberId: 'SH-2024-009',
        role: 'member',
        landesverband: 'Schleswig-Holstein',
      },
      {
        email: 'jan@oedp.de',
        password: 'Test123!',
        firstName: 'Jan',
        lastName: 'Richter',
        memberId: 'TH-2024-010',
        role: 'member',
        landesverband: 'Thüringen',
      },
      // Additional members for testing (total 20+ for survey creation)
      {
        email: 'karl@oedp.de',
        password: 'Test123!',
        firstName: 'Karl',
        lastName: 'Schneider',
        memberId: 'BW-2024-011',
        role: 'member',
        landesverband: 'Baden-Württemberg',
      },
      {
        email: 'laura@oedp.de',
        password: 'Test123!',
        firstName: 'Laura',
        lastName: 'Zimmermann',
        memberId: 'BY-2024-012',
        role: 'member',
        landesverband: 'Bayern',
      },
      {
        email: 'max@oedp.de',
        password: 'Test123!',
        firstName: 'Max',
        lastName: 'Krüger',
        memberId: 'BE-2024-013',
        role: 'member',
        landesverband: 'Berlin',
      },
      {
        email: 'nina@oedp.de',
        password: 'Test123!',
        firstName: 'Nina',
        lastName: 'Braun',
        memberId: 'HH-2024-014',
        role: 'member',
        landesverband: 'Hamburg',
      },
      {
        email: 'otto@oedp.de',
        password: 'Test123!',
        firstName: 'Otto',
        lastName: 'Lange',
        memberId: 'HE-2024-015',
        role: 'member',
        landesverband: 'Hessen',
      },
      {
        email: 'paula@oedp.de',
        password: 'Test123!',
        firstName: 'Paula',
        lastName: 'Wolf',
        memberId: 'NW-2024-016',
        role: 'member',
        landesverband: 'Nordrhein-Westfalen',
      },
      {
        email: 'quinn@oedp.de',
        password: 'Test123!',
        firstName: 'Quinn',
        lastName: 'Schröder',
        memberId: 'RP-2024-017',
        role: 'member',
        landesverband: 'Rheinland-Pfalz',
      },
      {
        email: 'robert@oedp.de',
        password: 'Test123!',
        firstName: 'Robert',
        lastName: 'Neumann',
        memberId: 'SN-2024-018',
        role: 'member',
        landesverband: 'Sachsen',
      },
      {
        email: 'sarah@oedp.de',
        password: 'Test123!',
        firstName: 'Sarah',
        lastName: 'Schwarz',
        memberId: 'SH-2024-019',
        role: 'member',
        landesverband: 'Schleswig-Holstein',
      },
      {
        email: 'tom@oedp.de',
        password: 'Test123!',
        firstName: 'Tom',
        lastName: 'Zimmermann',
        memberId: 'TH-2024-020',
        role: 'member',
        landesverband: 'Thüringen',
      },
      {
        email: 'ulrike@oedp.de',
        password: 'Test123!',
        firstName: 'Ulrike',
        lastName: 'Hartmann',
        memberId: 'BW-2024-021',
        role: 'member',
        landesverband: 'Baden-Württemberg',
      },
    ];

    console.log('\n🔄 Creating test users...\n');

    for (const userData of testUsers) {
      // Check if user already exists
      const existing = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
        membershipStatus: 'active',
        emailVerified: true,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(`✅ Created: ${userData.email} - ${userData.firstName} ${userData.lastName} (${userData.role})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test users created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Test Credentials (all use same password):');
    console.log('   Password for all users: Test123!');
    console.log('\n👤 Admin:    admin@oedp.de / Admin123!');
    console.log('👤 BGSt:     bgst@oedp.de / BGSt123!');
    console.log('👤 Members:  alice@oedp.de, bob@oedp.de, clara@oedp.de, etc.');
    console.log('\n🌐 Login at: http://localhost:5173/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
