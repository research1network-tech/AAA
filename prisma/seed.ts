import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية seeding...')

  const adminEmail = process.env.ADMIN_EMAIL || 'jzhalk3@gmail.com'

  // التحقق من وجود المدير
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    // إنشاء حساب المدير
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'مدير المنصة',
        role: UserRole.ADMIN,
        isActive: true,
        lastLogin: new Date(),
      }
    })

    // إنشاء إعدادات المدير
    await prisma.adminSetting.create({
      data: {
        userId: admin.id,
        platformName: 'ميم تلي لتسويق',
        primaryColor: '#2563EB',
        secondaryColor: '#7C3AED',
        rateLimitMax: 100,
        rateLimitWindow: 60000,
        isRegistrationOpen: true,
        maintenanceMode: false,
      }
    })

    console.log(`✅ تم إنشاء حساب المدير: ${adminEmail}`)
  } else {
    console.log(`✅ حساب المدير موجود بالفعل: ${adminEmail}`)
  }

  // إعدادات النظام الأساسية
  const systemSettings = [
    { key: 'platform_name', value: 'ميم تلي لتسويق', description: 'اسم المنصة' },
    { key: 'platform_description', value: 'منصة متخصصة في إدارة حسابات Telegram والتسويق الاحترافي', description: 'وصف المنصة' },
    { key: 'default_language', value: 'ar', description: 'اللغة الافتراضية' },
    { key: 'telegram_rate_limit', value: '30', description: 'حد الإرسال في الدقيقة' },
  ]

  for (const setting of systemSettings) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key }
    })
    if (!existing) {
      await prisma.systemSetting.create({
        data: setting
      })
    }
  }

  console.log('✅ تم إعداد إعدادات النظام')
  console.log('🎉 اكتملت عملية seeding بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
