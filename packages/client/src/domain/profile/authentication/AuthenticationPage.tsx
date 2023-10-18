import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TwoFactorSection } from './two-factor/TwoFactorSection';

function AuthenticationPage() {
    const twoFactorOptions: any = useLoaderData();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        if (twoFactorOptions != null) {
            setTwoFactorEnabled(true);
            setImageUrl(twoFactorOptions.imageUrl);
        } else {
            setTwoFactorEnabled(false);
            setImageUrl('');
        }
    }, [twoFactorOptions]);

    // const { user } = useOutletContext<any>();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [registrationOptions, setRegistrationOptions] = useState('');
    const [registrationOptionsResponse, setRegistrationOptionsResponse] = useState('');
    const [registrationVerification, setRegistrationVerification] = useState('');
    const navigate = useNavigate();

    const register = async () => {
        const response = await fetch('/api/auth/webauthn/registration/options');
        const options = await response.json();
        setRegistrationOptions(options);
        let attResp;
        try {
            // Pass the options to the authenticator and wait for a response
            attResp = await startRegistration(options);
            setRegistrationOptionsResponse(JSON.stringify(attResp, null, 4));
        } catch (error: any) {
            // Some basic error handling
            setError(error);
            console.error(error.cause);
            throw error;
        }

        const verificationResp = await fetch('/api/auth/webauthn/registration/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attResp),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();
        setRegistrationVerification(verificationJSON);

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            setSuccess('Success!');
        } else {
            setSuccess(`Oh no, something went wrong! Response: <pre>${JSON.stringify(verificationJSON)}</pre>`);
        }
    };

    return (
        <main className="space-y-6">
            <section>
                <div className="text-lg font-semibold">Passkeys</div>
                <Separator className="mb-6 mt-2" />
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Passkeys are a password replacement that validates your identity using touch, facial
                        recognition, a device password, or a PIN.
                    </p>
                    <Button onClick={register}>Register</Button>
                    {registrationOptions && (
                        <>
                            <h2>Registration Options</h2>
                            <pre>{JSON.stringify(registrationOptions, null, 4)}</pre>
                        </>
                    )}
                    {registrationOptionsResponse && (
                        <>
                            <h2>Registration Options Response</h2>
                            <pre>{registrationOptionsResponse}</pre>
                        </>
                    )}
                    {registrationVerification && (
                        <>
                            <h2>Registration Verification response</h2>
                            <pre>{JSON.stringify(registrationVerification, null, 4)}</pre>
                        </>
                    )}
                    {error && <div>{JSON.stringify(error, null, 4)}</div>}
                    {success && <div dangerouslySetInnerHTML={{ __html: success }} />}
                </div>
            </section>

            <TwoFactorSection imageUrl={imageUrl} isEnabled={twoFactorEnabled} />
        </main>
    );
}

AuthenticationPage.loader = () => fetch('/api/auth/two-factor');

export default AuthenticationPage;
