const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700 border border-purple-200',
  supervisor: 'bg-blue-100 text-blue-700 border border-blue-200',
  markdown: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  associate: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const ROLE_LABELS = {
  admin: '👑 Admin',
  supervisor: '🔷 Supervisor',
  markdown: '🏷️ Markdown',
  associate: '👤 Associate',
}

export default function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-xs font-medium ${ROLE_STYLES[role] ?? ROLE_STYLES.associate}`}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}
