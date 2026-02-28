import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
                <p className="text-slate-500 text-sm mt-2">Start your 14-day free trial</p>
            </div>

            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        placeholder="John"
                    />
                    <Input
                        label="Last Name"
                        placeholder="Doe"
                    />
                </div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="name@company.com"
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                />

                <div className="text-sm text-slate-500">
                    By creating an account, you agree to our{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                        Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                        Privacy Policy
                    </Link>.
                </div>

                <Link href="/dashboard" className="block w-full">
                    <Button className="w-full" size="lg">
                        Create Account
                    </Button>
                </Link>
            </form>

            <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
