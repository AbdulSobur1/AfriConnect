'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, LogOut, User, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { UserRole } from '@/lib/types'

interface SessionUser {
  userId: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface HeaderProps {
  userRole?: 'tourist' | 'operator'
  userName?: string
}

export function Header({ userRole = 'tourist', userName = 'User' }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const isOperatorPortal = pathname.includes('/operator')
  const effectiveName = sessionUser?.name || userName
  const effectiveRole = sessionUser?.role || userRole

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const result = (await response.json()) as { session?: SessionUser | null }

        if (!cancelled) {
          setSessionUser(result.session ?? null)
        }
      } catch {
        if (!cancelled) {
          setSessionUser(null)
        }
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      })
      setSessionUser(null)
      router.push('/')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  const navLinks = isOperatorPortal
    ? [
        { label: 'Dashboard', href: '/operator/dashboard' },
        { label: 'Experiences', href: '/operator/experiences' },
        { label: 'Bookings', href: '/operator/bookings' },
      ]
    : [
        { label: 'Explore', href: '/experiences' },
        { label: 'My Bookings', href: '/bookings' },
        { label: 'Payments', href: '/payments' },
        { label: 'Saved', href: '/saved' },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/90 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              A
            </div>
            <span className="hidden sm:inline">AfriConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Switch Portal Link */}
            {!isOperatorPortal && (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/operator/dashboard">Operator Portal</Link>
              </Button>
            )}

            {sessionUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-muted-foreground">
                    {effectiveName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    {effectiveRole === 'operator' ? 'Operator Profile' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href={`/sign-in?redirectTo=${encodeURIComponent(pathname || '/')}`}>Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  {!isOperatorPortal && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/operator/dashboard">Operator Portal</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  {sessionUser ? (
                    <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                      {isSigningOut ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href={`/sign-in?redirectTo=${encodeURIComponent(pathname || '/')}`}>
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
