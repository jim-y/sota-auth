import { useOutletContext } from 'react-router-dom';

export default function HomePage() {
    const { user } = useOutletContext();
    return <>Hello {user.username}</>;
}
