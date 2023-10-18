import { TopNav } from '@/components/TopNav';
import { Outlet, useLoaderData } from 'react-router-dom';

function Root() {
    const user = useLoaderData();
    return (
        <main className="flex-col md:flex">
            <TopNav user={user} />
            <Outlet context={{ user }} />
        </main>
    );
}

Root.loader = async function () {
    const res = await fetch('/api/auth/session');
    if (res.status === 401) {
        throw new Response('Unauthenticated', { status: 401 });
    }
    return res.json();
};

export default Root;
