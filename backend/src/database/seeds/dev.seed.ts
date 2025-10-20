import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../config/database';
import { User, UserRole, MembershipStatus } from '../../entities/User.entity';
import { Motion, MotionType, MotionStatus } from '../../entities/Motion.entity';
import { logger } from '../../utils/logger';

async function seed() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected for seeding');

    const userRepository = AppDataSource.getRepository(User);
    const motionRepository = AppDataSource.getRepository(Motion);

    // Clear existing data (development only!)
    await motionRepository.delete({});
    await userRepository.delete({});
    logger.info('Existing data cleared');

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    // Create admin user
    const admin = userRepository.create({
      email: 'admin@oedp.de',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      memberId: 'ADM-001',
      role: UserRole.ADMIN,
      membershipStatus: MembershipStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
      landesverband: 'Bayern',
      kreisverband: 'München',
      city: 'München',
      postalCode: '80331',
    });
    await userRepository.save(admin);
    logger.info('Admin user created: admin@oedp.de / Password123!');

    // Create BGSt user
    const bgst = userRepository.create({
      email: 'bgst@oedp.de',
      password: hashedPassword,
      firstName: 'Bundesgeschäftsstelle',
      lastName: 'Staff',
      memberId: 'BGS-001',
      role: UserRole.BGST,
      membershipStatus: MembershipStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    });
    await userRepository.save(bgst);
    logger.info('BGSt user created: bgst@oedp.de / Password123!');

    // Create BAntrK user
    const bantrk = userRepository.create({
      email: 'bantrk@oedp.de',
      password: hashedPassword,
      firstName: 'Antragskommission',
      lastName: 'Member',
      memberId: 'BAN-001',
      role: UserRole.BANTRK,
      membershipStatus: MembershipStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    });
    await userRepository.save(bantrk);
    logger.info('BAntrK user created: bantrk@oedp.de / Password123!');

    // Create regular members
    const members = [];
    for (let i = 1; i <= 100; i++) {
      const member = userRepository.create({
        email: `member${i}@oedp.de`,
        password: hashedPassword,
        firstName: `Member`,
        lastName: `${i}`,
        memberId: `MEM-${String(i).padStart(3, '0')}`,
        role: UserRole.MEMBER,
        membershipStatus: MembershipStatus.ACTIVE,
        isActive: true,
        emailVerified: true,
        landesverband: i % 2 === 0 ? 'Bayern' : 'Nordrhein-Westfalen',
        kreisverband: i % 2 === 0 ? 'München' : 'Köln',
      });
      members.push(member);
    }
    await userRepository.save(members);
    logger.info(`Created ${members.length} member users`);

    // Create sample motions
    const motion1 = motionRepository.create({
      title: 'Förderung erneuerbarer Energien in ländlichen Gebieten',
      description:
        'Antrag zur verstärkten Unterstützung von Solar- und Windenergieprojekten in ländlichen Regionen.',
      fullText: `Der Bundesparteitag möge beschließen:

1. Die ÖDP setzt sich für eine verstärkte Förderung erneuerbarer Energien in ländlichen Gebieten ein.

2. Es sollen kommunale Energiegenossenschaften unterstützt werden, die Bürgern ermöglichen, an der Energiewende teilzuhaben.

3. Die Bundesregierung wird aufgefordert, entsprechende Förderprogramme aufzulegen.

Begründung:
Ländliche Gebiete haben großes Potenzial für erneuerbare Energien, werden aber oft benachteiligt. Dieser Antrag zielt darauf ab, diese Ungleichheit zu beseitigen.`,
      type: MotionType.SACHANTRAG,
      status: MotionStatus.COLLECTING,
      creatorId: members[0].id,
      trustPersonId: members[1].id,
      backupTrustPersonId: members[2].id,
      signatureCount: 45,
      isPublic: true,
      tags: ['Energie', 'Klimaschutz', 'Ländliche Entwicklung'],
    });
    await motionRepository.save(motion1);

    const motion2 = motionRepository.create({
      title: 'Verbesserung der Transparenz bei Parteifinanzen',
      description: 'Antrag zur Einführung strengerer Transparenzregeln für Parteispenden.',
      fullText: `Der Bundesparteitag möge beschließen:

1. Die ÖDP führt eine vollständige Online-Offenlegung aller Spenden über 500 Euro ein.

2. Quartalsmäßige Berichte über Einnahmen und Ausgaben werden veröffentlicht.

3. Eine unabhängige Prüfkommission wird eingerichtet.

Begründung:
Transparenz ist ein Kernwert der ÖDP. Mit diesem Antrag setzen wir neue Standards.`,
      type: MotionType.SATZUNGSAENDERUNG,
      status: MotionStatus.SUBMITTED,
      creatorId: members[5].id,
      trustPersonId: members[6].id,
      signatureCount: 82,
      isPublic: true,
      submittedAt: new Date(),
      targetParagraph: '§8 Finanzen',
      tags: ['Transparenz', 'Finanzen', 'Satzung'],
    });
    await motionRepository.save(motion2);

    const motion3 = motionRepository.create({
      title: 'Stärkung der Biodiversität in urbanen Räumen',
      description: 'Initiative zur Förderung von Grünflächen und Biodiversität in Städten.',
      fullText: `Der Bundesparteitag möge beschließen:

1. Kommunen sollen verpflichtet werden, mindestens 30% ihrer Fläche als Grünflächen auszuweisen.

2. Förderung von Dach- und Fassadenbegrünung.

3. Schaffung von Biotopkorridoren zur Vernetzung von Lebensräumen.

Begründung:
Städtische Biodiversität ist essentiell für Lebensqualität und Klimaanpassung.`,
      type: MotionType.PROGRAMMAENDERUNG,
      status: MotionStatus.DRAFT,
      creatorId: members[10].id,
      signatureCount: 0,
      isPublic: false,
      tags: ['Biodiversität', 'Stadtentwicklung', 'Umweltschutz'],
    });
    await motionRepository.save(motion3);

    logger.info('Sample motions created');
    logger.info('✅ Seeding completed successfully');

    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
