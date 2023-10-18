import { Search } from '@/components/Search.tsx';
import { UserNav } from '@/components/UserNav.tsx';
import logoipsum from '@/assets/logoipsum.svg';
import { useSession } from '@/hooks/useSession.ts';

export function TopNav({ user }) {
    return (
        <header className="border-b">
            <div className="flex h-16 items-center px-4">
                <img src={logoipsum} alt="logo placeholder" />
                <div className="ml-auto flex items-center space-x-4">
                    <Search />
                    {user && <UserNav user={user} />}
                </div>
            </div>
        </header>
    );
}
