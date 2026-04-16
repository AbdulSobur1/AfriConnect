import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                A
              </div>
              <div>
                <div className="font-semibold text-foreground">AfriConnect</div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Cultural travel
                </div>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Discover and book cultural experiences hosted by local experts across Africa.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Explore
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/experiences" className="transition-colors hover:text-primary">
                  Experiences
                </Link>
              </li>
              <li>
                <Link href="/#destinations" className="transition-colors hover:text-primary">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-primary">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/#about" className="transition-colors hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@africonnect.com"
                  className="transition-colors hover:text-primary"
                >
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  X
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/70 pt-6 text-sm text-muted-foreground">
          <p>&copy; 2026 AfriConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
