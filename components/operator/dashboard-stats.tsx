import { Card } from '@/components/ui/card'
import { Calendar, Users, TrendingUp, Award } from 'lucide-react'

interface DashboardStatItem {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
  color: 'primary' | 'secondary' | 'accent'
}

interface DashboardStatsProps {
  stats: DashboardStatItem[]
}

const colorClasses = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  accent: 'text-accent bg-accent/10',
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              {stat.trend && (
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
