import classes from './register.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const RegisterPage = () => {
    return (
        <main className={classes.registerPage}>
            <Card>
                <CardHeader className="mb-4">
                    <CardTitle className="text-center">Let&apos;s start your journey</CardTitle>
                    <CardDescription className="text-center">Create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action="/api/auth/register"
                        method="post"
                        name="registerForm"
                        className={classes.registerForm}
                    >
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            className="mb-4"
                            required
                            autoFocus
                        />

                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="mb-4"
                            required
                            minLength={8}
                        />

                        <Input type="password" name="passwordConfirm" placeholder="Confirm Password" required />

                        <Separator className="my-8" />

                        <Input type="text" name="firstName" placeholder="First name" className="mb-4" />

                        <Input type="text" name="lastName" placeholder="Last name" className="mb-4" />

                        <Button type="submit">Sign Up</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default RegisterPage;
