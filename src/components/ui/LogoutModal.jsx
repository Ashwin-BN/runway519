import { LogOut, Tag } from 'lucide-react'
import Button from './Button'

export default function LogoutModal({ onConfirm, onCancel, userName }) {
  const firstName = userName?.split(' ')[0] ?? 'Associate'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center
                    justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-brand-surface rounded-2xl shadow-2xl
                      border border-gray-100 dark:border-brand-border
                      w-full max-w-sm overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-teal
                        to-brand-tealLight" />

        <div className="p-6">

          {/* Icon */}
          <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex
                          items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-brand-teal" />
          </div>

          {/* Message */}
          <h3 className="text-lg font-bold text-gray-800 dark:text-white
                         text-center mb-2">
            Stepping off the floor, {firstName}?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center
                        leading-relaxed">
            Your inventory will be right here when you're back.
            Any unsaved changes will be lost.
          </p>

          {/* Slogan */}
          <p className="text-xs text-brand-teal text-center mt-3 italic
                        font-medium">
            See More. Sell Smarter.
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
            >
              Stay on Floor
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-gray-800 hover:bg-gray-900
                         dark:bg-brand-border dark:hover:bg-brand-navyBorder"
              onClick={onConfirm}
            >
              <LogOut size={15} />
              Sign Out
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
