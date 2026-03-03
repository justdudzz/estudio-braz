import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
async function resetAdmin() {
    const email = 'diretor@studiobraz.com';
    // Password obrigatória via variável de ambiente (#8)
    const plainPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!plainPassword) {
        console.error('❌ ERRO: Defina ADMIN_SEED_PASSWORD na variável de ambiente.');
        console.error('   Exemplo: ADMIN_SEED_PASSWORD=MinhaPass123! npx tsx src/scripts/resetAdmin.ts');
        process.exit(1);
    }
    if (plainPassword.length < 12) {
        console.error('❌ ERRO: Password deve ter no mínimo 12 caracteres.');
        process.exit(1);
    }
    console.log('A forjar a nova Chave Mestra...');
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    await prisma.user.upsert({
        where: { email: email },
        update: { password: hashedPassword, role: 'admin' },
        create: {
            email: email,
            password: hashedPassword,
            role: 'admin'
        }
    });
    console.log('✅ CHAVE MESTRA FORÇADA COM SUCESSO!');
    console.log(`✉️  Email: ${email}`);
    console.log('🔒 Password: [PROTEGIDA — definida via env var]');
}
resetAdmin()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
