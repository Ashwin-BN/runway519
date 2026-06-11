import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base = `inline-flex items-center justify-center gap-2 font-medium 
                rounded-xl transition-colors disabled:opacity-60 
                disabled:cursor-not-allowed`

  const variants = {
    primary: 'bg-pink-600 text-white hover:bg-pink-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  )
}
