// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

interface LoginProps {
    onLogin: (token: string) => Promise<boolean>;
}

const Login = ({ onLogin }: LoginProps) => {
    const navigate = useNavigate();
    const [accessToken, setAccessToken] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const success = await onLogin(accessToken);

        if (success) {
            toast.success("Login successful! Welcome back.");
            navigate("/admin");
        } else {
            setError("Invalid access token. Please contact your administrator.");
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Trusted Login</CardTitle>
                        <CardDescription>
                            Enter your access token to manage community reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="accessToken">Access Token</Label>
                                <div className="relative">
                                    <Input
                                        id="accessToken"
                                        type={showToken ? "text" : "password"}
                                        placeholder="Enter your access token"
                                        value={accessToken}
                                        onChange={(e) => setAccessToken(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowToken(!showToken)}
                                    >
                                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Verifying..." : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Login;