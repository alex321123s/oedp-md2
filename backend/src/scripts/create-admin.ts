import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@oedp.de' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@oedp.de');
      console.log('🔑 Password: Admin123!');
      await AppDataSource.destroy();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create admin user
    const admin = userRepository.create({
      email: 'admin@oedp.de',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      memberId: 'ADMIN-001',
      role: 'admin',
      membershipStatus: 'active',
      landesverband: 'Bundesverband',
      emailVerified: true,
      isActive: true,
    });

    await userRepository.save(admin);

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@oedp.de');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/login');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
