import { Menu, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import DashboardHeaderProfileDropdown from "./DashboardHeaderProfileDropdown"
import { Badge } from "@/components/ui/badge"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardHeaderProps {
    readonly plan: string;
    readonly page: string;
    readonly setPage: (page: string) => void;
    readonly pagesList: { name: string, href: string, current: boolean }[];
    readonly access_level: 'user' | 'admin';
    readonly user_email: string;
}

export default function DashboardHeader({ plan, page, setPage, pagesList, access_level, user_email }: DashboardHeaderProps) {

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <div className="mr-4 hidden md:flex">
                    <Link className="mr-2 flex items-center space-x-2" href="">
                        <Image src="/logo.png" alt="logo" width={25} height={25} />
                    </Link>
                    <Suspense fallback={<Badge variant="outline" className="mr-2"><Skeleton className="w-[50px] h-[20px] rounded-full" /></Badge>}>
                        <Badge variant="outline" className="mr-2">{plan}</Badge>
                    </Suspense>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {

                            pagesList.map((pageItem) => (
                                <button
                                    key={pageItem.name}
                                    onClick={() => {
                                        setPage(pageItem.name)
                                    }}
                                    className={`transition-colors hover:text-foreground/80  ${page === pageItem.name ? "text-foreground" : "text-foreground/60"
                                        }`}
                                >
                                    {pageItem.name}
                                </button>
                            ))

                        }
                    </nav>
                </div>
                <Button variant="outline" size="icon" className="mr-2 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">

                    <DashboardHeaderProfileDropdown access_level={access_level} user_email={user_email} />
                </div>
            </div>
        </header>
    )
}