'use client'

import { CheckCircle, Award, Zap } from 'lucide-react'

interface AuthenticityBadgeProps {
  badge: 'verified' | 'emerging' | 'certified'
  score?: number
}

export function AuthenticityBadge({ badge, score }: AuthenticityBadgeProps) {
  const badgeConfig = {
    verified: {
      icon: CheckCircle,
      label: 'Verified Operator',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    certified: {
      icon: Award,
      label: 'Certified Authentic',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    emerging: {
      icon: Zap,
      label: 'Emerging Guide',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  }

  const config = badgeConfig[badge]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      {score && <span className="text-xs text-muted-foreground ml-1">{score}%</span>}
    </div>
  )
}
