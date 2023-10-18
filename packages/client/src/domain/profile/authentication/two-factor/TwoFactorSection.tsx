import { PropsWithChildren, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function TwoFactorSection({ imageUrl, isEnabled }: PropsWithChildren<any>) {
    const [token, setToken] = useState('');
    const [twoFactorQR, setTwoFactorQR] = useState(imageUrl);
    useEffect(() => {
        if (imageUrl) setTwoFactorQR(imageUrl);
    }, [imageUrl]);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(isEnabled);
    useEffect(() => {
        setIsTwoFactorEnabled(isEnabled);
    }, [isEnabled]);

    const onEnableTwoFactor = async (isChecked: boolean) => {
        if (isChecked) {
            const response = await fetch('/api/auth/two-factor/enable', {
                method: 'put',
            });
            const imageUrl = await response.text();
            setTwoFactorQR(imageUrl);
            setIsTwoFactorEnabled(true);
        } else {
            setTwoFactorQR('');
            setIsTwoFactorEnabled(false);
        }
    };

    const verifyToken = async () => {
        await fetch('/api/auth/two-factor/verify', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
    };

    return (
        <section>
            <div className="text-lg font-semibold">Two-Factor Authentication</div>
            <Separator className="mb-6 mt-2" />
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="2fa-enable" checked={isTwoFactorEnabled} onCheckedChange={onEnableTwoFactor} />
                    <Label htmlFor="2fa-enable">Enable 2FA</Label>
                </div>
                {twoFactorQR && (
                    <div className="flex-col space-y-4">
                        <img src={twoFactorQR} alt="2fa qr code" />
                        <div className="flex space-x-4">
                            <Input type="number" value={token} onChange={(e) => setToken(e.target.value)} />
                            <Button onClick={verifyToken}>Verify Token</Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
