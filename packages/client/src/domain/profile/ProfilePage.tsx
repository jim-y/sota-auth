import { NavLink, useLocation, useOutletContext, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
    {
        title: 'Sign-In Options',
        href: '/profile',
    },
    {
        title: 'Integrations',
        href: '/profile/integrations',
    },
    {
        title: 'Settings',
        href: '/profile/settings',
    },
];

const ProfilePage = () => {
    const { user } = useOutletContext<any>();
    const location = useLocation();

    return (
        <main className="hidden space-y-6 p-10 pb-16 md:block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">Manage your user settings and your sign-in options.</p>
            </div>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1')}>
                        {sidebarNavItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    buttonVariants({ variant: 'ghost' }),
                                    location.pathname === item.href
                                        ? 'bg-muted hover:bg-muted'
                                        : 'hover:bg-transparent hover:underline',
                                    'justify-start'
                                )}
                            >
                                {item.title}
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    <Outlet context={{ user }} />
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
