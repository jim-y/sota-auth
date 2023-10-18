import classes from './two-factor.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';

export default function TwoFactorLoginPage() {
    return (
        <main className={classes.twoFactorPage}>
            <Card className={classes.twoFactorContent}>
                <CardHeader className="mb-4">
                    <CardTitle className="text-center">Just one more step</CardTitle>
                    <CardDescription className="text-center">
                        Identify yourself by reading the token from your authenticator app
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action="/api/auth/two-factor" method="post">
                        <Input
                            className="mb-4"
                            type="text"
                            name="token"
                            placeholder="Code"
                            minLength={6}
                            maxLength={6}
                            required
                            autoFocus
                        />
                        <Button type="submit">Continue</Button>
                    </form>
                </CardContent>
                <CardFooter className="flex items-center justify-center">
                    <NavLink to="/auth/login">
                        <Button variant="link">Back to login</Button>
                    </NavLink>
                </CardFooter>
            </Card>
        </main>
    );
}
