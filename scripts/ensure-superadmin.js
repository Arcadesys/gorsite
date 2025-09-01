// Usage: node scripts/ensure-superadmin.js [email]
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.argv[2] || process.env.SUPERADMIN_EMAIL
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  if (!email) throw new Error('Provide email as arg or SUPERADMIN_EMAIL')
  const admin = createClient(url, key, { auth: { persistSession: false } })

  // Find existing by listUsers
  async function findByEmail(e) {
    let page = 1
    const perPage = 200
    for (let i = 0; i < 10; i++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      const u = data.users.find((u) => (u.email || '').toLowerCase() === e.toLowerCase())
      if (u) return u
      if (data.users.length < perPage) break
      page++
    }
    return null
  }

  let user = await findByEmail(email)
  if (!user) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { is_admin: true, role: 'ADMIN' },
      app_metadata: { roles: ['admin'] },
    })
    if (error) throw error
    user = data.user
    console.log('Invited user', user.id)
  } else {
    console.log('Found existing user', user.id)
  }

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { is_admin: true, role: 'ADMIN' },
    app_metadata: { roles: ['admin'] },
  })
  if (updErr) throw updErr
  console.log('Ensured admin role for', email)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

