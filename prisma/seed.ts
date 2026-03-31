import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default integrations
  const integrations = [
    {
      name: 'OpenAI (ChatGPT)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      apiEndpoint: 'https://api.openai.com/v1',
      authType: 'api_key',
      isActive: true,
    },
    {
      name: 'Anthropic (Claude)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Anthropic.png',
      apiEndpoint: 'https://api.anthropic.com/v1',
      authType: 'api_key',
      isActive: true,
    },
    {
      name: 'ElevenLabs',
      logo: 'https://elevenlabs.io/logo.png',
      apiEndpoint: 'https://api.elevenlabs.io/v1',
      authType: 'api_key',
      isActive: true,
    },
    {
      name: 'Jasper',
      logo: 'https://jasper.ai/logo.png',
      apiEndpoint: 'https://api.jasper.ai/v1',
      authType: 'api_key',
      isActive: true,
    },
    {
      name: 'Midjourney',
      logo: 'https://midjourney.com/logo.png',
      apiEndpoint: 'https://api.midjourney.com/v1',
      authType: 'oauth2',
      isActive: true,
    },
  ];

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: { name: integration.name },
      update: integration,
      create: integration,
    });
    console.log(`✅ Added: ${integration.name}`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
