'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuthRequired } from '@/components/auth/auth-required-provider'
import { UserRole } from '@/lib/types'
import { Compass, LogOut, Menu, Settings, Sparkles, User } from 'lucide-react'

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
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { sessionUser, setSessionUser, openAuthModal } = useAuthRequired()

  const isOperatorPortal = pathname.includes('/operator')
  const isHomePage = pathname === '/'
  const effectiveName = sessionUser?.name || userName
  const effectiveRole = sessionUser?.role || userRole
  const isSignedIn = Boolean(sessionUser)
  const profileHref = effectiveRole === 'operator' ? '/operator/profile' : '/profile'
  const settingsHref = effectiveRole === 'operator' ? '/operator/settings' : '/settings'

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
  }, [setSessionUser])

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
    : isHomePage
      ? [
          { label: 'Destinations', href: '/#destinations' },
          { label: 'Experiences', href: '/#browse-experiences' },
          { label: 'How It Works', href: '/#how-it-works' },
          { label: 'About', href: '/#about' },
        ]
    : isSignedIn
      ? [
          { label: 'Explore', href: '/experiences' },
          { label: 'My Bookings', href: '/bookings' },
          { label: 'Payments', href: '/payments' },
          { label: 'Saved', href: '/saved' },
        ]
      : [
          { label: 'Explore', href: '/experiences' },
          { label: 'Travel Quiz', href: '/quiz' },
        ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between py-3">
          <Link
            href="/"
            className="min-w-0 flex items-center gap-3 font-bold text-xl text-primary transition-colors hover:text-primary/90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-base text-primary-foreground shadow-sm">
              A
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
                AfriConnect
              </div>
              <div className="hidden text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Curated cultural stays
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === link.href ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isOperatorPortal && !isSignedIn && !isHomePage && (
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
              >
                Browse freely. Book when ready.
              </Badge>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isOperatorPortal &&
              (isSignedIn ? (
                <Button variant="ghost" size="sm" asChild className="hidden rounded-full sm:flex">
                  <Link href="/operator/dashboard">Operator Portal</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden rounded-full sm:flex"
                >
                  <Link href="/operator/dashboard">Host on AfriConnect</Link>
                </Button>
              ))}

            {sessionUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-muted-foreground">
                    {effectiveName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileHref}>
                      <User className="mr-2 h-4 w-4" />
                      {effectiveRole === 'operator' ? 'Operator Profile' : 'Profile'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={settingsHref}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {isSigningOut ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    openAuthModal({
                      title: 'Sign in to continue',
                      description:
                        'Access saved experiences, secure checkout, and host messaging without leaving your current page.',
                    })
                  }
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="rounded-full px-5"
                  onClick={() =>
                    openAuthModal({
                      title: 'Create your AfriConnect session',
                      description:
                        'Start building a shortlist now and unlock one-click booking when you find the right experience.',
                    })
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  Start Planning
                </Button>
              </div>
            )}

            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[88vw] max-w-sm border-border/70 px-5">
                  <SheetHeader className="border-b border-border/70 pb-4 text-left">
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <nav className="space-y-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>

                    {!isOperatorPortal && (
                      <div className="rounded-3xl border border-border/70 bg-muted/40 p-4">
                        <p className="text-sm font-semibold text-foreground">
                          {isSignedIn ? 'Operator tools' : 'Host on AfriConnect'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {isSignedIn
                            ? 'Manage your listings and bookings from the operator portal.'
                            : 'Share your cultural experiences with travelers looking for meaningful local experiences.'}
                        </p>
                        <Button asChild className="mt-4 w-full rounded-full">
                          <Link href="/operator/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            {isSignedIn ? 'Open Operator Portal' : 'Become a Host'}
                          </Link>
                        </Button>
                      </div>
                    )}

                    {sessionUser ? (
                      <div className="space-y-3 rounded-3xl border border-border/70 bg-card p-4">
                        <div>
                          <p className="font-semibold text-foreground">{effectiveName}</p>
                          <p className="text-sm text-muted-foreground">
                            {effectiveRole === 'operator' ? 'Operator account' : 'Traveler account'}
                          </p>
                        </div>
                        <Button asChild variant="outline" className="w-full rounded-full">
                          <Link href={profileHref} onClick={() => setMobileMenuOpen(false)}>
                            Profile
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full rounded-full">
                          <Link href={settingsHref} onClick={() => setMobileMenuOpen(false)}>
                            Settings
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                        >
                          {isSigningOut ? 'Logging out...' : 'Logout'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            openAuthModal({
                              title: 'Sign in to continue',
                              description:
                                'Unlock saved experiences, host messaging, and secure booking from any page.',
                            })
                          }}
                        >
                          <Compass className="h-4 w-4" />
                          Sign In
                        </Button>
                        <Button
                          className="w-full rounded-full"
                          onClick={() => {
                            setMobileMenuOpen(false)
                            openAuthModal({
                              title: 'Create your AfriConnect session',
                              description:
                                'Start building a shortlist now and unlock one-click booking when you find the right experience.',
                            })
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                          Start Planning
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
